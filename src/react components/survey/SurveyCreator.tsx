import lodash from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { logSurveyCreation } from '../../firebase/Analytics/Logging';
import { authInstance } from '../../firebase/Firebase';
import { editSurvey, getSurveys, newSurvey } from '../../firebase/Queries/SurveyQueries';
import { QuestionType, SurveyTemplate, SurveyAnswer, SurveyQuestion } from '../../firebase/Types';
import { setSurveys } from '../../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import LabelConnector from '../label/LabelConnector';
import Prompt from '../generic/Prompt';


const initQuestions: SurveyQuestion[] = [
    {
        prompt: '',
        questionType: QuestionType.MultipleChoice,
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

function setHash(question: SurveyQuestion) {
    const answerText = question.answers.reduce((prev, curr) => prev + '|' + curr.text, '');
    question.hash = getHash(question.prompt + answerText + question.questionType.toFixed());
}


const SurveyCreator: React.FC = () => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [questions, setQuestions] = useState<SurveyQuestion[]>(initQuestions);
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


    const addNewQuestion = () => {
        setQuestions(s => [...s, { prompt: '', answers: [], questionType: QuestionType.MultipleChoice, hash: 0 }]);
    };
    const moveQuestion = (oldQIndex: number, newQIndex: number) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        const movedQuestion = cloneQuestions.splice(oldQIndex, 1)[0];
        cloneQuestions.splice(newQIndex, 0, movedQuestion);

        setQuestions(cloneQuestions);
    };
    const addNewAnswer = (qIndex: number) => {
        const cloneQuestions = lodash.cloneDeep(questions);
        const newAnswer: SurveyAnswer = { text: '', labelIds: [] };
        cloneQuestions[qIndex].answers.push(newAnswer);

        setHash(cloneQuestions[qIndex]);
        setQuestions(cloneQuestions);
    };
    const changeQuestionPrompt = (qIndex: number, newPrompt: string) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].prompt = newPrompt;

        setHash(cloneQuestions[qIndex]);
        setQuestions(cloneQuestions);
    };
    const changeQuestionType = (qIndex: number, newType: QuestionType) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].questionType = newType;
        if (newType !== QuestionType.MultipleChoice)
            cloneQuestions[qIndex].answers = [{ text: '', labelIds: [] }];

        setHash(cloneQuestions[qIndex]);
        setQuestions(cloneQuestions);
    };
    const changeAnswerText = (qIndex: number, aIndex: number, newText: string) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].answers[aIndex].text = newText;

        setHash(cloneQuestions[qIndex]);
        setQuestions(cloneQuestions);
    };
    const deleteQuestion = (qIndex: number) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions.splice(qIndex, 1);

        setQuestions(cloneQuestions);
    };
    const deleteAnswer = (qIndex: number, aIndex: number) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].answers.splice(aIndex, 1);

        setHash(cloneQuestions[qIndex]);
        setQuestions(cloneQuestions);
    };
    const changeLabels = (qIndex: number, aIndex: number, labelId: string) => {
        const cloneQuestions = lodash.cloneDeep(questions);

        const indexOfLabelId = questions[qIndex].answers[aIndex].labelIds.indexOf(labelId);
        if (indexOfLabelId === -1)
            cloneQuestions[qIndex].answers[aIndex].labelIds.push(labelId);
        else
            cloneQuestions[qIndex].answers[aIndex].labelIds.splice(indexOfLabelId, 1);

        setQuestions(cloneQuestions);
    };

    const getLabelConnections = (qIndex: number, aIndex: number) => {
        return labels.map(l => { return { ...l, isEnabled: questions[qIndex].answers[aIndex].labelIds.indexOf(l.id) !== -1 }; });
    };
    const conditionallySave = async () => {
        const hasLabel = questions.every(q => q.questionType === QuestionType.FreeResponse || q.answers.every(a => a.labelIds.length > 0));

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
        } else {
            const survey: SurveyTemplate = {
                title: title,
                description: desc,
                questions: questions
            };
            if (currentOperation === OperationType.Creating) {
                await newSurvey(survey);

                logSurveyCreation(survey.title, authInstance.currentUser!.email!);
            } else {
                if (surveyResponses.filter(sr => sr.surveyId === reduxSurveyData.id).length > 0) {
                    if (window.confirm('There are survey responses of this survey. Editing this survey will also edit the questions seen on the response. It will not effect the job opportunities shown on the response. Press OK to continue'))
                        await editSurvey(reduxSurveyData.id, survey);
                    else return;
                }
            }

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
            const cloneQuestions = lodash.cloneDeep(reduxSurveyData.questions);
            cloneQuestions.forEach(q => setHash(q));

            setDesc(reduxSurveyData.description);
            setTitle(reduxSurveyData.title);
            setQuestions(cloneQuestions);
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
                questions.map((q, qIndex) => {
                    return (
                        <div className="createdQuestion" key={qIndex}>
                            <div>
                                <div className="header">
                                    {(qIndex > 0) && <button className='shiftUp' onClick={() => moveQuestion(qIndex, qIndex - 1)}>Up</button>}
                                    {(qIndex < questions.length - 1) && <button className='shiftDown' onClick={() => moveQuestion(qIndex, qIndex + 1)}>Down</button>}
                                    <input type='text' className="prompt" value={q.prompt} placeholder="Question Prompt..." onChange={(e) => changeQuestionPrompt(qIndex, e.target.value)} />
                                    <div className="questionType">
                                        <select name="questionType" title="Question Type" onChange={e => changeQuestionType(qIndex, e.target.selectedIndex)} value={q.questionType}>
                                            <option value={0}>Multiple Choice</option>
                                            <option value={1}>Scale</option>
                                            <option value={2}>Free Response</option>
                                        </select>
                                    </div>
                                    {q.questionType === QuestionType.Scale
                                        ? <LabelConnector
                                            topOffset={pageRef.current ? pageRef.current.scrollTop : 0}
                                            toggleLabel={(labelId: string) => changeLabels(qIndex, 0, labelId)}
                                            labels={getLabelConnections(qIndex, 0)}
                                        />
                                        : null
                                    }
                                    <i className="fas fa-trash-alt delete" onClick={() => deleteQuestion(qIndex)}></i>
                                </div>
                                {q.questionType === QuestionType.MultipleChoice
                                    ? <div className='answers'>
                                        {
                                            q.answers?.map((option, aIndex) => {
                                                return <div key={'answer' + aIndex} className="answer" >
                                                    <input type="radio" placeholder='N/A' />
                                                    <input type="text" placeholder="Answer..." onChange={(e) => changeAnswerText(qIndex, aIndex, e.target.value)} value={option.text} />
                                                    <LabelConnector
                                                        topOffset={pageRef.current ? pageRef.current.scrollTop : 0}
                                                        toggleLabel={(labelId: string) => changeLabels(qIndex, aIndex, labelId)}
                                                        labels={getLabelConnections(qIndex, aIndex)}
                                                    />
                                                    <i className="fas fa-trash-alt delete" onClick={() => deleteAnswer(qIndex, aIndex)}></i>
                                                </div >;
                                            })
                                        }
                                        <button onClick={() => addNewAnswer(qIndex)}>Add Answer</button>
                                    </div>
                                    : null
                                }
                                {q.questionType === QuestionType.Scale
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
                                {q.questionType === QuestionType.FreeResponse
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
            <button onClick={addNewQuestion}>New Question</button>
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
