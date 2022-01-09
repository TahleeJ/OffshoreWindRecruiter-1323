import React, { createContext } from 'react';
import './App.css';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Home from './react components/Home'

Amplify.configure(awsconfig);
const defaultUser: any = {};
export const UserContext = createContext(defaultUser);

/** This enum could be used in the future to distinguish between differen types of pages */
export enum PageType {
    AdminHome,
    Home,
    Survey,
    LabelManage,
    JobManage,
    AdminManage,
}

/** TODO: eventually add in socialProviders={['google']} */
const App: React.FC = () => {


    return (
        <Authenticator variation="modal" loginMechanisms={['email']}>
            {({ signOut, user }) => (
                <UserContext.Provider value={user}>
                    <Home signOut={signOut} />
                </UserContext.Provider>
            )}
        </Authenticator>
    );
}

export default App;
