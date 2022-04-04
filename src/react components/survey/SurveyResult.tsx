import React from 'react';

import { JobOpp } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType, Status } from '../../redux/navigationSlice';


type RecomendedJobs = { score: number, jobOpp: JobOpp }[];

const SurveyReviewer: React.FC = _ => {
    const status = useAppSelector(s => s.navigation.status);
    const labels = useAppSelector(s => s.data.labels);
    const recomendedJobs = useAppSelector(s => s.navigation.operationData as RecomendedJobs);
    const dispatch = useAppDispatch();

    return (
        <div className='administerSurveyPage container'>
            <button className="red" onClick={() => dispatch(changePage({ type: PageType.Home }))}>Return to Home</button>

            <div className=''>
                <div className='surveyTitle'>Recommended Jobs</div>
                <div className=''>
                    {status === Status.fulfilled && // Could also handle a rejected request
                        <>
                            <span>Here are some job recommendations that align with your survey answers:</span>
                            {recomendedJobs?.map((recommendation, index) => (
                                <div key={index} className={"recommendation " + ((recommendation.score >= 0) ? "positive" : (recommendation.score >= -0.5) ? "neutral" : "negative")}>
                                    <div className='title'>{recommendation.jobOpp.jobName}</div>
                                    <div className=''>{recommendation.jobOpp.companyName}</div>
                                    <div className=''>{recommendation.jobOpp.jobDescription}</div>
                                    <div className=''>
                                        {recommendation.jobOpp.labelIds.map((l, i) => labels.find(searchLabel => searchLabel.id === l)?.name).join(', ')
                                        }
                                    </div>
                                    {recommendation.score >= 0 ?
                                        <span>Based on your answers to the survey, we {recommendation.score >= .5 ? "highly" : ""} recommend this job</span>
                                        :
                                        <span>Based on your answers to the survey, we {recommendation.score <= -.5 ? "highly" : ""} do not recommend this job</span>
                                    }
                                </div>
                            ))}
                        </>
                    }
                    {status === Status.pending &&
                        <>
                            Loading Results:
                            <i className="fa fa-spinner fa-pulse loadIcon"></i>
                        </>
                    }
                    {status === Status.rejected &&
                        <>
                            The survey submission has been rejected. The recommended jobs can't be displayed at this time.
                            <br />
                            We are sorry for the inconvenience!
                        </>
                    }
                </div>
            </div>
        </div>
    )
}


export default SurveyReviewer;
