/**
 * **WARNING:**
 * 
 * This file is crucial to the set up of the testing environment. 
 * The ordering of everything in this file is important and should 
 * NOT be touched or rearranged!
 */

import * as functionsTest from 'firebase-functions-test';
import { initTestDocs } from './Utility';

export const testEnv = functionsTest();

export async function initializeTestEnvironment() {
    let myFunctions = require('../src/index.js');

    await initTestDocs();

    return myFunctions;
}
