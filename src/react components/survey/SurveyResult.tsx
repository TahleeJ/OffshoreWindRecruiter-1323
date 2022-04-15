import React from 'react';

import { JobOpp, RecommendedJobWithData, ReturnedSurveyResponse } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType, Status } from '../../redux/navigationSlice';
import RecJobView from './RecJobView';


const SurveyReviewer: React.FC = () => {
    const status = useAppSelector(s => s.navigation.status);
    const jobOpps = useAppSelector(s => s.data.jobOpps);
    const response = useAppSelector(s => s.navigation.operationData as ReturnedSurveyResponse);
    const dispatch = useAppDispatch();

    const jobs = (): RecommendedJobWithData[] => {
        if (!response.recommendedJobs) return [];

        return response.recommendedJobs.map(rj => {
            return {
                score: rj.score,
                jobOpp: jobOpps.find(j => j.id === rj.jobOppId) as JobOpp
            };
        }).sort((a, b) => b.score - a.score);
    };

    return (
        <div className='administerSurveyPage container'>
            <button className="red" onClick={() => dispatch(changePage({ type: PageType.Home }))}>Return to Home</button>
            <div className=''>
                <div className='surveyTitle' >Recommended Jobs</div>
                <div className=''>
                    {status === Status.fulfilled && <RecJobView jobs={jobs()}/>}
                    {status === Status.pending &&
                        <>
                            Loading Results:&nbsp;
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
    );
};


export default SurveyReviewer;

