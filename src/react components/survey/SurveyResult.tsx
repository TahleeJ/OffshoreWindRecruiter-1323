import React from 'react';

import { JobOpp } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType } from '../../redux/navigationSlice';


type RecomendedJobs = { score: number, jobOpp: JobOpp }[];

const SurveyReviewer: React.FC = _ => {
    const dispatch = useAppDispatch();

    const status = useAppSelector(s => s.navigation.status);
    const recomendedJobs = useAppSelector(s => s.navigation.operationData as RecomendedJobs);
    

    return (
        <div className='administerSurveyPage container'>
            <button className="red" onClick={() => dispatch(changePage({ type: PageType.AdminHome }))}>Go Back</button>

            <div className=''>
                <div className='surveyTitle'>Recomended Jobs</div>
                <div className=''>
                {
                    status === 'fulfilled'  // Could also handle a rejected request
                    ? recomendedJobs?.map(j => (
                            <div>
                                { j.jobOpp.jobName } with score: { j.score }
                            </div>
                        )
                    ) 
                    : 'loading...'
                }
                </div>  
            </div>
        </div>
    )
}


export default SurveyReviewer;
