import React from 'react';
import JobList from './JobList';
import ListViewer from '../ListViewer';
import { useAppDispatch } from '../../redux/hooks';
import { changePage, PageType } from '../../redux/navigationSlice';


/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const JobManager: React.FC<props> = (props) => {
    const appDispatch = useAppDispatch();
    return (
        <div id = 'jobManager' className = "jobManage">
            <div className = 'jobHeader'>
                <div className='jobTitle'>
                    Opportunities
                </div>
                <div className='jobButton'>
                    <button onClick={() => {appDispatch(changePage({ type: PageType.JobCreator })) }}>New Opportunity</button>
                </div>
            </div>
            <div className = 'searchBox'>
                <div className='searchText'>
                    Search: 
                </div>
                <div className='searchBar'>
                    <input placeholder="Search Opportunity"></input>
                </div>
            </div>
            <ListViewer height="calc(100% - 1000px)" title='Opportunities'>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
                <div><JobList title = "Test Opportunity"/></div>
            </ListViewer>
        </div>
    );
}

export default JobManager;