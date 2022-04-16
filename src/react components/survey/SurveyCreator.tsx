import lodash from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { logSurveyCreation } from '../../firebase/Analytics/Logging';
import { authInstance } from '../../firebase/Firebase';
import { editSurvey, getSurveys, newSurvey } from '../../firebase/Queries/SurveyQueries';
import { ComponentType, SurveyTemplate, SurveyAnswer, SurveyComponent } from '../../firebase/Types';
import { setSurveys } from '../../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import LabelConnector from '../label/LabelConnector';
import Prompt from '../generic/Prompt';


const initComponents: SurveyComponent[] = [
    {
        prompt: '',
        componentType: ComponentType.MultipleChoice,
        answers: [],
        hash: 0
    }
];


function getHash(str: string) {
    let hash = 0;
    let i;
    let chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function setHash(component: SurveyComponent) {
    const answerText = component.answers.reduce((prev, curr) => prev + '|' + curr.text, '');
    component.hash = getHash(component.prompt + answerText + component.componentType.toFixed());
}


const SurveyCreator: React.FC = () => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [components, setComponents] = useState<SurveyComponent[]>(initComponents);
    /** This is the current operation that is being done with surveys...usually creating/editing */
    const currentOperation = useAppSelector(s => s.navigation.operationType);
    /** This contains the old survey data. */
    const reduxSurveyData = useAppSelector(s => s.navigation.operationData as SurveyTemplate & { id: string });
    const labels = useAppSelector(s => s.data.labels);
    const surveyResponses = useAppSelector(s => s.data.surveyResponses);
    /** Used to get the scrollOffset for the label connectors */
    const pageRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();


    const [popupVisible, setPopupVisible] = useState<Boolean>(false);
    const [errorTitle, setErrorTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const togglePopup = () => setPopupVisible(!popupVisible);


    const addNewComponent = () => {
        setComponents(s => [...s, { prompt: '', answers: [], componentType: ComponentType.MultipleChoice, hash: 0 }]);
    };
    const moveComponent = (oldCIndex: number, newCIndex: number) => {
        const cloneComponents = lodash.cloneDeep(components);

        const movedComponent = cloneComponents.splice(oldCIndex, 1)[0];
        cloneComponents.splice(newCIndex, 0, movedComponent);

        setComponents(cloneComponents);
    };
    const addNewAnswer = (cIndex: number) => {
        const cloneComponents = lodash.cloneDeep(components);
        const newAnswer: SurveyAnswer = { text: '', labelIds: [] };
        cloneComponents[cIndex].answers.push(newAnswer);

        setHash(cloneComponents[cIndex]);
        setComponents(cloneComponents);
    };
    const changeComponentPrompt = (cIndex: number, newPrompt: string) => {
        const cloneComponents = lodash.cloneDeep(components);

        cloneComponents[cIndex].prompt = newPrompt;

        setHash(cloneComponents[cIndex]);
        setComponents(cloneComponents);
    };
    const changeComponentType = (cIndex: number, newType: ComponentType) => {
        const cloneComponents = lodash.cloneDeep(components);

        cloneComponents[cIndex].componentType = newType;
        if (newType & (ComponentType.Scale | ComponentType.FreeResponse))
            cloneComponents[cIndex].answers = [{ text: '', labelIds: [] }];
        else if (newType & (ComponentType.Text | ComponentType.Image))
            cloneComponents[cIndex].answers = [];

        setHash(cloneComponents[cIndex]);
        setComponents(cloneComponents);
    };
    const changeAnswerText = (cIndex: number, aIndex: number, newText: string) => {
        const cloneComponents = lodash.cloneDeep(components);

        cloneComponents[cIndex].answers[aIndex].text = newText;

        setHash(cloneComponents[cIndex]);
        setComponents(cloneComponents);
    };
    const deleteComponent = (cIndex: number) => {
        const cloneComponents = lodash.cloneDeep(components);

        cloneComponents.splice(cIndex, 1);

        setComponents(cloneComponents);
    };
    const deleteAnswer = (cIndex: number, aIndex: number) => {
        const cloneComponents = lodash.cloneDeep(components);

        cloneComponents[cIndex].answers.splice(aIndex, 1);

        setHash(cloneComponents[cIndex]);
        setComponents(cloneComponents);
    };
    const changeLabels = (cIndex: number, aIndex: number, labelId: string) => {
        const cloneComponents = lodash.cloneDeep(components);

        const indexOfLabelId = components[cIndex].answers[aIndex].labelIds.indexOf(labelId);
        if (indexOfLabelId === -1)
            cloneComponents[cIndex].answers[aIndex].labelIds.push(labelId);
        else
            cloneComponents[cIndex].answers[aIndex].labelIds.splice(indexOfLabelId, 1);

        setComponents(cloneComponents);
    };

    const getLabelConnections = (cIndex: number, aIndex: number) => {
        return labels.map(l => { return { ...l, isEnabled: components[cIndex].answers[aIndex].labelIds.indexOf(l.id) !== -1 }; });
    };
    const conditionallySave = async () => {
        const hasLabel = components.every(q => q.componentType & ComponentType.NoLabel || q.answers.every(a => a.labelIds.length > 0));

        const surveys = await getSurveys();
        let duplicate = false;
        surveys.forEach(s => {
            if (s.title.trim() === title.trim()) {
                duplicate = true;
            }
        });

        let emptyCPrompt = false;
        let noAnswers = false;
        let emptyAnswer = false;
        components.forEach(c => {
            if (c.prompt.trim().length === 0) {
                emptyCPrompt = true;
            }
            if (c.componentType === ComponentType.Question && c.answers.length === 0) {
                noAnswers = true;
            }
            c.answers.forEach(a => {
                if (c.componentType === ComponentType.MultipleChoice && a.text.trim().length === 0) {
                    emptyAnswer = true;
                }
            });
        });

        if (!title.trim()) {
            setErrorMessage('The survey title is currently empty.');
            setErrorTitle('Empty Title');
            togglePopup();
        } else if (!desc.trim()) {
            setErrorMessage('The survey description is currently empty.');
            setErrorTitle('Empty Description');
            togglePopup();
        } else if (!hasLabel) {
            setErrorTitle('Missing Label Connection(s)');
            setErrorMessage('Each answer must have at least one label connected to it');
            togglePopup();
        } else if (duplicate) {
            setErrorTitle('Another Survey has this Title');
            setErrorMessage('Please use a different title');
            togglePopup();
        } else if (components.length === 1 && (components.at(0)?.prompt.length === 0 || components.at(0)?.answers.length === 0)) {
            setErrorTitle('Survey is Empty');
            setErrorMessage('Please enter at least one component with answers');
            togglePopup();
        } else if (emptyCPrompt) {
            setErrorTitle('At least one Component has no Prompt');
            setErrorMessage('Please enter a prompt for all components');
            togglePopup();
        } else if (noAnswers) {
            setErrorTitle('At least one multiple choice component has no Answers');
            setErrorMessage('Please add at least one answer for all multiple choice components');
            togglePopup();
        } else if (emptyAnswer) {
            setErrorTitle('At least one Answer has no Text');
            setErrorMessage('Please add text for all Answers');
            togglePopup();
        } else {
            const survey: SurveyTemplate = {
                title: title,
                description: desc,
                components: components
            };
            if (currentOperation === OperationType.Creating) {
                await newSurvey(survey);

                logSurveyCreation(survey.title, authInstance.currentUser!.email!);
            } else {
                if (surveyResponses.filter(sr => sr.surveyId === reduxSurveyData.id).length > 0) {
                    if (window.confirm('There are survey responses of this survey. Editing this survey will also edit the questions seen on the response. It will not effect the job opportunities shown on the response. Press OK to continue'))
                        await editSurvey(reduxSurveyData.id, survey);
                    else return;
                } else
                    await editSurvey(reduxSurveyData.id, survey);
            }

            console.log('Updating survey list');
            dispatch(changePage({ type: PageType.AdminHome }));
            dispatch(setSurveys(await getSurveys()));
        }
    };
    const conditionallyExit = async () => {
        dispatch(changePage({ type: PageType.AdminHome }));
    };

    useEffect(() => {
        // copy the data from the redux state into the local state if editing (and only do it when the redux state changes)
        if (currentOperation === OperationType.Editing) {
            // Add hashes to old surveys, can remove soon
            if (reduxSurveyData.components === undefined) {
                const cloneComponents = lodash.cloneDeep((reduxSurveyData as any).questions!) as SurveyComponent[];

                cloneComponents.forEach(c => {
                    c.componentType = 4 << (c as any).questionType;
                });
                cloneComponents.forEach(c => setHash(c));

                setDesc(reduxSurveyData.description);
                setTitle(reduxSurveyData.title);
                setComponents(cloneComponents);
            } else {
                setDesc(reduxSurveyData.description);
                setTitle(reduxSurveyData.title);
                setComponents(reduxSurveyData.components);
            }
        }
    }, [reduxSurveyData, currentOperation]);

    return (
        <div className="surveyCreator" ref={pageRef}>
            <button className="red" onClick={conditionallyExit}>Go Back</button>
            <div className="surveyHeader">
                <input type='text' className="surveyTitle" placeholder="Survey Title*..." value={title} onChange={(e) => setTitle(e.target.value)} />
                {/* <div className="error">{errorMessage}</div> */}
                <textarea className="surveyDescription" placeholder="Survey Description..." value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            {
                components.map((q, cIndex) => {
                    return (
                        <div className="createdQuestion" key={cIndex}>
                            <div>
                                <div className="header">
                                    {(cIndex > 0) && <button className='shiftUp' onClick={() => moveComponent(cIndex, cIndex - 1)}>Up</button>}
                                    {(cIndex < components.length - 1) && <button className='shiftDown' onClick={() => moveComponent(cIndex, cIndex + 1)}>Down</button>}
                                    <input type='text' className="prompt" value={q.prompt} placeholder="Component Prompt..." onChange={(e) => changeComponentPrompt(cIndex, e.target.value)} />
                                    <div className="ComponentType">
                                        <select name="ComponentType" title="Question Type" onChange={e => changeComponentType(cIndex, parseInt(e.target.value) as ComponentType)} value={q.componentType}>
                                            <option value={ComponentType.Text}>Information Text</option>
                                            <option value={ComponentType.Image}>Image</option>
                                            <option value={ComponentType.MultipleChoice}>Multiple Choice</option>
                                            <option value={ComponentType.Scale}>Scale</option>
                                            <option value={ComponentType.FreeResponse}>Free Response</option>
                                        </select>
                                    </div>
                                    {q.componentType === ComponentType.Scale
                                        ? <LabelConnector
                                            topOffset={pageRef.current ? pageRef.current.scrollTop : 0}
                                            toggleLabel={(labelId: string) => changeLabels(cIndex, 0, labelId)}
                                            labels={getLabelConnections(cIndex, 0)}
                                        />
                                        : null
                                    }
                                    <i className="fas fa-trash-alt delete" onClick={() => deleteComponent(cIndex)}></i>
                                </div>
                                {q.componentType === ComponentType.Text
                                    ? null
                                    : null
                                }
                                {q.componentType === ComponentType.Image
                                    ? q.prompt === ''
                                        ? <div> Insert the URL of the image above. </div>
                                        : <img src={q.prompt} alt="Image" />
                                    : null
                                }
                                {q.componentType === ComponentType.MultipleChoice
                                    ? <div className='answers'>
                                        {
                                            q.answers?.map((option, aIndex) => {
                                                return <div key={'answer' + aIndex} className="answer" >
                                                    <input type="radio" placeholder='N/A' />
                                                    <input type="text" placeholder="Answer..." onChange={(e) => changeAnswerText(cIndex, aIndex, e.target.value)} value={option.text} />
                                                    <LabelConnector
                                                        topOffset={pageRef.current ? pageRef.current.scrollTop : 0}
                                                        toggleLabel={(labelId: string) => changeLabels(cIndex, aIndex, labelId)}
                                                        labels={getLabelConnections(cIndex, aIndex)}
                                                    />
                                                    <i className="fas fa-trash-alt delete" onClick={() => deleteAnswer(cIndex, aIndex)}></i>
                                                </div >;
                                            })
                                        }
                                        <button onClick={() => addNewAnswer(cIndex)}>Add Answer</button>
                                    </div>
                                    : null
                                }
                                {q.componentType === ComponentType.Scale
                                    ? <div className='s-answers'>
                                        Strongly Disagree
                                        <input type="radio" placeholder='N/A' />
                                        <input type="radio" placeholder='N/A' />
                                        <input type="radio" placeholder='N/A' />
                                        <input type="radio" placeholder='N/A' />
                                        <input type="radio" placeholder='N/A' />
                                        Strongly Agree
                                    </div>
                                    : null
                                }
                                {q.componentType === ComponentType.FreeResponse
                                    ? <div>
                                        During survey administering, the user will be presented with a text input field
                                    </div>
                                    : null
                                }
                            </div>
                            <div></div>
                        </div>
                    );
                })
            }
            <button onClick={addNewComponent}>Add Component</button>
            <button className='new-survey' id={title} onClick={conditionallySave}>{currentOperation === OperationType.Creating ? 'Save Survey as New' : 'Save Edits'}</button>
            {popupVisible &&
                <Prompt
                    title={errorTitle}
                    message={errorMessage}
                    handleCancel={togglePopup}
                />
            }
        </div >
    );
};

export default SurveyCreator;
