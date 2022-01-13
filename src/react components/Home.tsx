import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';

interface props {

}

const Home: React.FC<props> = (props) => {
    const auth = useContext(AuthContext);
    const user = auth.user;

    console.log(user); //this is to figure out what is all on the user type

    return (
        <div id="home" className='container'>
            <h1 id="account">Account Management</h1>
            <p id="userEmail">{user.attributes.email}</p>
        </div>
    );
}

export default Home;