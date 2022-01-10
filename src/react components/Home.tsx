import React, { useContext } from 'react';
import Amplify from 'aws-amplify';
import Header from "./Header";
import { UserContext } from '../App';

interface props {
    signOut: (data?: Record<string | number | symbol, any> | undefined) => void;
}
const Home: React.FC<props> = ({ signOut }) => {
    const user = useContext(UserContext);
    console.log(user); //this is to figure out what is all on the user type

    return (
        <>
            <Header />
            <div id="home" className='container'>
                <h1 id="account">Account Management</h1>
                <p id="userEmail">{user.attributes.email}</p>
                <button className='gray' onClick={signOut}>Sign out</button>
            </div>
        </>
    );
}

export default Home;