import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import JobCreator from './JobCreator';
import JobView from './JobView';
import JobExplore from './JobExplore';


/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const JobManager: React.FC<props> = (props) => {
    const operationType = useAppSelector(s => s.navigation.operationType);
    const appDispatch = useAppDispatch();

    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
            case OperationType.Editing:
            case OperationType.Creating:
                return <JobCreator />;
            case OperationType.Administering:
                return <JobExplore />;
            case OperationType.Reviewing:
                return (
                    <div className='jobViewHolder container'>
                        <button className='red' onClick={() => appDispatch(changePage({type: PageType.AdminHome, operation: OperationType.Idle}))}>Go Back</button>
                        <JobView />
                    </div>
                );
            default:
                return (
                    <div id='jobManager' className="jobManage">
                        I am not sure how you got to this page. Our apologies, but it is not complete
                    </div>
                );
        }
    }

    return getSectionFromOType(operationType)
}

export default JobManager;