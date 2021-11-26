import React from 'react';
import Amplify from 'aws-amplify';
import Header from "./Header";

interface props {
    signOut: (data?: Record<string | number | symbol, any> | undefined) => void;
    user: any;
}
const Home: React.FC<props> = ({signOut, user}) => {

    return (
        <>
            <Header />
            <div id="container">
                <h1 id = "account">Account Management</h1>
                <p id = "userEmail">{user.attributes.email}</p>
                <button id = 'signOut' onClick={signOut}>Sign out</button>
            </div>
        </>
    );
}

export default Home;