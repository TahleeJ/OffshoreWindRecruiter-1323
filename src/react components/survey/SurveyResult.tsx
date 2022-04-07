import React from 'react';

import { RecommendedJobs } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType, Status } from '../../redux/navigationSlice';
import RecJobView from './RecJobView';


const SurveyReviewer: React.FC = _ => {
    const status = useAppSelector(s => s.navigation.status);

    const dispatch = useAppDispatch();

    return (
        <div className='administerSurveyPage container'>
            <button className="red" onClick={() => dispatch(changePage({ type: PageType.Home }))}>Return to Home</button>
            <div className=''>
                <div className='surveyTitle' >Recommended Jobs</div>
                <div className=''>
                    {status === Status.fulfilled && <RecJobView />}
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

