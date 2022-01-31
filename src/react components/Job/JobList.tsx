import React from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { changePage, PageType } from '../../redux/navigationSlice';

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
                <button className='green' onClick={() => {appDispatch(changePage({ type: PageType.JobEditor })) }}>
                    Edit
                </button>
            </div>
        </div>
    );
}
export default JobList;