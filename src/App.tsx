import React, { useEffect, useState } from 'react';
import './styling/App.css';

import * as firebaseAuth from '@firebase/auth';
import { authInstance } from './firebase/Firebase';

import Home from './react components/Home';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { changePage, PageType } from './redux/navigationSlice';
import AdminHome from './react components/AdminHome';
import Header from './react components/Header';
import SurveyHome from './react components/survey/SurveyHome';
import AdminManager from './react components/AdminManager';
import LabelManager from './react components/label/LabelManager';
import JobManager from './react components/Job/JobManager';
import AuthPage from './react components/AuthPage';
import Analytics from './react components/Analytics';

import { getSurveyResponses, getSurveys } from './firebase/Queries/SurveyQueries';
import { setLabels, setSurveys, setJobOpps, setSurveyResponses } from './redux/dataSlice.ts';
import { getLabels } from './firebase/Queries/LabelQueries';
import { getJobOpps } from './firebase/Queries/JobQueries';
import { assertIsAdmin, getUser } from './firebase/Queries/AdminQueries';
import InfoPage from './react components/InfoPage';
import { PermissionLevel } from '../src/firebase/Types';

const getOverallPageFromType = (type: PageType) => {
    switch (type) {
    case PageType.Home: return <Home />;
    case PageType.AdminHome: return <AdminHome />;
    case PageType.Survey: return <SurveyHome />;
    case PageType.AdminManage: return <AdminManager />;
    case PageType.LabelManage: return <LabelManager />;
    case PageType.JobManage: return <JobManager />;
    case PageType.Analytics: return <Analytics />;
    case PageType.InfoPage: return <InfoPage />;
    }
};

let firstLogin = false;

const App: React.FC = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const pageType = useAppSelector(s => s.navigation.currentPage);
    const appDispatch = useAppDispatch();
    firebaseAuth.setPersistence(authInstance, firebaseAuth.browserLocalPersistence);

    useEffect(() => {
        authInstance.onAuthStateChanged(async (user) => {
            setLoggedIn(user != null);
            if (!isLoggedIn)
                return;

            // Set the redux state with Firestore's data
            try {
                if (await assertIsAdmin(user?.uid!)) {
                    (async () => {
                        appDispatch(setLabels(await getLabels()));
                        appDispatch(setJobOpps(await getJobOpps()));
                        appDispatch(setSurveys(await getSurveys()));
                        appDispatch(setSurveyResponses(await getSurveyResponses()));
                    })();
                } else {
                    (async () => {
                        appDispatch(setLabels(await getLabels()));
                        appDispatch(setSurveys(await getSurveys()));
                    })();
                }

                const permissionLevel = (await getUser(user?.uid!))!.permissionLevel;

                if (permissionLevel === PermissionLevel.None && !firstLogin) {
                    firstLogin = true;
                    appDispatch(changePage({ type: PageType.InfoPage })); // change to PageType.InfoPage when info page is created
                } else if (permissionLevel === PermissionLevel.Navigator && !firstLogin) {
                    firstLogin = true;
                    appDispatch(changePage({ type: PageType.Survey }));
                } else if (!firstLogin) {
                    firstLogin = true;
                    appDispatch(changePage({ type: PageType.AdminHome }));
                }
            } catch (e) {}
        });
    });


    return (
        <>
            {isLoggedIn
                ? <>
                    <Header />
                    {
                        getOverallPageFromType(pageType)
                    }
                </>
                : <AuthPage />
            }
        </>
    );
};

export default App;
