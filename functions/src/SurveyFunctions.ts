import * as functions from 'firebase-functions';

import { assertValidRequest, firestore } from './Utility';
import { errors } from "./Errors";
import { ReturnedSurveyResponse, JobOpp, QuestionType, RecommendedJob, AdministeredSurveyResponse, SurveyTemplate } from '../../src/firebase/Types';
import { Timestamp } from 'firebase-admin/firestore';


/**
 * Stores submitted survey in Firestore then returns the recommended jobs.
 */ 
export const submitSurvey = functions.https.onCall(async (request: AdministeredSurveyResponse, context) => {
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
        labelIds.forEach(l => {
            if (!rawScores.has(l))
                rawScores.set(l, [0, 0, 0]);

            rawScores.get(l)![scoreIndex] += incrementValue;
        });
    }

    survey.questions.forEach((currentQuestion, currentQuestionIndex) => {
        const currentAnswers = currentQuestion.answers;

        /**
         * Scale: [0-4]
         * MultipleChoice: [0-n]
         * FreeResponse: string
         */
        const chosenAnswer = request.answers[currentQuestionIndex] as number; 
        let expectedScore: number = 0;
        
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
    const labelScores = new Map<string, [number, number]>();
    for (const [key, value] of rawScores) {
        const [x, mean, n] = value;
        const stdDev = Math.sqrt(mean * (1 - mean / n));
        const score = stdDev !== 0 ? getPercentile((x - mean) / stdDev) : 1;
        
        scores.set(key, score);
        labelScores.set(key, [x / mean, score]);
    }


    // Calculate dot product of the score vector and each job vector then normalize to (-1, 1)

    const rankings: RecommendedJob[] = [];

    (await jobOpps).forEach(job => {
        const jobData = job.data();
        if (jobData.labelIds.length === 0)
            return;

        let jobScore = jobData.labelIds.reduce((sum, l) => sum + scores.getOrDefault(l, 0), 0);
        jobScore /= jobData.labelIds.length;  // Normalize score to (-1, 1)

        rankings.push({ score: jobScore, jobOppId: job.id });
    });
    
    rankings.sort((a, b) => a.score - b.score);


    // Save SurveyResponse with job rankings and then return the top 10 recommended jobs
    
    firestore.collection("SurveyResponse").add({
        surveyId: request.surveyId,
        taker: request.taker,
        answers: request.answers,
        recommendedJobs: rankings,
        created: Timestamp.now().toMillis()
    } as AdministeredSurveyResponse);


    const response: ReturnedSurveyResponse = {
        recommendedJobs: rankings.slice(0, 10),
        labelScores: labelScores
    };

    return response;
});
