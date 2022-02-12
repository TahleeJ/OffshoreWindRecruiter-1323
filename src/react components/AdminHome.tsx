import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';
import ListElement from './survey/ListElement';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminHome: React.FC<props> = (props) => {
    // const [unresolvedResponses, setUnResponses] = useState(0);
    const appDispatch = useAppDispatch();

    return (
        <div id="adminHome" className='adminContainer'> {/*Contains the whole page*/}
            <div className='topGrid'> {/*top part (notif center, job ops, surveys*/}
                <div className='leftColumn'>
                    {/* <div className='notifHeading'>
                        <div className='notifNumCircle'>
                            <h3 id='notifNum'>{unresolvedResponses}</h3>
                        </div>
                        <h3 id='newResponsePrompt'>New Responses</h3>
                    </div> */}
                    <div className='notifContainer'>
                        <ListViewer height="100%" title='New Responses'>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                            <div>TODO: Add responses</div>
                        </ListViewer>
                    </div>
                </div>
                <div className='middleColumn'>
                    {/* <h3 id='jobName'>Job Opportunities</h3> */}
                    <div className='jobContainer'>
                        <ListViewer height="350px" title='Job Opportunities'>
                            <ListElement name="Test job opp" handleEdit={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")} />
                            <ListElement name="Test job opp" handleEdit={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")} />
                            <ListElement name="Test job opp" handleEdit={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")} />
                        </ListViewer>
                    </div>
                    {/* <h3 id='surveyName'>Surveys</h3> */}
                    <div className='surveyContainer'>
                        <ListViewer height="350px" title='Survey Templates'>
                            <ListElement name="Test Survey Template" handleEdit={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")}/>
                            <ListElement name="Test Survey Template" handleEdit={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")}/>
                            <ListElement name="Test Survey Template" handleEdit={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")}/>
                        </ListViewer>
                    </div>
                </div>
                <div className='rightColumn'>
                    <div className="userInfo">
                        <p>[First Name] [Last Name] <br />
                            {/* {user.attributes.email} */}
                            <br />
                            Administrator
                        </p>
                    </div>
                    <div className='adminButtons'>
                        <button className='manageLabel' onClick={() => { appDispatch(changePage({ type: PageType.LabelManage })) }}>Manage Labels</button>
                        <button className='red' onClick={() => { appDispatch(changePage({ type: PageType.AdminManage })) }}>Manage Admins</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHome;