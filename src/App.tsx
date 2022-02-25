import React, { useEffect, useState } from 'react';
import './styling/App.css';

import * as firebaseAuth from "@firebase/auth";
import * as firestore from "@firebase/firestore";
import { authInstance, firestoreInstance } from './firebase/Firebase';
import db from './firebase/Firestore';
// import { addNewUser } from './firebase/Firebase';
import { PermissionLevel } from './firebase/Types';

import Home from './react components/Home'
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { PageType } from './redux/navigationSlice';
import AdminHome from './react components/AdminHome';
import Header from './react components/Header';
import SurveyHome from './react components/survey/SurveyHome';
import AdminManager from './react components/AdminManager';
import LabelManager from './react components/label/LabelManager';
import JobManager from './react components/Job/JobManager';
import AuthPage from './react components/AuthPage';

import { getSurveys } from './firebase/SurveyQueries';
import { setLabels, setSurveys, setJobOpps } from './redux/dataSlice.ts';
import { getLabels } from './firebase/LabelQueries';
import { getJobOpps } from './firebase/JobQueries';


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
    const dispatch = useAppDispatch();

    async function setSurveyState() {
        const surveys = await getSurveys(firestoreInstance);
        dispatch(setSurveys(surveys));
    }
    async function setLabelState() {
        const labels = await getLabels();
        dispatch(setLabels(labels));
    }
    async function setJobState() {
        const jobOpps = await getJobOpps();
        dispatch(setJobOpps(jobOpps));  
    }

    useEffect(() => {
        setSurveyState();
        setLabelState();
        setJobState();

        authInstance.onAuthStateChanged(async (user) => {
            if (!user) {
                setLoggedIn(false);
                return;
            }

            setLoggedIn(true);

            // Add new user to Firestore if not already present in database
            firestore.setDoc(
                firestore.doc(db.Users, user.uid), {
                    email: user.email,
                    permissionLevel: PermissionLevel.None,
                }
            );
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
