import { assert } from 'chai';
import { WrappedFunction } from 'firebase-functions-test/lib/main';

import { testEnv, myFunctions } from './Init';
import { firestore } from '../src/Utility';

import { testUserContext } from './Utility';
import { ReturnedSurveyResponse } from '../../src/firebase/Types';
import { surveyTestData } from './SurveyTestData';


let submitSurveyWrapped: WrappedFunction;


describe('Submit Survey Function Unit Tests', () => {
    before(async () => {
        submitSurveyWrapped = testEnv.wrap((await myFunctions).submitSurvey);
    });

    after(() => {
        testEnv.cleanup();
    });

    it('should get correct scores and add to firestore', async () => {
        const response = await submitSurveyWrapped(surveyTestData.response, testUserContext.owner) as ReturnedSurveyResponse;
        const results = new Map<string, number>(response.recommendedJobs.map(r => [r.jobOppId, r.score]));


        // Test for correctly calculated scores
        let jobOppId = (await firestore.collection('JobOpps').where('jobName', '==', '1,2').get()).docs[0].id;
        assert.isAbove(results.get(jobOppId) as number, 0);

        jobOppId = (await firestore.collection('JobOpps').where('jobName', '==', '3,4').get()).docs[0].id;
        assert.isBelow(results.get(jobOppId) as number, 0);

        jobOppId = (await firestore.collection('JobOpps').where('jobName', '==', '1,3').get()).docs[0].id;
        assert.equal(results.get(jobOppId) as number, 0);


        // Wait for the survey function to add the response to Firestore
        const promise = new Promise<void>((resolve) => {
            const unsubscribe = firestore.collection('SurveyResponse').onSnapshot(docs => {
                assert.equal(docs.docs.length, 1);

                const surveyResponse = docs.docs[0].data();
                assert.exists(surveyResponse.recommendedJobs);

                unsubscribe();
                resolve();
            });
        });

        await promise;
    });
});
