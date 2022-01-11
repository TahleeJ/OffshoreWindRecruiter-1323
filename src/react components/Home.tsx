import React, { useContext } from 'react';
import Amplify from 'aws-amplify';
import Header from "./Header";
import { AuthContext } from '../App';

interface props {

}

const Home: React.FC<props> = (props) => {
    const auth = useContext(AuthContext);
    const signOut: (data?: Record<string | number | symbol, any> | undefined) => void = auth.signOut;
    const user = auth.user;

    console.log(user); //this is to figure out what is all on the user type

    return (
        <div id="home" className='container'>
            <h1 id="account">Account Management</h1>
            <p id="userEmail">{user.attributes.email}</p>
            <button className='gray' onClick={signOut}>Sign out</button>
        </div>
    );
}

export default Home;