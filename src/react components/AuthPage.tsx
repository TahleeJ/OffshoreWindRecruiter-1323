import { useState } from 'react';
import * as firebaseAuth from "@firebase/auth";
import { firebaseApp } from '../App';
import { FirebaseError } from 'firebase/app';
// import googleAuthIcon from '../icons/google-authentication-management.png';

const AuthPage = () => {
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const authInstance = firebaseAuth.getAuth(firebaseApp);
    const gProvider = new firebaseAuth.GoogleAuthProvider();


    const createAccount = async () => {
        try {
            const result = await firebaseAuth.createUserWithEmailAndPassword(authInstance, username, password);
            console.log(result)
        } catch (e) {
            setError("Error creating account: " + (e as FirebaseError).code)
        }
    }
    const signIn = async () => {
        try {
            await firebaseAuth.signInWithEmailAndPassword(authInstance, username, password);
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
                <button onClick={googleSignIn}>Use Google</button>
                <input type="text" id="email" placeholder='Email' value={username} autoComplete="on" onChange={(e) => setUsername(e.target.value)}/><br />
                <input type="password" id="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/><br />
                <button onClick={createAccount}>Create Account</button>
                <br />
                <button onClick={signIn}>Sign-In</button>
            </div>
        </div>
    )
}

export default AuthPage;