import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
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

        setIsAdmin(isA);
    }
    useEffect(() => { updateIsAdmin() }, []);

    return (
        <header id="header" >
            <div className='title'>{"Offshore Recruiter".toUpperCase()}</div>
            <div className='buttonGroup'>
                {//someone make this so this page will show if they are a "none" user
                    // <i className='fas fa-info' onClick={() => { appDispatch(changePage({ type: PageType.InfoPage })) }} data-tip="Information"></i>
                }
                
                <i className='far fa-file-alt' onClick={() => { appDispatch(changePage({ type: PageType.Home })) }} data-tip="Survey Administer"></i>
                <i className='fas fa-briefcase' onClick={() => { appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Administering })) }} data-tip="Job Explore"></i>
                {isAdmin ? 
                    <i className='fas fa-tools admin-manager' onClick={() => { appDispatch(changePage({ type: PageType.AdminHome })) }} data-tip="Administrative Dashboard"></i>
                    : null
                }
                {isAdmin ?
                    <i className="far fa-chart-bar" onClick={() => { appDispatch(changePage({ type: PageType.Analytics }))}} data-tip="Analytics"></i>
                    : null
                }
                <i className="fas fa-sign-out-alt sign-out" onClick={() => firebaseAuth.signOut(authInstance)} data-tip="Sign Out"></i>
            </div>
            <ReactTooltip />
        </header>
    );
}

export default Header;