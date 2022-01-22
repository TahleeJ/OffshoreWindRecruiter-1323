import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminHome: React.FC<props> = (props) => {
    const auth = useContext(AuthContext);
    const user = auth.user;
    const appDispatch = useAppDispatch();
    return (
        <div id="adminHome" className='adminContainer'>
            <div className="userInfo">
                <p>[First Name] [Last Name] <br/>
                {user.attributes.email} <br/>
                Administrator
                </p>
            </div>
            <h1 id="adminPrompt">What would you like to do?</h1>
            <div className='adminButtons'>
                <button className='adminButton' onClick={() => {appDispatch(changePage({ type: PageType.JobManage })) }}>Manage Job Opportunities</button>
                <button className='adminButton'>Manage Surveys</button>
                <button className='adminButton'>Manage Labels</button>
                <button className='adminButton' onClick={() => {appDispatch(changePage({ type: PageType.PromoteUser })) }}>Promote User</button>
            </div>
        </div>
    );
}

export default AdminHome;