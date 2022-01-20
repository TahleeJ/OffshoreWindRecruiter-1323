import React from 'react';
import ListViewer from './ListViewer';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const JobManager: React.FC<props> = (props) => {
    return (
        <div id = 'jobManager' className = "jobManage">
            <div className = 'jobHeader'>
                <div className='jobTitle'>
                    Opportunities
                </div>
                <div className='jobButton'>
                    <button onClick={() => alert("Not done")}>New Opportunity</button>
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
            <ListViewer height="calc(100% - 500px)" title='Opportunities'>
                <div>TEST OPPORTUNITY</div>
                <div>TEST OPPORTUNITY</div>
                <div>TEST OPPORTYNITY</div>
                <div>TEST OPPORTYNITY</div>
                <div>TEST OPPORTYNITY</div>
                <div>TEST OPPORTYNITY</div>
                <div>TEST OPPORTYNITY</div>
                <div>TEST OPPORTYNITY</div>
                <div>TEST OPPORTYNITY</div>
            </ListViewer>
        </div>
    );
}

export default JobManager;