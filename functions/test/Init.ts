/**
 * **WARNING:**
 * 
 * This file is crucial to the set up of the testing environment. 
 * The ordering of everything in this file is important and should 
 * NOT be rearranged! If a function has been created and/or renamed,
 * simply add/change the associated name in the "functions" variable.
 */

import { initTestDocs } from './Utility';
import * as functionsTest from 'firebase-functions-test';
 
/**
 * Initializes the testing environment with test users and functions
 * to be emulated
 * 
 * @returns the in-development cloud functions
 */
export async function initializeTestEnvironment() {
    const operatingFunctions = require('../src/index.js');
    let functions = { 
        updatePermissions: operatingFunctions.updatePermissions,
        createNewUser: operatingFunctions.createNewUser,
        submitSurvey: operatingFunctions.submitSurvey
    };

    await initTestDocs();
 
    return functions;
}
 
export const testEnv = functionsTest();
export const myFunctions = initializeTestEnvironment();