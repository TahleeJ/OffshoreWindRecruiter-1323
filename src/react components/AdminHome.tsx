import React from 'react';
import { setJobOpps, setSurveyResponses, setSurveys } from '../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';

import { authInstance } from '../firebase/Firebase';
import { getCurrentPermissionLevel } from '../firebase/Queries/AdminQueries';
import { deleteJobOpp, getJobOpps } from '../firebase/Queries/JobQueries';
import { deleteSurvey, deleteSurveyResponse, getNextSurveyResponses, getSurveyResponses, getSurveys } from '../firebase/Queries/SurveyQueries';
import { PermissionLevel } from '../firebase/Types';

import ListViewer from './generic/ListViewer';
import ListElement from './generic/ListElement';


const AdminHome: React.FC = () => {
    const surveys = useAppSelector(s => s.data.surveys);
    const jobOpps = useAppSelector(s => s.data.jobOpps);
    const responses = useAppSelector(s => s.data.surveyResponses);
    const appDispatch = useAppDispatch();
    const user = authInstance.currentUser;

    let nextResponses = null;

    const levelInfo = () => {
        const currentPermissionLevel = getCurrentPermissionLevel();
        if (currentPermissionLevel === PermissionLevel.Owner) return 'Owner';
        else if (currentPermissionLevel === PermissionLevel.Admin) return 'Administrator';
        else return 'User';
    };


    return (
        <div id="adminHome" className='adminContainer'> {/* Contains the whole page */}
            <div className='topGrid'> {/* top part (notify center, job ops, surveys */}
                <div className='leftColumn'>
                    <ListViewer height={(document.body.getBoundingClientRect().height - 64) + 'px'} title='Responses' content='Survey responses that have been submitted.'>
                        {responses.length > 0
                            ? responses.map((res, ind) => {
                                return <ListElement
                                    key={ind}
                                    name={res.taker.name}
                                    handleView={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Responding, data: res }))}
                                    handleDelete={async () => {
                                        await deleteSurveyResponse(res.id);
                                        appDispatch(setSurveyResponses(await getSurveyResponses()));
                                    }}
                                />;
                            })
                            : <div>There are currently no survey responses</div>
                        }
                        {responses.length >= 15 && nextResponses !== undefined
                            ? <div className='adminButtons'>
                                <button onClick={async () => {
                                    nextResponses = await getNextSurveyResponses();
                                    if (nextResponses !== undefined)
                                        appDispatch(setSurveyResponses(responses.concat(nextResponses)));
                                }}>
                                Load More Responses
                                </button>
                            </div>
                            : null
                        }
                    </ListViewer>
                </div>
                <div className='middleColumn'>
                    <ListViewer height="50%" title='Job Opportunities' content='The list of all currently available jobs this application knows about.' handleNew={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Creating }))} >
                        {jobOpps.length > 0
                            ? jobOpps.map((jobOpp, ind) => {
                                return <ListElement
                                    key={ind}
                                    name={jobOpp.jobName}
                                    handleView={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Reviewing, data: jobOpp }))}
                                    handleEdit={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Editing, data: jobOpp }))} // does not actually handle edits yet
                                    handleDelete={async () => {
                                        await deleteJobOpp(jobOpp.id);
                                        appDispatch(setJobOpps(await getJobOpps()));
                                    }}
                                />;
                            })
                            : <div>Click the "New" button to create a new job opportunity</div>
                        }
                    </ListViewer>
                    <ListViewer height="50%" title='Survey Templates' content='The list of all surveys created in this application.' handleNew={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Creating }))}>
                        {surveys.length > 0
                            ? surveys.map((survey, ind) => {
                                return <ListElement
                                    key={ind}
                                    name={survey.title}
                                    handleEdit={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Editing, data: survey }))}
                                    handleDelete={async () => { await deleteSurvey(survey.id); appDispatch(setSurveys(await getSurveys())); }}
                                />;
                            })
                            : <div>Click the "New" button to create a new survey template</div>
                        }
                    </ListViewer>
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
                        <button onClick={() => { appDispatch(changePage({ type: PageType.LabelManage })); }}>Manage Labels</button>
                        <button onClick={() => { appDispatch(changePage({ type: PageType.AdminManage })); }}>Manage Admins</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
