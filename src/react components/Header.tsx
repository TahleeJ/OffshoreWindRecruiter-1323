import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
import ReactTooltip from 'react-tooltip';

import * as firebaseAuth from '@firebase/auth';
import { authInstance } from '../firebase/Firebase';

import { getCurrentPermissionLevel } from '../firebase/Queries/AdminQueries';
import { PermissionLevel } from '../firebase/Types';


const Header: React.FC = () => {
    const currentPermissionLevel = getCurrentPermissionLevel();
    const appDispatch = useAppDispatch();


    return (
        <header id="header" >
            <div className='title'>{'Offshore Recruiter'.toUpperCase()}</div>
            <div className='buttonGroup'>
                {currentPermissionLevel === PermissionLevel.None
                    ? <i className='fas fa-info' onClick={() => { appDispatch(changePage({ type: PageType.AppInfo })); }} data-tip="Information"></i>
                    : null
                }
                {currentPermissionLevel >= PermissionLevel.Navigator
                    ? <>
                        <i className='far fa-file-alt' onClick={() => { appDispatch(changePage({ type: PageType.Survey })); }} data-tip="Survey Administer"></i>
                        <i className='fas fa-briefcase' onClick={() => { appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Administering })); }} data-tip="Job Explore"></i>
                    </>
                    : null

                }
                <i className="fas fa-graduation-cap" onClick={() => { appDispatch(changePage({ type: PageType.OffShoreInfo })); }} data-tip="OffShore 101"></i>
                {currentPermissionLevel >= PermissionLevel.Admin
                    ? <>
                        <i className='fas fa-tools admin-manager' onClick={() => { appDispatch(changePage({ type: PageType.AdminHome })); }} data-tip="Administrative Dashboard"></i><i className="far fa-chart-bar" onClick={() => { appDispatch(changePage({ type: PageType.Analytics })); }} data-tip="Analytics"></i>
                    </>
                    : null
                }
                <i className="fas fa-sign-out-alt sign-out" onClick={() => firebaseAuth.signOut(authInstance)} data-tip="Sign Out"></i>
            </div>
            <ReactTooltip />
        </header>
    );
};

export default Header;
