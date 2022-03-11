import * as functions from 'firebase-functions';

import { assertValidRequest, firestore } from './Utility';
import { errors } from "./Errors";
import { JobOpp, QuestionType, RecomendedJob, SurveyResponse, SurveyTemplate } from '../../src/firebase/Types';


/**
 * Stores submitted survey in Firestore then returns the recomended jobs.
 */
export const submitSurvey = functions.https.onCall(async (request: SurveyResponse, context) => {
    assertValidRequest(context);
    
    
    const jobOpps = (firestore.collection("JobOpps") as FirebaseFirestore.CollectionReference<JobOpp>).get();  // Start loading early
    const survey = (await (firestore.collection("Survey") as FirebaseFirestore.CollectionReference<SurveyTemplate>)
        .doc(request.surveyId).get()).data();
    if (survey === undefined || survey.questions.length !== request.answers.length)
        throw errors.illegalArgument.surveyResponse;


    // Calculate raw scores [Answered score, Expected score, Max score] for each label
    
    const rawScores = new Map<string, number[]>();  // Maps labelIds to [Answered score, Expected score, Max score]

    // Increments rawScores[scoreIndex] for each label by incrementValue
    function incrementScores(scoreIndex: number, labelIds: string[], incrementValue: number) {
        labelIds.forEach(l => rawScores.getOrDefault(l, [0, 0, 0])[scoreIndex] += incrementValue);
    }

    survey.questions.forEach((currentQuestion, currentQuestionIndex) => {
        const currentAnswers = currentQuestion.answers;

        /**
         * Scale: [0-4]
         * MultipleChoice: [0-n]
         * FreeResponse: string
         */
        const chosenAnswer = request.answers[currentQuestionIndex] as number; 
        let expectedScore: number;
        
        // Increment labels that were answered
        switch (currentQuestion.questionType) {
            case QuestionType.Scale:
                const normalizedAnswer = chosenAnswer / 4;
                incrementScores(0, currentAnswers[0].labelIds, normalizedAnswer);

                expectedScore = .5;
                break;
            case QuestionType.MultipleChoice:
                incrementScores(0, currentAnswers[chosenAnswer].labelIds, 1);

                expectedScore = 1 / currentAnswers.length;
                break;
            case QuestionType.FreeResponse:
                // Skip any free response questions
                return;
        }
        
        // Increment scores for labels that could have been answered
        currentAnswers.forEach(a => incrementScores(1, a.labelIds, expectedScore));
        currentAnswers.forEach(a => incrementScores(2, a.labelIds, 1));
    });

    
    // Calculate score vector where each element is the percentile score for a label normalized to (-1, 1)

    const getPercentile = (x: number) => Math.tanh(x / 1.1757849338635604);  // Approximating CDF of normal distribution normalized to (-1, 1) https://www.desmos.com/calculator/cfq0o771eq

    const scores = new Map<string, number>();
    for (const [key, value] of rawScores) {
        const [x, mean, n] = value;
        const stdDev = Math.sqrt(mean * (1 - mean / n));
        const score = getPercentile((x - mean) / stdDev);
        
        scores.set(key, score);
    }


    // Calulate dot product of the score vector and each job vector then normalize to (-1, 1)

    const rankings: (RecomendedJob & { jobOpp: JobOpp})[] = [];

    (await jobOpps).forEach(job => {
        const jobData = job.data();

        let jobScore = jobData.labelIds.reduce((sum, l) => sum + scores.getOrDefault(l, 0), 0);
        jobScore /= jobData.labelIds.length;  // Normalize score to (-1, 1)

        rankings.push({ score: jobScore, jobOppId: job.id, jobOpp: jobData });
    });
    
    rankings.sort((a, b) => a.score - b.score);


    // Save SurveyResponse with job rankings and then return the top 5 recomended jobs
    
    firestore.collection("SurveyResponse").add({
        surveyId: request.surveyId,
        taker: request.taker,
        answers: request.answers,
        recomendedJobs: rankings.map(j => ({score: j.score, jobOppId: j.jobOppId}))
    } as SurveyResponse);

    return rankings.map(j => ({score: j.score, jobOpp: j.jobOpp})).slice(0, 5);
});