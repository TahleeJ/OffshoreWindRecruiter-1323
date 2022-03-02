import React, { useState } from 'react';
import lodash from "lodash"
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType, OperationType } from '../../redux/navigationSlice';
import { useEffect } from "react";
import { JobOpp } from "../../firebase/Types";
import {getJobOpps, newJobOpp, editJobOpp} from '../../firebase/JobQueries';
import { setJobOpps } from "../../redux/dataSlice.ts";
import LabelConnector from "../label/LabelConnector";



/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const JobCreator: React.FC<props> = (props) => {
    const [jobOppName, setJobOppName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [labelsAssc, setLabelsAssc] = useState<Array<string>>([]);
    const [description, setDescription] = useState("");
    const currentOperation = useAppSelector(s => s.navigation.operationType);
    const appDispatch = useAppDispatch();
    const reduxJobOppData = useAppSelector(s => s.navigation.operationData as JobOpp & { id: string });
    const labels = useAppSelector(s => s.data.labels);

    const saveJobOpp = async () => {
        let jobOpp: JobOpp = {
            jobName: jobOppName,
            companyName: companyName,
            labelIds: labelsAssc,
            jobDescription: description,

        }
        if (currentOperation === OperationType.Creating)
            await newJobOpp(jobOpp);
        else
            await editJobOpp(reduxJobOppData.id, jobOpp);
        appDispatch(changePage({ type: PageType.AdminHome }));
        appDispatch(setJobOpps(await getJobOpps()));
    }

    const changeLabels = (labelId: string) => {
        let cloneLabels = lodash.cloneDeep(labelsAssc);

        const indexOfLabelId = labelsAssc.indexOf(labelId);
        if (indexOfLabelId === -1)
            cloneLabels.push(labelId);
        else
            cloneLabels.splice(indexOfLabelId, 1);
        
        setLabelsAssc(cloneLabels);
    }

    const getLabelConnections = () => {
        return labels.map(l => {
            // console.log(questions[qIndex].options[aIndex].labelIds);
            return {
                ...l,
                isEnabled: labelsAssc.indexOf(l.id) !== -1
            }
        });
    }

    useEffect(() => {
        if (currentOperation === OperationType.Editing) {
            setJobOppName(reduxJobOppData.jobName);
            setCompanyName(reduxJobOppData.companyName);
            setLabelsAssc(reduxJobOppData.labelIds);
            setDescription(reduxJobOppData.jobDescription);
        }
    }, [reduxJobOppData, currentOperation]);
    
    return (
        <div id='jobCreator' className='jobCreator'>
            <div className='jobHeader'>
                <div className='jobTitle'>
                    Job Opportunity
                </div>
            </div>
            <div className="jobInputContainer">
                <div className="title">Opportunity Name:</div>
                <input type="text" value={jobOppName} onChange={(e) => setJobOppName(e.target.value)} placeholder='Job Name'></input>
            </div>
            <div className="jobInputContainer">
                <div className="title">Company Name:</div>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='Company Name'></input>
            </div>
            <div className="jobInputContainer">
                <div className="title">Associated Labels:</div>
                {/* <input type="text" value={labelsAssc} onChange={(e) => setLabelsAssc(e.target.value.split("," || ", "))} placeholder='Label1, Label2...'></input> */}
                <LabelConnector
                    toggleLabel={(labelId: string) => changeLabels(labelId)}
                    labels={getLabelConnections()}
                />
            </div>
            <div className="jobInputContainer">
                <div className="title">Job Description:</div>
                <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Description...' />
            </div>
            <div className="buttons">
                <button className='gray' onClick={() => {appDispatch(changePage({ type: PageType.AdminHome })) }}>Cancel</button>
                <button className="green" onClick={saveJobOpp}>Create</button>
            </div>
        </div>
    );
}

export default JobCreator;
