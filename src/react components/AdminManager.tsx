import React, { useState } from 'react';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminManager: React.FC<props> = (props) => {
    const [InputValue, setInputValue] = useState("");
    const resetInput = () => {
        setInputValue("");
    }

    return (
        <div id="promoteUser">
            <div className="header">Administrator Authorization</div>
            <div className='textBlock'>Type the email address of the user that you would like to promote/demote to Administrator.
                <br /><br />
                Administrators have full access to the application; They are able to create new surveys, labels, jobs, and administer surveys.</div>
            <div className="inputContainer">
                <div className="userEmail">User Email:</div>
                <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='example@gmail.com'></input>
            </div>
            <div className="buttonContainer">
                <button className="gray" onClick={resetInput}>Clear Input</button>
                <button>Promote</button>
                <button className='red'>Demote</button>
            </div>
        </div>
    );
}

export default AdminManager;