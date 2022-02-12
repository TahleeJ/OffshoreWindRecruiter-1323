import React, { useEffect, useState } from 'react';
import './styling/App.css';

import { FirebaseError, initializeApp } from "firebase/app";
// import * as firebaseui from 'firebaseui';
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

const App: React.FC = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        authInstance.onAuthStateChanged(async (user) => {
            if (!user) {
                setLoggedIn(false);
                return;
            }

            setLoggedIn(true);

            //submit the user to the object store
            firestore.setDoc(
                firestore.doc(firestoreInstance, "User", `${user.uid}`),
                {
                    email: user.email,
                    isAdmin: true,
                    dummyData: "dummmmmy"
                }
            );

            // const result = await checkAdmin({})
            // const usableData: Object = result.data as Object;
            // console.log(usableData);
            // const dataMap = new Map(Object.entries(usableData));

            // console.log(dataMap.get("isAdmin"));
            // console.log(dataMap.get("text"));
            // console.log(dataMap);
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