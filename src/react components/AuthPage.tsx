import { useState } from 'react';
import * as firebaseAuth from '@firebase/auth';
import { FirebaseError } from 'firebase/app';
import { authInstance } from '../firebase/Firebase';


const AuthPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const gProvider = new firebaseAuth.GoogleAuthProvider();


    const createAccount = async () => {
        try {
            if (email === '' || password === '') {
                setError('Please fill out email and password fields.');
                return;
            }

            const result = await firebaseAuth.createUserWithEmailAndPassword(authInstance, email, password);
        } catch (e) {
            setError('Error creating account: ' + (e as FirebaseError).code);
        }
    };
    const signIn = async () => {
        try {
            await firebaseAuth.signInWithEmailAndPassword(authInstance, email, password);
        } catch (e) {
            setError('Error signing into account: ' + (e as FirebaseError).code);
        }
    };
    const googleSignIn = async () => {
        try {
            await firebaseAuth.signInWithRedirect(authInstance, gProvider);
        } catch (e) {
            setError('Error using Google OAuth: ' + (e as FirebaseError).code);
        }
    };
    const resetPassword = async () => {
        try {
            if (email === '') {
                setError('Please fill out email field.');
                return;
            }

            await firebaseAuth.sendPasswordResetEmail(authInstance, email);

            setSuccess('Sent a reset email to ' + email);
            setTimeout(() => setSuccess(''), 30000);
        } catch (e) {
            setError('Error using Google OAuth: ' + (e as FirebaseError).code);
        }
    };

    return (
        <div id='authPage'>
            {error ? <div className='error'>{error}</div> : null}
            {success ? <div className='success'>{success}</div> : null}
            <div className='content'>
                <div className='title'>Sign-In / Create Account</div>
                <br />

                <button onClick={googleSignIn}>Use Google</button>
                <br />

                <input type="text" id="email" placeholder='Email' value={email} autoComplete="on" onChange={(e) => setEmail(e.target.value)}/><br />
                <input type="password" id="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/><br />
                <button onClick={signIn}>Sign-In</button>
                <a href="javascript:;" onClick={createAccount}>Create Account</a>
                <a href="javascript:;" onClick={resetPassword}>Reset Password</a>
            </div>
        </div>
    );
};

export default AuthPage;
