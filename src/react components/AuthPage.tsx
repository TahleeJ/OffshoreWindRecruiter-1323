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
        <div>
            SIGN IN or CREATE ACCOUNT
            <br />
            <span>Oh no! {error}</span>
            <br />
            <button onClick={googleSignIn}>Google</button>
            <br />
            <input placeholder='Email'/><br />
            <input placeholder='Password' /><br />
            <button onClick={createAccount}>CREATE</button>
            <button onClick={signIn}>SIGN IN</button>
        </div>
    )
}

export default AuthPage;