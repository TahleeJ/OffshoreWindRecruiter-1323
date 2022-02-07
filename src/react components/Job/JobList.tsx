import React from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { changeOperation, changePage, OperationType, PageType } from '../../redux/navigationSlice';

/** The props (arguments) to create this element */
interface props {
    title: String
}

/** The header of the application. */
const JobList: React.FC<props> = (props) => {
    const appDispatch = useAppDispatch();
    return (
        <div id= 'jobList'>
            <div className = 'jobName'>
                {props.title}
            </div>
            <div className = 'buttons' >
                <button className = 'red'>
                    Delete
                </button>
                <button className='green' onClick={() => {appDispatch(changeOperation({ operation: OperationType.Editing })) }}>
                    Edit
                </button>
            </div>
        </div>
    );
}
export default JobList;