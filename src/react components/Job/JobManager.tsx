import React from 'react';
import JobList from './JobList';
import ListViewer from '../ListViewer';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changeOperation, OperationType } from '../../redux/navigationSlice';
import JobCreator from './JobCreator';


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
            default:
                return (
                    <div id='jobManager' className="jobManage">
                        <div className='jobHeader'>
                            <div className='jobTitle'>Opportunities</div>
                            <div className='jobButton'>
                                <button onClick={() => { appDispatch(changeOperation({ operation: OperationType.Creating })) }}>New Opportunity</button>
                            </div>
                        </div>
                        <div className='searchBox'>
                            <div className='searchText'>
                                Search:
                            </div>
                            <div className='searchBar'>
                                <input placeholder="Search Opportunity"></input>
                            </div>
                        </div>
                        <ListViewer height="calc(100% - 1000px)" title='Opportunities'>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                            <div><JobList title="Test Opportunity" /></div>
                        </ListViewer>
                    </div>                );
        }
    }

    return (<div id="surveyHome">{getSectionFromOType(operationType)}</div>)
}

export default JobManager;