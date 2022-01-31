import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { changePage, PageType } from '../../redux/navigationSlice';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const JobCreator: React.FC<props> = (props) => {
    const [InputValue, setInputValue] = useState("");
    const resetInput = () => {
        setInputValue("");
    }
    const appDispatch = useAppDispatch();
    return (
        <div id='jobCreator' className='jobCreator'>
            <div className='jobHeader'>
                <div className='jobTitle'>
                    Create New Opportunity
                </div>
            </div>
            <div className="jobInputContainer">
                <div className="title">Opportunity Name:</div>
                <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Job Name'></input>
            </div>
            <div className="jobInputContainer">
                <div className="title">Company Name:</div>
                <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Company Name'></input>
            </div>
            <div className="jobInputContainer">
                <div className="title">Associated Labels:</div>
                <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Label1, Label2...'></input>
            </div>
            <div className="jobInputContainer">
                <div className="title">Job Desctiption:</div>
                <textarea rows={5} placeholder='Desctiption...' />
            </div>
            <div className="buttons">
                <button className='gray' onClick={() => {appDispatch(changePage({ type: PageType.JobManage })) }}>Cancel</button>
                <button className="green">Create</button>
            </div>
        </div>
    );
}

export default JobCreator;
