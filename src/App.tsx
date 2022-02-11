import React, { createContext } from 'react';
import './styling/App.css';
import { initializeApp } from "firebase/app";
import * as firebaseui from 'firebaseui';
import * as firebaseAuth from "@firebase/auth";
import * as firestore from "@firebase/firestore";
import * as functions from "@firebase/functions";

import Home from './react components/Home'
import { useAppSelector } from './redux/hooks';
import { PageType } from './redux/navigationSlice';
import AdminHome from './react components/AdminHome';
import Header from './react components/Header';
import SurveyHome from './react components/survey/SurveyHome';
import AdminManager from './react components/AdminManager';
import LabelManager from './react components/LabelManager';
import JobManager from './react components/Job/JobManager';

// Your web app's Firebase configuration
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

export const firebaseApp = initializeApp(firebaseConfig);
export const AuthContext = createContext({} as any);

const getOverallPageFromType = (type: PageType) => {
    switch (type) {
        case PageType.Home: return <Home />
        case PageType.AdminHome: return <AdminHome />
        case PageType.Survey: return <SurveyHome />
        case PageType.AdminManage: return <AdminManager />
        case PageType.LabelManage: return <LabelManager />
        case PageType.JobManage: return <JobManager />
    }
}

const authInstance = firebaseAuth.getAuth(firebaseApp);
const firestoreInstance = firestore.getFirestore(firebaseApp);
const functionsInstance = functions.getFunctions(firebaseApp);

const checkAdmin = functions.httpsCallable(functionsInstance, 'checkAdmin');

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(authInstance);

const App: React.FC = () => {
    authInstance.onAuthStateChanged(async (user) => {
        if (user) {
            alert("Good auth state");
            firestore.setDoc(
                firestore.doc(firestoreInstance, "User", `${user.uid}`), 
                {
                    email : user.email, 
                    isAdmin: true, 
                    dummyData: "dummmmmy"
                }
            );

            await checkAdmin({})
                .then((result) => {
                    const usableData: Object = result.data as Object;
                    const dataMap = new Map(Object.entries(usableData));
                    console.log(dataMap.get("isAdmin"));
                    console.log(dataMap.get("text"));
                })
        } else {
            alert("Bad auth state");
        }
    });

    console.log("firebase");
    const pageType = useAppSelector(s => s.navigation.currentPage);
    
    ui.start('#firebaseui-auth-container', {
        signInOptions: [
            {
                provider: firebaseAuth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: false
            },
            {
                provider: firebaseAuth.GoogleAuthProvider.PROVIDER_ID,
                customParameters: {
                    // Forces account selection even when one account
                    // is available.
                    prompt: 'select_account'
                }
            }
        ], 
    });

    firebaseAuth.setPersistence(authInstance, firebaseAuth.browserLocalPersistence);

    // getOverallPageFromType(pageType);

    return(
        <><Header /><div id="firebaseui-auth-container">

        </div></>
    );
}

export default App;