import React, { useEffect, useState } from 'react';
import { authInstance } from '../firebase/Firebase';
import { deleteJobOpp, getJobOpps, newJobOpp } from '../firebase/Queries/JobQueries';
import { deleteSurvey, getSurveys } from '../firebase/Queries/SurveyQueries';
import { JobOpp } from '../firebase/Types';
import { setJobOpps, setSurveys } from '../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';
import * as firestore from "@firebase/firestore";

import ListElement from './survey/ListElement';
import { PermissionLevel } from '../firebase/Types';

import db from '../firebase/Firestore';
import { result } from 'lodash';

/** The props (arguments) to create this element */
interface props {

}

const AdminHome: React.FC<props> = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const jobOpps = useAppSelector(s => s.data.jobOpps)
    const appDispatch = useAppDispatch();
    const user = authInstance.currentUser;
    //const User = useAppSelector(s => s.User);
    const [level, setLevel] = useState(PermissionLevel.None);
    const getPermissionLevel = async () => {
        const uid = authInstance.currentUser?.uid as string;
        const results = await firestore.getDoc(firestore.doc(db.Users, uid));

        //esults.data()?.permissionLevel as PermissionLevel;
        setLevel(results.data()?.permissionLevel as PermissionLevel);
    }
    //const level = getPermissionLevel()
    const levelInfo = () => {
        if (level == 0) {
            return "User";
        } else if (level == 1) {
            return "Administrator"
        } else if (level == 2) {
            return "Owner"
        }
    }
    const scrapeJobs = async () => {
        const response = await fetch('http://api.ecodistricthamptonroads.org/Jobs');
        const jsonResponse = await response.json(); //extract JSON from the http response

        jsonResponse.forEach((jR: any) => {
            const jobOpp: JobOpp = {
                jobName: jR.title,
                companyName: jR.company,
                labelIds: [],
                jobDescription: jR.Description,
            }
            newJobOpp(jobOpp);
        });
    }
    useEffect(() => { getPermissionLevel(); }, []);
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
                        <ListViewer height="350px" title='Job Opportunities' handleNew={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Creating }))} >
                            {jobOpps.length > 0 ?
                                jobOpps.map((jobOpp, ind) => {
                                    return <ListElement
                                        key={ind}
                                        type="Job Opportunity"
                                        name={jobOpp.jobName}
                                        handleEdit={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Editing, data: jobOpp }))} // does not actually handle edits yet
                                        handleDelete={async () => {
                                            await deleteJobOpp(jobOpp.id);
                                            appDispatch(setJobOpps(await getJobOpps()));
                                        }}
                                    />
                                })
                                : <div>Click the "New" button to create a new job opportunity</div>
                            }
                        </ListViewer>
                    </div>
                    {/* <h3 id='surveyName'>Surveys</h3> */}
                    <div className='surveyContainer'>
                        <ListViewer height="350px" title='Survey Templates' handleNew={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Creating }))}>
                            {surveys.length > 0 ?
                                surveys.map((survey, ind) => {
                                    return <ListElement
                                        key={ind}
                                        type="Survey"
                                        name={survey.title}
                                        handleEdit={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Editing, data: survey }))}
                                        handleDelete={async () => { await deleteSurvey(survey.id); appDispatch(setSurveys(await getSurveys())) }}
                                    />
                                })
                                : <div>Click the "New" button to create a new survey template</div>
                            }
                        </ListViewer>
                    </div>
                </div>
                <div className='rightColumn'>
                    <div className="userInfo">
                        <p>
                            {user?.email}
                            <br />
                            {levelInfo()}
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
