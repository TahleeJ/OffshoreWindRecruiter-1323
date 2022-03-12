/**
 * **WARNING:**
 * 
 * This file is crucial to the set up of the testing environment. 
 * The ordering of everything in this file is important and should 
 * NOT be touched or rearranged!
 */

import * as functionsTest from 'firebase-functions-test';
import * as path from 'path';
import { initTestDocs } from './Utility';

const serviceAccount = path.resolve("serviceAccountKey.json");
export const testEnv = functionsTest({
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
}, serviceAccount);


export async function initializeTestEnvironment() {
    let myFunctions = require('../src/index.js');

    await initTestDocs();

    return myFunctions;
}
