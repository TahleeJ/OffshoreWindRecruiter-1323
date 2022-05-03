import { createContext } from 'react';
import { initializeApp } from 'firebase/app';
import * as firebaseAuth from '@firebase/auth';
import * as firestore from '@firebase/firestore';
import * as functions from '@firebase/functions';
import * as analytics from '@firebase/analytics';

import { ReturnedSurveyResponse, PermissionLevel, SentSurveyResponse } from './Types';


// Firebase config read from .env file
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


export const firebaseApp = initializeApp(firebaseConfig);

export const AuthContext = createContext({} as any);
export const authInstance = firebaseAuth.getAuth(firebaseApp);
export const firestoreInstance = firestore.getFirestore(firebaseApp);
export const functionsInstance = functions.getFunctions(firebaseApp);
export const analyticsInstance = analytics.getAnalytics(firebaseApp);


// Firebase functions
export const updatePermissions = functions.httpsCallable<{ userEmail: string, newPermissionLevel: number }, undefined>(functionsInstance, 'updatePermissions');
export const checkAdmin = functions.httpsCallable<undefined, { isAdmin: PermissionLevel }>(functionsInstance, 'checkAdmin');
export const getBigQueryData = functions.httpsCallable<{queryString: string, navigatorEmail?: string}>(functionsInstance, 'getBigQueryData');
export const submitSurvey = functions.httpsCallable<SentSurveyResponse, ReturnedSurveyResponse>(functionsInstance, 'submitSurvey');

// Local function testing
// functions.connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
