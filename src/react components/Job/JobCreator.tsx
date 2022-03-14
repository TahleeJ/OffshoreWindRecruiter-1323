import React, { useState } from 'react';
import lodash from "lodash"
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType, OperationType } from '../../redux/navigationSlice';
import { useEffect } from "react";
import { JobOpp } from "../../firebase/Types";
import { getJobOpps, newJobOpp, editJobOpp } from '../../firebase/Queries/JobQueries';
import { setJobOpps } from "../../redux/dataSlice.ts";
import Prompt from '../Prompt';
import ListViewer from '../ListViewer';



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
    const [popupVisible, setPopupvisible] = useState(false);
    const [oppNameError, setOppNameError] = useState("");
    const [compNameError, setCompNameError] = useState("");
    const [labelError, setLabelError] = useState("");

    const togglePopup = () => setPopupvisible(!popupVisible);
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
    const saveIfValidInput = async () => {
        let errorMessage ="*This field is required";
        if (!jobOppName.trim() || !companyName.trim() || labelsAssc.length === 0) {
            togglePopup();
            if (!jobOppName.trim()) {
                setOppNameError(errorMessage);
            } else {
                setOppNameError("");
            }
            if (!companyName.trim()) {
                setCompNameError(errorMessage);
            } else {
                setCompNameError("");
            }
            if (labelsAssc.length === 0) {
                setLabelError(errorMessage);
            } else {
                setLabelError("");
            }
        }
        else {
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
        <div id='jobCreator'>
            <div className='container'>
                <div className='jobHeader'>
                    Job Opportunity
                </div>
                <div className="jobInputContainer">
                    <div className="title">Opportunity Name:</div>
                    <input type="text" value={jobOppName} onChange={(e) => setJobOppName(e.target.value)} placeholder='Job Name'></input>
                    <div className="error">{oppNameError}</div>
                </div>
                <div className="jobInputContainer">
                    <div className="title">Company Name:</div>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder='Company Name'></input>
                    <div className="error">{compNameError}</div>
                </div>
                <div className="jobInputContainer">
                    <div className="title">Job Description:</div>
                    <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Description...' />
                </div>
                <div className="jobInputContainer">
                    <span className="title"></span>
                    <ListViewer height='200px' title='Labels (Click to Toggle):'>
                        {getLabelConnections().map((label, ind) => (
                            <div key={ind} className={"labelChoice" + (label.isEnabled ? " active" : "")} onClick={() => changeLabels(label.id)
                            }>
                                {/* {label.isEnabled ? <i className="fas fa-link"></i> : null} */}
                                {label.isEnabled ? "✓ " : null}
                                {label.name}
                            </div>
                        ))}
                    </ListViewer>
                    <div className="error">{labelError}</div>
                </div>
                <div className="buttons">
                    <button className='gray' onClick={() => { appDispatch(changePage({ type: PageType.AdminHome })) }}>Cancel</button>
                    <button onClick={saveIfValidInput}>{currentOperation === OperationType.Editing ? "Save Edits" : "Create"}</button>
                </div>
                {popupVisible &&
                    <Prompt
                        title="Input Validation"
                        message="Please fill out all the fields before saving"
                        handleCancel={togglePopup}
                    />
                }
            </div>
        </div>
    );
}

export default JobCreator;
