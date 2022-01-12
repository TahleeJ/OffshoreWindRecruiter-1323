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
            <div style={{display:'inline-block', textAlign:"center"}}>{"Offshore Wind Recruitment".toUpperCase()}</div>
            <div className='headerButton' style={{display:'inline-block'}}>
                <button className = 'button' onClick={() => {appDispatch(changePage({ type: PageType.Home }))}}>Home</button> 
                <button className = 'button' onClick={() => {appDispatch(changePage({ type: PageType.Survey}))}}>Survey</button>
                <button className='button' onClick={signOut}>Sign out</button>
                
            </div>    
        </header>
    );
}

export default Header;