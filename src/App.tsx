import React, { useCallback, useEffect, useState } from 'react';
import './styling/App.css';

import * as firebaseAuth from "@firebase/auth";
import { authInstance } from './firebase/Firebase';

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

import { getSurveys } from './firebase/Queries/SurveyQueries';
import { setLabels, setSurveys, setJobOpps } from './redux/dataSlice.ts';
import { getLabels } from './firebase/Queries/LabelQueries';
import { getJobOpps } from './firebase/Queries/JobQueries';


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

    const setSurveyState = useCallback(async () => {
        const surveys = await getSurveys();
        dispatch(setSurveys(surveys));
    }, [dispatch]);
    const setLabelState = useCallback(async () => {
        const labels = await getLabels();
        dispatch(setLabels(labels));
    }, [dispatch])
    const setJobState = useCallback(async () => {
        const jobOpps = await getJobOpps();
        dispatch(setJobOpps(jobOpps));
    }, [dispatch]);

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
        });
    }, [setSurveyState, setLabelState, setJobState])

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
