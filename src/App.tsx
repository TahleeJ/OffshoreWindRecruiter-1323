import React, { useEffect, useState } from 'react';
import './styling/App.css';

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

import { functionsInstance, authInstance } from './firebase/Firebase';
import db from './firebase/Firestore';
import { PermissionLevel, QuestionType, Survey } from './firebase/Types';

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
            var userDoc = await firestore.getDoc(firestore.doc(db.Users, user.uid));
            // Get email from user:    userDoc.data()?.email

            if (!userDoc.exists()) {
                firestore.setDoc(
                    firestore.doc(db.Users, user.uid),
                    {
                        email: user.email,
                        permissionLevel: PermissionLevel.Admin,
                    }
                );
            }         

            /*
            // Sample promote/demote admin usage            
            const updateAdmin = functions.httpsCallable(functionsInstance, 'updateAdmin');

            try {
                await updateAdmin({userEmail: <insert email here>, newPermissionLevel: PermissionLevel.Owner});

                console.log("Update success!");
            } catch (error) {
                const {code, details} = JSON.parse(JSON.stringify(error));

                switch (code) {
                    case "functions/failed-precondition":
                        console.log("The selected user is not a member of this application.");
                        break;
                    case "functions/invalid-argument":
                        console.log("You must choose a user to change permission for and whether to promote or demote them using an integer value 0-2.");
                        break;
                    case "functions/permission-denied":
                        console.log("You do not have the privileges necessary to make this call.");
                        break;
                }
            }
            */

            /*
            // Sample checkAdmin usage
            const checkAdmin = functions.httpsCallable(functionsInstance, 'checkAdmin');

            var result = await checkAdmin({});
            const usableData: Object = result.data as Object;
            const dataMap = new Map(Object.entries(usableData));
            console.log(dataMap.get("isAdmin"));
            */
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
