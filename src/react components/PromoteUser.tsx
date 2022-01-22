import React, { useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const PromoteUser: React.FC<props> = (props) => {
    const [InputValue, setInputValue] = useState("");
    const resetInput = () => {
        setInputValue("");
    }
    return (
        <div id = "promoteUser" className = "promoteUser">
            <div className = "promoteHeader">
                Authorize User as Administrator
            </div>
            <div className="inputContainer">
                <div className="userEmail">
                    User Email:  
                </div>
                <div className = "emailInput">
                    <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Email1, Email2...'></input>
                </div>   
            </div>
            <div className="buttonContainer">
                <div className="Cancel">
                    <button onClick={resetInput}>Cancel</button>
                </div>
                <div className="Promote">
                    <button>Promote</button>
                </div>
            </div>
        </div>
    );
}

export default PromoteUser;


