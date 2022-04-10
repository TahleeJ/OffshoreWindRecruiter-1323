import React from 'react';
import { RecommendedJobs } from '../../firebase/Types';
import { useAppSelector } from '../../redux/hooks';

interface props {
    jobs: RecommendedJobs;
}

const RecJobView: React.FC<props> = (p) => {
    const labels = useAppSelector(s => s.data.labels);

    return (
        <>
            {/* <span>Here are some job recommendations that align with your survey answers:</span> */}
            {p.jobs.map((recommendation, index) => (
                <div id="jobRec" key={index} className={"recommendation " + ((recommendation.score > 0) ? "positive" : (recommendation.score >= -0.5) ? "neutral" : "negative")}>
                    <div className="jobRecContainer">
                        <div className='title'>{recommendation.jobOpp.jobName}</div>
                        <div className='compName'>{recommendation.jobOpp.companyName}</div>
                        <div className='jobDesc'>{recommendation.jobOpp.jobDescription}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="recContainer">
                        {recommendation.score > 0 ?
                        <span className="check">
                            <div><i className="fas fa-check"></i></div>
                            {recommendation.score >= .5 ? "highly" : ""} recommend
                        </span>:
                        <span className="x">
                            <div><i className="fas fa-times"></i></div>
                            {recommendation.score <= -.5 ? "highly" : ""} not recommend
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
    )
}

export default RecJobView;