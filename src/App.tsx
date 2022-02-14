import React, { useEffect, useState } from 'react';
import './styling/App.css';

import { FirebaseError, initializeApp } from "firebase/app";
// import * as firebaseui from 'firebaseui';
import * as firebaseAuth from "@firebase/auth";
import * as firestore from "@firebase/firestore";
import * as functions from "@firebase/functions";
import { FunctionsError } from "@firebase/functions";

import Home from './react components/Home'
import { useAppSelector } from './redux/hooks';
import { PageType } from './redux/navigationSlice';
import AdminHome from './react components/AdminHome';
import Header from './react components/Header';
import SurveyHome from './react components/survey/SurveyHome';
import AdminManager from './react components/AdminManager';
import LabelManager from './react components/LabelManager';
import JobManager from './react components/Job/JobManager';
import AuthPage from './react components/AuthPage';

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

/** Every source file referencing any Firebase must include this before any other Firebase reference */
export const firebaseApp = initializeApp(firebaseConfig);

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
const updateAdmin = functions.httpsCallable(functionsInstance, 'updateAdmin');

const App: React.FC = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        authInstance.onAuthStateChanged(async (user) => {
            if (!user) {
                setLoggedIn(false);
                return;
            }

            setLoggedIn(true);

            // Add new user to Firestore if not already present in database
            var userDoc = await firestore.getDoc(firestore.doc(firestoreInstance, "User", `${user.uid}`));

            if (!userDoc.exists()) {
                firestore.setDoc(
                    firestore.doc(firestoreInstance, "User", `${user.uid}`),
                    {
                        email: user.email,
                        isAdmin: true,
                        owner: false
                    }
                );
            }         

            // Sample promote/demote admin usage
            try {
                await updateAdmin({userEmail: "seankaat@gmail.com", promote: true});
            } catch (error) {
                const {code, details} = JSON.parse(JSON.stringify(error));

                switch (code) {
                    case "functions/failed-precondition":
                        console.log("The selected user is not a member of this application.");
                        break;
                    case "functions/invalid-argument":
                        console.log("You must choose whether to promote or demote the selected user using true/false.");
                        break;
                    case "functions/permission-denied":
                        console.log("You do not have the privileges necessary to make this call.");
                        break;
                    default:
                        console.log("Update success!");
                        break;
                }
            }
        });
    }, [])

    const pageType = useAppSelector(s => s.navigation.currentPage);

    firebaseAuth.setPersistence(authInstance, firebaseAuth.browserLocalPersistence);

    return (
        <>
            {isLoggedIn ?
                <>
                    <Header />
                    {getOverallPageFromType(pageType)}
                </>
                : <AuthPage />
            }
        </>
    );
}

export default App;