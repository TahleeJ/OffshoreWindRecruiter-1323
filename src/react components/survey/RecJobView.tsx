import React from 'react';
import { RecommendedJobWithData } from '../../firebase/Types';


interface props {
    jobs: RecommendedJobWithData[];
}


const RecJobView: React.FC<props> = props => {
    return (
        <>
            {/* <span>Here are some job recommendations that align with your survey answers:</span> */}
            {props.jobs.map((recommendation, index) => (
                <div id="jobRec" key={index} className={'recommendation ' + ((recommendation.score > 0) ? 'positive' : (recommendation.score >= -0.5) ? 'neutral' : 'negative')}>
                    <div className="jobRecContainer">
                        {recommendation.jobOpp ?
                            <>
                                <div className='title'>{recommendation.jobOpp.jobName}</div>
                                <div className='compName'>{recommendation.jobOpp.companyName}</div>
                                <div className='jobDesc'>{recommendation.jobOpp.jobDescription}</div>
                            </>
                            : <div>Job no longer exists</div>
                        }
                    </div>
                    <div className="divider"></div>
                    <div className="recContainer">
                        {recommendation.score > 0
                            ? <span className="check">
                                <div><i className="fas fa-check"></i></div>
                                {recommendation.score >= 0.5 ? 'highly' : ''} recommend
                            </span>
                            : <span className="x">
                                <div><i className="fas fa-times"></i></div>
                                {recommendation.score <= -0.5 ? 'highly' : ''} not recommend
                            </span>
                        }
                    </div>
                    {/* <div className='jobLink'>{recommendation.jobOpp.jobLink}</div>
                    <div className='labels'>
                        {recommendation.jobOpp.labelIds.map((l, i) => (
                            <span key={i}>-{labels.find(searchLabel => searchLabel.id === l)?.name}- </span>
                        ))
                        }
                    </div> */}
                </div>
            ))}
        </>
    );
};

export default RecJobView;
