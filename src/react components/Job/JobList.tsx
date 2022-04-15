import React from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { changeOperation, OperationType } from '../../redux/navigationSlice';


interface props {
    title: String
}


const JobList: React.FC<props> = props => {
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
                <button className='green' onClick={() => { appDispatch(changeOperation({ operation: OperationType.Editing })); }}>
                    Edit
                </button>
            </div>
        </div>
    );
};
export default JobList;
