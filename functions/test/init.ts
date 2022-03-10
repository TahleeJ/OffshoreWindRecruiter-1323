const admin = require('firebase-admin');
// const path = require('path');
// const serviceAccountKey = require(path.resolve('serviceAccountKey.json'));
// const { initializeApp } = require('firebase-admin/app');
// import * as auth from '@firebase/auth';
// import * as firestore from "@firebase/firestore";
// const admin = require('firebase-admin');
import { applicationDefault } from "firebase-admin/app";

// var testEnvVar;
// export var testEnv = testEnvVar;

if (!admin.apps.length) {
    // testEnvVar = functionsTest(projectConfig, path.resolve('serviceAccountKey.json'));
    admin.initializeApp({
        credential: applicationDefault()
    });

    console.log("hit");
} else {
    admin.app();
}

const adminAuth = require('firebase-admin/auth');
const adminFirestore = require('firebase-admin/firestore');

// // require('dotenv').config({ path: `/OffshoreWindJobNavigator/functions/.env.dev`});
require('custom-env').env('prod');

// const firebaseApp = initializeApp({
//     credential: admin.credential.cert(serviceAccountKey),
//     databaseURL: process.env.REACT_APP_FIREBASE_DATABASE
// });

export const adminAuthInstance = adminAuth.getAuth();
export const adminFirestoreInstance = adminFirestore.getFirestore();
// // export const authInstance = auth.getAuth(firebaseApp);
// export const firestoreInstance = firestore.getFirestore(firebaseApp);
// export const firebaseAuth = auth;
// // const adminImport = require('firebase-admin');
// // adminImport.initializeApp();
// // export const admin = adminImport;