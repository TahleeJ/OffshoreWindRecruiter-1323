import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';
import ReactTooltip from 'react-tooltip';

import * as firebaseAuth from "@firebase/auth";
import { authInstance} from "../firebase/Firebase";

import * as firestore from "@firebase/firestore";
import db from '../firebase/Firestore';
import { PermissionLevel } from '../firebase/Types';


/** The props (arguments) to create a header element */
interface headerProps {

}

/** The header of the application. */
const Header: React.FC<headerProps> = (p: headerProps) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const appDispatch = useAppDispatch();

    const updateIsAdmin = async () => {
        const uid = authInstance.currentUser?.uid as string;
        const results = await firestore.getDoc(firestore.doc(db.Users, uid));
        const isA = results.data()?.permissionLevel !== PermissionLevel.None;
        
        setIsAdmin(isA);
    }
    useEffect(() => { updateIsAdmin(); }, []);

    return (
        <header id="header" >
            <div className='title'>{"Offshore Recruiter".toUpperCase()}</div>
            <div className='buttonGroup'>
                <i className='fas fa-home' onClick={() => { appDispatch(changePage({ type: PageType.Home })) }} data-tip="Home"></i>
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