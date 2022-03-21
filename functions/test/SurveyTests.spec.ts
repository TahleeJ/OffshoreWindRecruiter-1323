import { assert } from 'chai';
import { WrappedFunction } from 'firebase-functions-test/lib/main';

import { testEnv, myFunctions } from './Init';
import { firestore } from '../src/Utility';

import { testUserContext } from './Utility';
import { JobOpp } from '../../src/firebase/Types';
import { surveyTestData } from './SurveyTestData';

let submitSurveyWrapped: WrappedFunction;

describe("Submit Survey Function Unit Tests", () => {
    before(async () => {
        submitSurveyWrapped = testEnv.wrap((await myFunctions).submitSurvey);
    });
    
    after(() => {
        testEnv.cleanup();
    });

    it("should get correct scores and add to firestore", async () => {
        const resultsRaw = await submitSurveyWrapped(surveyTestData.response, testUserContext.owner) as { score: number, jobOpp: JobOpp }[];
        const results = new Map<string, number>(resultsRaw.map(r => [r.jobOpp.jobName, r.score]));

        assert.isAbove(results.get("1,2") as number, 0);
        assert.isBelow(results.get("3,4") as number, 0);
        assert.equal(results.get("1,3") as number, 0);

        const promise = new Promise<void>((resolve) => {
            const unsubscribe = firestore.collection("SurveyResponse").onSnapshot(docs => {
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