import React, { useState } from "react";
import { JobOpp } from "../../firebase/Types";
import { useAppSelector } from "../../redux/hooks";
import ListViewer from "../generic/ListViewer";
import Section from "../generic/Section";
import JobView from "./JobView";

interface props {

}

const JobExplore: React.FC<props> = p => {
    const [currentJob, setCurrentJob] = useState<JobOpp>();
    const jobs = useAppSelector(s => s.data.jobOpps);

    return (
        <div className="jobExplore container">
            <Section title="Filter Options">
                This is the filter box
            </Section>
            <Section title="Job Viewer">
                <div className="left">
                    <ListViewer>
                        {jobs.map(j => (
                            <div className={"jobOpp" + (currentJob == j ? " active" : "")} onClick={() => setCurrentJob(j)}>{j.jobName}</div>
                        ))}
                    </ListViewer>
                </div>
                <div className="right">
                    {currentJob ?
                        <JobView jobOpp={currentJob} />
                        : "Select a job on the left"
                    }
                </div>
            </Section>
        </div>
    )
}

export default JobExplore;