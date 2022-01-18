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
            <div className = 'buttonContainer'>{"Offshore Wind Recruitment".toUpperCase()}</div>
            <div className='headerButton'>
                <button className = 'button' onClick={() => {appDispatch(changePage({ type: PageType.Home }))}}>HOME</button> 
                <button className = 'button' onClick={() => {appDispatch(changePage({ type: PageType.AdminHome }))}}>ADMIN</button> 
                <button className = 'button' onClick={() => {appDispatch(changePage({ type: PageType.Survey}))}}>SURVEY</button>
                <button className='button' onClick={signOut}>SIGN OUT</button>
            </div>    
        </header>
    );
}

export default Header;