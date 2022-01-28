import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminHome: React.FC<props> = (props) => {
    const auth = useContext(AuthContext);
    const user = auth.user;
    const appDispatch = useAppDispatch();
    return (
        <div id="adminHome" className='adminContainer'> {/*Contains the whole page*/}
            <div className='topGrid'> {/*top part (notif center, job ops, surveys*/}
                <div className='notifGrid'>
                    <div className='notifHeading'>
                        <div className='notifNumCircle'>
                            <h3 id='notifNum'>8</h3>
                        </div>
                        <h3 id='newResponsePrompt'>New Responses</h3>
                    </div>
                    <div className='notifContainer'>
                    </div>
                </div>
                <div className='jobAndSurveyColumn'>
                    <h3 id='jobName'>Job Opportunities</h3>
                    <div className='jobContainer'>
                        <ListViewer height="340px">
                            <div>owo</div>
                            <div>owo</div>
                            <div>owo</div>
                        </ListViewer>
                    </div>
                    <h3 id='surveyName'>Surveys</h3>
                    <div className='surveyContainer'>
                        <ListViewer height="340px">
                            <div>owo</div>
                            <div>owo</div>
                            <div>owo</div>
                        </ListViewer>
                    </div>
                </div>
            </div>
            <div className='bottomGrid'>
                <div className='adminButtons'>
                    <button className='manageLabel'>Manage Labels</button>
                    <button className='userPromo' onClick={() => {appDispatch(changePage({ type: PageType.AdminManage })) }}>User Promotion</button>
                </div>
                <div className="userInfo">
                    <p>[First Name] [Last Name] <br/>
                    {user.attributes.email} <br/>
                    Administrator
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminHome;