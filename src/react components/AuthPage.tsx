import React, { useState } from 'react';
import * as firebaseAuth from "@firebase/auth";
import { firebaseApp } from '../App';
import { FirebaseError } from 'firebase/app';

const AuthPage = () => {
    const [error, setError] = useState("");
    const authInstance = firebaseAuth.getAuth(firebaseApp);
    const gProvider = new firebaseAuth.GoogleAuthProvider();

    const createAccount = async () => {
        try {
            const result = await firebaseAuth.createUserWithEmailAndPassword(authInstance, "TEST@test.com", "testPassword");
            console.log(result)
        } catch (e) {
            setError("Error creating account: " + (e as FirebaseError).code)
        }
    }
    const signIn = async () => {
        try {
            await firebaseAuth.signInWithEmailAndPassword(authInstance, "TEST@test.com", "testPassword");
        } catch (e) {
            setError("Error signing into account: " + (e as FirebaseError).code)
        }
    }
    const googleSignIn = async () => {
        try {
            await firebaseAuth.signInWithRedirect(authInstance, gProvider);
        } catch (e) {
            setError("Error using Google OAuth: " + (e as FirebaseError).code)
        }
    }

    return (
        <div id='authPage'>
            {error ? <div className='error'>{error}</div> : null}
            <div className='content'>
                <div className='title'>Sign-In/Create Account</div>
                <button onClick={googleSignIn}>Google</button>
                <br />
                <input type="text" id="email" placeholder='Email' /><br />
                <input type="text" id="password" placeholder='Password' /><br />
                <button onClick={createAccount}>Create Account</button>
                <button onClick={signIn}>Sign-In</button>
            </div>
        </div>
    )
}

export default AuthPage;