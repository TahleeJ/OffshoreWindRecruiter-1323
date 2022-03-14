/**
 * **WARNING:**
 * 
 * This file is crucial to the set up of the testing environment. 
 * The ordering of everything in this file is important and should 
 * NOT be touched or rearranged!
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
     let myFunctions = require('../src/index.js');
 
     await initTestDocs();
 
     return myFunctions;
 }
 
 export const testEnv = functionsTest();