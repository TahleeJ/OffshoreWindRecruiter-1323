import React from 'react';
import logo from './logo.svg';
import './App.css';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsconfig);

//eventually add in  socialProviders={['google']}
function App() {

  return (
    <Authenticator variation="modal">
      {({ signOut, user }) => (
        <div className="App">
          {console.log(user)}
          
          <h1>{user.attributes.email}</h1>

          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
