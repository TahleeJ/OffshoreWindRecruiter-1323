import React, { useEffect, useState } from 'react';
import { editLabel, getLabels, getSurveyReferencesToLabel } from '../../firebase/Queries/LabelQueries';
import { hasId, Label, SurveyTemplate, SurveyAnswer, SurveyQuestion } from '../../firebase/Types';
import { setLabels } from '../../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import ListViewer from '../ListViewer';
import ListElement from '../survey/ListElement';


/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const LabelManager: React.FC<props> = (props) => {
    const [labelName, setInputValue] = useState("");
    const [surveyRefs, setSurveyRefs] = useState<Map<SurveyTemplate & hasId, Map<SurveyQuestion, SurveyAnswer[]>>>(new Map());
    const appDispatch = useAppDispatch();
    const currentOperation = useAppSelector(s => s.navigation.operationType);
    const reduxLabel = useAppSelector(s => s.navigation.operationData as Label & hasId);

    const changeLabel = async () => {
        await editLabel(reduxLabel.id, {
            ...reduxLabel,
            name: labelName
        });
        appDispatch(setLabels(await getLabels()));
        appDispatch(changePage({ type: PageType.LabelManage }))
    }

    useEffect(() => {
        // Copy the data from the redux state into the local state if editing (and only do it when the redux state changes)
        if (currentOperation === OperationType.Editing) {
            setInputValue(reduxLabel.name);
        }

        // Initialize surveyRefs here because getSurveyReferencesToLabel is async
        getSurveyReferencesToLabel(reduxLabel.id)
            .then(data => setSurveyRefs(data));

    }, [reduxLabel, currentOperation]);

    return (
        <div id='labelEditor'>
            <div className="listContainer">
                {/* <div className='labelTitle'>Edit Label</div> */}
                <div className="labelNamePrompt">
                    <input type="text" className="labelNameInput" value={labelName} onChange={(e) => setInputValue(e.target.value)} placeholder='Label Name'></input>
                </div>
                <ListViewer height="350px" title="Associated Answers">
                    {surveyRefs ?
                        [...surveyRefs].map(([survey, questionRefs], sI) => {
                            return <div className='association' key={sI}>
                                <div className='surveyTitle'>Survey: {survey.title}</div>
                                {[...questionRefs].map(([question, answers], qI) => {
                                    return <div key={qI}>
                                        <div className='questionTitle'>Question: {question.prompt}</div>
                                        {answers.map((answer, aI) => <div className='answerTitle' key={aI}>Answer: {answer.text}</div>)}
                                    </div>
                                })
                                }
                            </div>
                        })
                        : null
                    }
                </ListViewer>
                <ListViewer height="350px" title="Associated Job Opportunities">
                    <ListElement name="NOT DONE YET" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                </ListViewer>
            </div>
            <div className="buttons">
                <button className='gray' onClick={() => { appDispatch(changePage({ type: PageType.LabelManage })) }}>Cancel</button>
                <button className="green" onClick={changeLabel}>Save Changes</button>
            </div>
        </div>
    );
}

export default LabelManager;