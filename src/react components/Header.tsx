import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';
import ReactTooltip from 'react-tooltip';

import * as firebaseAuth from "@firebase/auth";
import { authInstance } from "../firebase/Firebase";

import { assertIsAdmin } from '../firebase/Queries/AdminQueries'


/** The props (arguments) to create a header element */
interface headerProps {

}

/** The header of the application. */
const Header: React.FC<headerProps> = (p: headerProps) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const appDispatch = useAppDispatch();

    const updateIsAdmin = async () => {
        const isA = await assertIsAdmin(authInstance.currentUser?.uid!);
        console.log("User is admin: " + isA);

        setIsAdmin(isA);
    }
    useEffect(() => { updateIsAdmin() }, []);

    return (
        <header id="header" >
            <div className='title'>{"Offshore Recruiter".toUpperCase()}</div>
            <div className='buttonGroup'>
                <i className='fas fa-home' onClick={() => { appDispatch(changePage({ type: PageType.Home })) }} data-tip="Home"></i>
                <i className='fas fa-info' onClick={() =>{appDispatch(changePage({type: PageType.InfoPage}))}} data-tip="Information"></i>
                {isAdmin ?
                    <i className='fas fa-tools' onClick={() => { appDispatch(changePage({ type: PageType.AdminHome })) }} data-tip="Administrative"></i>
                    : null
                }
                <i className="fas fa-sign-out-alt" onClick={() => firebaseAuth.signOut(authInstance)} data-tip="Sign Out"></i>
            </div>
            <ReactTooltip />
        </header>
    );
}

export default Header;