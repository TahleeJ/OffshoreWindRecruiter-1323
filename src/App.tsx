import React, { createContext } from 'react';
import './styling/App.css';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Home from './react components/Home'
import { useAppSelector } from './redux/hooks';
import { PageType } from './redux/navigationSlice';
import AdminHome from './react components/AdminHome';
import Header from './react components/Header';
import SurveyHome from './react components/survey/SurveyHome';
import AdminManager from './react components/AdminManager';
import LabelManager from './react components/LabelManager';

import JobManager from './react components/Job/JobManager';
import JobCreator from './react components/Job/JobCreator';
import JobEditor from './react components/Job/JobEditor';
import DeletePopup from './react components/Job/DeletePopup';


// Multiple redirect URI handling for OAuth 
const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// Assuming you have two redirect URIs, and the first is for localhost and second is for production
const [
    localRedirectSignIn,
    productionRedirectSignIn,
] = awsconfig.oauth.redirectSignIn.split(",");

const [
    localRedirectSignOut,
    productionRedirectSignOut,
] = awsconfig.oauth.redirectSignOut.split(",");

awsconfig.oauth.redirectSignIn = isLocalhost ? localRedirectSignIn : productionRedirectSignIn;
awsconfig.oauth.redirectSignOut = isLocalhost ? localRedirectSignOut : productionRedirectSignOut;

Amplify.configure(awsconfig);

export const AuthContext = createContext({} as any);

const getOverallPageFromType = (type: PageType) => {
    switch (type) {
        case PageType.Home: return <Home />
        case PageType.AdminHome: return <AdminHome />
        case PageType.Survey: return <SurveyHome />
        case PageType.AdminManage: return <AdminManager />
        case PageType.LabelManage: return <LabelManager />

        case PageType.JobManage: return <JobManager />
        case PageType.JobCreator: return <JobCreator />
        case PageType.JobEditor: return <JobEditor />
    }
}

const App: React.FC = () => {
    const pageType = useAppSelector(s => s.navigation.currentPage);

    return (
        <Authenticator socialProviders={['google']} variation="modal" loginMechanisms={['email']}>
            {({ signOut, user }) => (
                <AuthContext.Provider value={{ user, signOut }}>
                    <Header />
                    {//we show the page depending on which PageType is currently in our redux state
                        getOverallPageFromType(pageType)}
                </AuthContext.Provider>
            )}
        </Authenticator>
    );
}

export default App;