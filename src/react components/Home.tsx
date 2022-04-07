import React, { useState } from 'react';
import { authInstance } from "../firebase/Firebase";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';

// import * as firestore from "@firebase/firestore";
// import { useEffect } from 'react';
// import { Survey } from '../firebase/Types';
// import { getSurveys } from '../firebase/SurveyQueries';
// import { useState } from 'react';

interface props {

}

const Home: React.FC<props> = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const responses = useAppSelector(s => s.data.surveyResponses);
    const [isListView, setListView] = useState(true);
    const appDispatch = useAppDispatch();
    const user = authInstance.currentUser;

    return (
        <div id="home">
            <p id="userEmail">{user?.email}</p>
            <button onClick={() => {appDispatch(changePage({type: PageType.Analytics}))}}>View Analytics</button>
            <button className="toggle" onClick={() => setListView(!isListView)}>{!isListView ? "List View" : "Card View"}</button>
            {isListView ?
                <ListViewer height="calc(100% - 130px)" title='Administer Survey'>
                    {surveys.length > 0 ?
                        surveys.map((survey, ind) => {
                            return <div
                                key={ind}
                                className="pointer survey"
                                onClick={() => {
                                    appDispatch(changePage({
                                        type: PageType.Survey,
                                        operation: OperationType.Administering,
                                        data: survey
                                    }))
                                }}>
                                {survey.title}
                            </div>
                        })
                        : <div>There are no survey templates at the moment</div>
                    }
                </ListViewer>
                :
                <div className='cards'>
                    {surveys.length > 0 ?
                        surveys.map((survey, ind) => (
                            <div
                                key={ind}
                                className="card survey"
                                onClick={() => {
                                    appDispatch(changePage({
                                        type: PageType.Survey,
                                        operation: OperationType.Administering,
                                        data: survey
                                    }))
                                }}>
                                <div className='title'>{survey.title}</div>
                                <div className='description'>{survey.description ? survey.description : "No Description"}</div>
                                <div className='questions'>{survey.questions.length} question(s)</div>
                                <div className='responses'>{responses.filter(r => r.surveyId === survey.id).length} responses(s)</div>
                            </div>
                        ))
                        : <div>There are no survey templates at the moment</div>
                    }
                </div>
            }
        </div>
    );
}

export default Home;