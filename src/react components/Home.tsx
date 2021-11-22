import React from "react";
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
            <h1>{user.attributes.email}</h1>
            <button onClick={signOut}>Sign out</button>
        </>
    );
}

export default Home;