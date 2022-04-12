import React, { useEffect, useState } from "react";
import { hasId, JobOpp } from "../../firebase/Types";
import { useAppSelector } from "../../redux/hooks";
import ListViewer from "../generic/ListViewer";
import Section from "../generic/Section";
import JobView from "./JobView";

interface props {

}

const JobExplore: React.FC<props> = p => {
    const [currentJob, setCurrentJob] = useState<(JobOpp & hasId)>();
    const [filterLabelIds, setFilterLabelIds] = useState<string[]>([]);
    const [filterByALL, setAllRequirement] = useState(false);
    const jobs = useAppSelector(s => s.data.jobOpps);
    const labels = useAppSelector(s => s.data.labels);

    const filteredJobs = (() => {
        if (filterLabelIds.length === 0) return jobs;
        if (filterByALL) {
            return jobs.filter(job => {
                return filterLabelIds.every(fli => job.labelIds.includes(fli));
            })
        }
        return jobs.filter(job => {
            return filterLabelIds.some(fli => job.labelIds.includes(fli));
        })
    })();
    const toggleLabel = (id: string) => {
        if (filterLabelIds.indexOf(id) === -1)
            setFilterLabelIds([...filterLabelIds, id])
        else
            setFilterLabelIds(filterLabelIds.filter(fli => fli !== id))
        console.log("added")
    }

    useEffect(() => {
        setCurrentJob(filteredJobs.length > 0 ? filteredJobs[0] : undefined)
    }, [filteredJobs])

    return (
        <div className="jobExplore container">
            <Section title="Filter Options">
                <div className="left">
                    <ListViewer>
                        {labels.map((l, i) => (
                            <div className={"label" + (filterLabelIds.indexOf(l.id) !== -1 ? " active" : "")} onClick={() => toggleLabel(l.id)} key={i}>
                                {l.name}
                            </div>
                        ))}
                    </ListViewer>
                </div>
                <div className="right">
                    <div>
                        <span>Filter jobs to have </span>
                        <button className="allChoice" onClick={() => setAllRequirement(!filterByALL)}>{filterByALL ? "ALL" : "AT LEAST ONE"} </button>
                        <span> of the selected labels</span>
                    </div>
                    <br />
                    Selected labels: {(filterLabelIds.length > 0) && <span className="underline" onClick={() => setFilterLabelIds([])}>Clear</span>}
                    <br />
                    {filterLabelIds.map(ali => (<div key={ali} className="tag" onClick={() => toggleLabel(ali)}>{labels.find(l => l.id === ali)?.name}</div>))}
                </div>
            </Section>
            <Section title="Job Viewer">
                <div className="left">
                    <ListViewer>
                        {filteredJobs.map((j, i) => (
                            <div className={"jobOpp" + (currentJob === j ? " active" : "")} onClick={() => setCurrentJob(j)} key={i}>
                                {j.jobName}
                                <span className="labelCount">{labels.filter(l => j.labelIds.findIndex(jli => jli === l.id) !== -1).length}</span>
                            </div>
                        ))}
                    </ListViewer>
                </div>
                <div className="right">
                    <div className="jobHolder">
                        {currentJob ?
                            <JobView jobOpp={currentJob} />
                            : "Select a job from the left list and/or filter by "
                        }
                    </div>
                </div>
            </Section>
        </div>
    )
}

export default JobExplore;