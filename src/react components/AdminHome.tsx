import React from 'react';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminHome: React.FC<props> = (props) => {

    return (
        <div id="adminHome" className='adminContainer'>
            <div className="userInfo">
                <p>[First Name] [Last Name] <br/>
                Email <br/>
                Administrator
                </p>
            </div>
            <h1 id="adminPrompt">What would you like to do?</h1>
            <div className='adminButtons'>
                <button className='adminButton'>Manage Job Opportunities</button>
                <button className='adminButton'>Manage Surveys</button>
                <button className='adminButton'>Manage Labels</button>
                <button className='adminButton'>Promote User</button>
            </div>
        </div>
    );
}

export default AdminHome;