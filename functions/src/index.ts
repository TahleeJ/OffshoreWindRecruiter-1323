import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { AuthData } from 'firebase-functions/lib/common/providers/https';

import { JobOpp, PermissionLevel, QuestionType, SurveyTemplate, SurveyResponse } from '../../src/firebase/Types';


admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();


const errors = {
    invalidUser: new functions.https.HttpsError("failed-precondition", "Invalid argument!", "The selected user is not a member of this application."),
    illegalArgument: {
        userEmail: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "You must choose a user to change permissions for."), 
        permissionLevel: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "You must choose a valid permission level using an integer value 0-2."),
        surveyResponse: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "Submitted survey not in correct format."),
    }, 
    unauthorized: new functions.https.HttpsError("permission-denied", "Unauthorized!", "You do not have the privileges necessary to make this call."), 
    applicationDisabled: new functions.https.HttpsError("failed-precondition", "Unauthorized!", "The application has disabled this action."),
};


function assertValidRequest(context: functions.https.CallableContext): asserts context is (functions.https.CallableContext & { auth: AuthData }) {
    if (context.auth === undefined) {
        functions.logger.log("Unauthorized function request with context: ", context);
        throw errors.unauthorized;
    }
}


async function getPermissionLevelByUid(uid: string): Promise<PermissionLevel>  {
    return (await firestore.collection("User").doc(uid).get()).data()?.permissionLevel;
}


/**
 * Called when a user creates an account, makes a new User with None as default permissions
 * https://firebase.google.com/docs/functions/auth-events
 */
exports.createNewUser = functions.auth.user().onCreate(async (user) => {
    return await firestore.collection("User").doc(user.uid)
        .set({ email: user.email, permissionLevel: PermissionLevel.None })
});


/**
 * Stores submitted survey in Firestore then returns the recomended jobs.
 */
exports.submitSurvey = functions.https.onCall(async (request: SurveyResponse, context) => {
    assertValidRequest(context);
    
    
    const survey = (await firestore.collection("Survey").doc(request.surveyId).get()).data() as SurveyTemplate | undefined;
    if (survey === undefined || survey.questions.length !== request.answers.length)
        throw errors.illegalArgument.surveyResponse;


    // Calculate scores for each label
    
    const scores = new Map<string, number[] | number>(); // Maps labelIds to [Answered scores, Expected score, Max score] and later to the percentile

    function incrementScores(scoreIndex: number, labelIds: string[], incrementValue: number) {
        labelIds.forEach(l => {
            if (!scores.has(l))
                scores.set(l, [0, 0, 0]);

            (scores.get(l) as number[])[scoreIndex] += incrementValue;
        });
    }

    for (let currentQuestionIndex = 0; currentQuestionIndex < survey.questions.length; currentQuestionIndex++) {
        const currentAnswers = survey.questions[currentQuestionIndex].answers;

        /**
         * Scale: [0-4]
         * MultipleChoice: [0-n]
         * FreeResponse: string
         */
        const chosenAnswer = request.answers[currentQuestionIndex]; 
        let expectedScore: number;
        
        // Increment labels that were answered
        switch (survey.questions[currentQuestionIndex].questionType) {
            case QuestionType.MultipleChoice:
                incrementScores(0, currentAnswers[chosenAnswer as number].labelIds, 1);

                expectedScore = 1 / currentAnswers.length;
                break;
            case QuestionType.Scale:
                const normalizedAnswer = chosenAnswer as number / 4;
                incrementScores(0, currentAnswers[0].labelIds, normalizedAnswer);

                expectedScore = .5;
                break;
            case QuestionType.FreeResponse:
                continue;
        }
        
        // Increment labels that could have been answered
        currentAnswers.forEach(a => incrementScores(1, a.labelIds, expectedScore));
        currentAnswers.forEach(a => incrementScores(2, a.labelIds, 1));
    }
    

    // Calulate score vector where each element is in the range (-1, 1)

    const getPercentile = (x: number) => Math.tanh(x / 1.1757849338635604);  // Approximating CDF of normal distribution scaled to (-1, 1) https://www.desmos.com/calculator/cfq0o771eq

    for (const [key, value] of scores) {
        const [x, mean, n] = value as number[];
        const stdDev = Math.sqrt(mean * (1 - mean / n));
        const score = getPercentile((x - mean) / stdDev);
        
        scores.set(key, score);  // Reuse map for memory performance, probably not worth it
    }


    // Get magnitude of each score vector projected onto job vector

    const jobOpps = await firestore.collection("JobOpps").get();
    const rankings: [number, JobOpp][] = [];

    jobOpps.forEach(job => {
        let jobScore = 0;
        const jobData = job.data as unknown as JobOpp;

        jobData.labelIds.forEach(l => {
            jobScore += scores.has(l) ? scores.get(l) as number : 0;
        })

        rankings.push([jobScore, jobData]);
    });
    
    rankings.sort((a, b) => a[0] - b[0]);


    // Return top 5 recomended jobs

    request.recomendedJobs = rankings.slice(0, 5)
    firestore.collection("SurveyResponse").add(request);

    return request.recomendedJobs;
});


/**
 * Checks whether the signed in user has administrator priviliges
 * 
 * @param request Parameters sent through function call (unused in this function)
 * @param context Function caller user's authentication information
 * @return whether the signed in user has at least administrator permissions
 */
exports.checkAdmin = functions.https.onCall(async (request, context) => {
    assertValidRequest(context);
    
    const permissionLevel = await getPermissionLevelByUid(context.auth.uid);

    return { isAdmin: permissionLevel !== PermissionLevel.None };
});



/**
 * Given function caller's required privileges, a selected user can
 * remove or give another user administrator privileges
 * 
 * @param request Parameters sent through function call:
 * {
 *      userEmail: string,
 *      newPermissionLevel: integer
 * }
 * 
 * @param context Function caller user's authentication information
 * @throw HttpsError if the user has invalid permissions, 
 *        the application has disabled the desired permissions action, or 
 *        if the provided arguments are invalid
 */
exports.updatePermissions = functions.https.onCall(async (request: { userEmail: string, newPermissionLevel: number }, context) => {
    assertValidRequest(context);


    if (request.userEmail == null)
        throw errors.illegalArgument.userEmail;

    if (request.newPermissionLevel == null || !(request.newPermissionLevel in PermissionLevel))
        throw errors.illegalArgument.permissionLevel;
    
    
    // Obtain the function caller's permission level
    const callerPermissionLevel = await getPermissionLevelByUid(context.auth.uid);
    
    // Flags to check in Firestore for legal owner permission change actions
    const flags = await firestore.collection("Flag").get().then(res => res.docs[0].data());

    // Obtain the selected user's information reference in Firestore
    let userRecord = null;
    try {
        userRecord = await auth.getUserByEmail(request.userEmail);
    } catch (error) {
        throw errors.invalidUser;
    }

    const userPermissionLevel = await getPermissionLevelByUid(userRecord.uid);
    
    // Determine new permissions level
    let newLevel = userPermissionLevel;
    switch (request.newPermissionLevel) {
        case PermissionLevel.Owner:
            if (flags.ownerPromoteFlag) {
                if (callerPermissionLevel !== PermissionLevel.Owner) {
                    throw errors.unauthorized;
                }

                newLevel = PermissionLevel.Owner;
            } else {
                throw errors.applicationDisabled;
            }
  
            break;
        case PermissionLevel.Admin:
            if (callerPermissionLevel < PermissionLevel.Admin) {
                throw errors.unauthorized;
            }

            newLevel = (userPermissionLevel > PermissionLevel.Admin) ? userPermissionLevel : PermissionLevel.Admin;

            break;
        case PermissionLevel.None:
            if (userPermissionLevel === PermissionLevel.Owner) {
                if (!flags.demoteOwner) {
                    throw errors.applicationDisabled;
                }
            }

            if (callerPermissionLevel !== PermissionLevel.Owner) {
                throw errors.unauthorized;
            }

            newLevel = PermissionLevel.None;

            break;
    }

    // Update permissions level
    await firestore.collection("User").doc(userRecord.uid).update({permissionLevel: newLevel});
});
