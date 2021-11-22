import React from 'react';
import logo from './logo.svg';
import './App.css';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsconfig);


function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Hello {user.username}</h1>

            <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
