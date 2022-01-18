import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';
/** The props (arguments) to create a header element */
interface headerProps {

}

/** The header of the application. */
const Header: React.FC<headerProps> = (p: headerProps) => {
    const appDispatch = useAppDispatch();
    const auth = useContext(AuthContext);
    const signOut: (data?: Record<string | number | symbol, any> | undefined) => void = auth.signOut;
    const user = auth.user;

    return (
        <header id="header" >
            <div className='title'>{"Offshore Recruiter".toUpperCase()}</div>
            <div className='buttonGroup'>
                <i className='fas fa-home' onClick={() => { appDispatch(changePage({ type: PageType.Home })) }}></i>
                <i className='fas fa-tools' onClick={() => { appDispatch(changePage({ type: PageType.AdminHome })) }}></i>
                <i className="fas fa-poll-h" onClick={() => { appDispatch(changePage({ type: PageType.Survey })) }}></i>
                <i className="fas fa-sign-out-alt" onClick={signOut}></i>
            </div>
        </header>
    );
}

export default Header;