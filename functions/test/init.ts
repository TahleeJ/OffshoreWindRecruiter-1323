import * as functionsTest from 'firebase-functions-test';
import * as adminApp from 'firebase-admin/app';
import * as adminAuth from 'firebase-admin/auth';
import * as adminFirestore from 'firebase-admin/firestore';
import * as path from 'path';

// require('custom-env').env('dev');

const serviceAccount = path.resolve("serviceAccountKey.json");

const myApp = adminApp.initializeApp({
    credential: adminApp.cert(serviceAccount),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
}, "admin app");

export const auth = adminAuth.getAuth(myApp);
export const firestore = adminFirestore.getFirestore(myApp);
export const testEnv = functionsTest({}, serviceAccount);