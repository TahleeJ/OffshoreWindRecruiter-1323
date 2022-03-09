import * as functions from 'firebase-functions';

import { assertValidRequest, firestore } from './Utility';
import { errors } from "./Errors";
import { JobOpp, QuestionType, SurveyResponse, SurveyTemplate } from '../../src/firebase/Types';


/**
 * Stores submitted survey in Firestore then returns the recomended jobs.
 */
export const submitSurvey = functions.https.onCall(async (request: SurveyResponse, context) => {
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
