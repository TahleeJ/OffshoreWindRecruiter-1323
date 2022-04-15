import React from 'react';
import { hasId, JobOpp } from '../../firebase/Types';
import { useAppSelector } from '../../redux/hooks';


interface props {
    jobOpp?: (JobOpp & hasId);
}


const JobView: React.FC<props> = props => {
    const j = useAppSelector(s => s.navigation.operationData as (JobOpp & hasId));
    const jobOpp = props.jobOpp ? props.jobOpp : j;

    return (
        <div className="jobView">
            <div className="title">{jobOpp.jobName}</div>
            <div className="company">{jobOpp.companyName}</div>
            <div className="link"><a href={jobOpp.jobLink}>Website Link</a></div>
            <div className="labels">{jobOpp.labelIds.length} Labels Assosiated</div>
            <div className="description">{jobOpp.jobDescription}</div>
        </div>
    );
};

export default JobView;
