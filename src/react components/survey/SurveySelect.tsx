import React, { useState } from 'react';
import { authInstance } from '../../firebase/Firebase';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import ListViewer from '../generic/ListViewer';
import images from '../images/coastal-va-offshore-wind-banner.jpeg';


const SurveySelect: React.FC = () => {
    const surveys = useAppSelector(s => s.data.surveys);
    const responses = useAppSelector(s => s.data.surveyResponses);
    const [isListView, setListView] = useState(true);
    const appDispatch = useAppDispatch();
    const user = authInstance.currentUser;

    return (
        <div id="home">
            <p id="userEmail">{user?.email}</p>
            <button className="toggle" onClick={() => setListView(!isListView)}>{!isListView ? 'List View' : 'Card View'}</button>
            {isListView
                ? <ListViewer height="calc(100% - 130px)" title='Administer Survey' content='Created surveys to help potential workers to find jobs.'>
                    {surveys.length > 0
                        ? surveys.map((survey, ind) => {
                            return <div
                                key={ind}
                                className="pointer survey"
                                onClick={() => {
                                    appDispatch(changePage({
                                        type: PageType.Survey,
                                        operation: OperationType.Administering,
                                        data: survey
                                    }));
                                }}>
                                {survey.title}
                            </div>;
                        })
                        : <div>There are no survey templates at the moment</div>
                    }
                </ListViewer>
                : <div className='cards'>
                    {(surveys && surveys.length > 0)
                        ? surveys.map((survey, ind) => (

                            <div
                                key={ind}
                                className="card survey"
                                onClick={() => {
                                    appDispatch(changePage({
                                        type: PageType.Survey,
                                        operation: OperationType.Administering,
                                        data: survey
                                    }));
                                }}>
                                {console.log(survey.components)}

                                <div className='title'>{survey.title}</div>
                                <div className='description'>{survey.description ? survey.description : 'No Description'}</div>
                                <div className='questions'>{survey.components.length === 1 ? '1 component' : survey.components.length + ' components'}</div>
                                {responses
                                    ? <div className='responses'>
                                        {responses.filter(r => r.surveyId === survey.id).length} responses(s)
                                    </div>
                                    : null
                                }

                            </div>
                        ))
                        : <div>There are no survey templates at the moment</div>
                    }
                </div>
            }
        </div>
    );
};

export default SurveySelect;
