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
            <span>Here are some job recommendations that align with your survey answers:</span>
            {p.jobs.map((recommendation, index) => (
                <div key={index} className={"recommendation " + ((recommendation.score > 0) ? "positive" : (recommendation.score >= -0.5) ? "neutral" : "negative")}>
                    <div className='title'>{recommendation.jobOpp.jobName}</div>
                    <div className=''>{recommendation.jobOpp.companyName}</div>
                    <div className=''>{recommendation.jobOpp.jobDescription}</div>
                    <div className=''>{recommendation.jobOpp.jobLink}</div>
                    <div className=''>
                        {recommendation.jobOpp.labelIds.map((l, i) => (
                            <span key={i}>-{labels.find(searchLabel => searchLabel.id === l)?.name}- </span>
                        ))
                        }
                    </div>
                    {recommendation.score > 0 ?
                        <span>Based on your answers to the survey, we {recommendation.score >= .5 ? "highly" : ""} recommend this job</span>
                        :
                        <span>Based on your answers to the survey, we {recommendation.score <= -.5 ? "highly" : ""} do not recommend this job</span>
                    }
                </div>
            ))}
        </>
    )
}

export default RecJobView;