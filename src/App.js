import React from 'react';
import './App.css';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Home from './react components/Home'

Amplify.configure(awsconfig);

//eventually add in  socialProviders={['google']}
function App() {

  return (
    <Authenticator variation="modal">
      {({ signOut, user }) => (
        <div className="App">
          <Home signOut={signOut} user={user}/>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
