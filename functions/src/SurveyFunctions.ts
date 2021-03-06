import * as functions from 'firebase-functions';

import { assertValidRequest, firestore } from './Utility';
import { errors } from './Errors';
import { ReturnedSurveyResponse, JobOpp, RecommendedJob, SentSurveyResponse, SurveyTemplate, StoredSurveyResponse, ComponentType } from '../../src/firebase/Types';
import { Timestamp } from 'firebase-admin/firestore';


// Start loading Job Opps early and possibly reuse in future invocations
const jobOpps = (firestore.collection('JobOpps') as FirebaseFirestore.CollectionReference<JobOpp>).get();


/**
 * Stores submitted survey in Firestore then returns the recommended jobs.
 *
 * The recommendation algorithm is as follows:
 * 1. Calculate the raw scores for each label which will be used to create a binomial distribution to
 *    approximate the label's probability distribution.
 * 2. Calculate the percentile for each label using a normal approximation to the binomial distribution.
 * 3. The strength of each job will then be calculated as the sum of all percentiles of each label the
 *    job is paired with.
 *
 * @param request Contains the administered survey information
 * @param context Function caller user's authentication information
 * @return Recommended jobs and score information for each label
 */
export const submitSurvey = functions.https.onCall(async (request: SentSurveyResponse, context) => {
    assertValidRequest(context);


    const survey = (await (firestore.collection('Survey') as FirebaseFirestore.CollectionReference<SurveyTemplate>)
        .doc(request.surveyId).get()).data();
    if (survey === undefined || survey.components.length !== request.answers.length)
        throw errors.illegalArgument.surveyResponse;


    // Calculate raw scores [Answered score, Expected score, Max score] for each label

    const rawScores = new Map<string, number[]>(); // Maps labelIds to [Answered score, Expected score, Max score]

    // Increments rawScores[scoreIndex] for each label by incrementValue
    function incrementScores(scoreIndex: number, labelIds: string[], incrementValue: number) {
        labelIds.forEach(l => {
            if (!rawScores.has(l))
                rawScores.set(l, [0, 0, 0]);

            rawScores.get(l)![scoreIndex] += incrementValue;
        });
    }

    survey.components.forEach((currentComponent, currentComponentIndex) => {
        const currentAnswers = currentComponent.answers;

        /**
         * Scale: [0-4]
         * MultipleChoice: [0-n]
         * FreeResponse: string
         */
        const chosenAnswer = request.answers[currentComponentIndex] as number;
        let expectedScore: number = 0;

        // Increment labels that were answered
        switch (currentComponent.componentType) {
        case ComponentType.Scale: {
            const normalizedAnswer = chosenAnswer / 4;
            incrementScores(0, currentAnswers[0].labelIds, normalizedAnswer);

            expectedScore = 0.5;
            break;
        }
        case ComponentType.MultipleChoice:
            incrementScores(0, currentAnswers[chosenAnswer].labelIds, 1);

            expectedScore = 1 / currentAnswers.length;
            break;

        // Skip any free response questions, image components, or text components
        }

        // Increment scores for labels that could have been answered
        currentAnswers.forEach(a => incrementScores(1, a.labelIds, expectedScore));
        currentAnswers.forEach(a => incrementScores(2, a.labelIds, 1));
    });


    // Calculate score vector where each element is the percentile score for a label normalized to (-1, 1)

    const getPercentile = (x: number) => Math.tanh(x / 1.1757849338635604); // Approximating CDF of normal distribution normalized to (-1, 1) https://www.desmos.com/calculator/cfq0o771eq

    const scores = new Map<string, number>();
    const labelScores = new Map<string, [number, number]>();
    for (const [key, value] of rawScores) {
        const [x, mean, n] = value;
        const stdDev = Math.sqrt(mean * (1 - mean / n));
        const score = stdDev !== 0 ? getPercentile((x - mean) / stdDev) : 1;

        scores.set(key, score);
        labelScores.set(key, [x / n, score]);
    }


    // Calculate dot product of the score vector and each job vector then normalize to (-1, 1)

    const rankings: RecommendedJob[] = [];

    (await jobOpps).forEach(job => {
        const jobData = job.data();
        if (jobData.labelIds.length === 0)
            return;

        let jobScore = jobData.labelIds.reduce((sum, l) => sum + scores.getOrDefault(l, 0), 0);
        jobScore /= jobData.labelIds.length; // Normalize score to (-1, 1)

        rankings.push({ score: jobScore, jobOppId: job.id });
    });

    rankings.sort((a, b) => a.score - b.score);


    // Save SurveyResponse with job rankings and then return the top 10 recommended jobs

    firestore.collection('SurveyResponse').add({
        surveyId: request.surveyId,
        taker: request.taker,
        created: Timestamp.now().toMillis(),

        components: request.answers.map((answer, index) => {
            return {
                componentHash: survey.components[index].hash,
                answer: answer
            };
        }),

        recommendedJobs: rankings
    } as StoredSurveyResponse);


    const response: ReturnedSurveyResponse = {
        recommendedJobs: rankings.slice(0, 10),
        labelScores: Object.fromEntries(labelScores)
    };

    return response;
});
