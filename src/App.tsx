import React, { createContext } from 'react';
import { Provider } from 'react-redux';
import './App.css';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Home from './react components/Home'
import { store } from './redux/store';

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
                <Provider store={store}>
                    <UserContext.Provider value={user}>
                        <Home signOut={signOut} />
                    </UserContext.Provider>
                </Provider>
            )}
        </Authenticator>
    );
}

export default App;