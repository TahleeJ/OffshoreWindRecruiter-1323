import React, { useState } from "react";
import lodash from "lodash"

import { Answer, Question, Survey, SurveyQuestion } from "../../firebase/Types";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { changePage, OperationType, PageType } from "../../redux/navigationSlice";
import { editSurvey, getSurveys, newSurvey } from "../../firebase/Queries/SurveyQueries";
import { useEffect } from "react";
import { setSurveys } from "../../redux/dataSlice.ts";
import LabelConnector from "../label/LabelConnector";

interface props {

}

const initQuestions: SurveyQuestion[] = [
    {
        prompt: "",
        questionType: Question.MultipleChoice,
        answers: [],
    }
]

const SurverCreator: React.FC = (props: props) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [questions, setQuestions] = useState<SurveyQuestion[]>(initQuestions);
    /** This is the current operation that is being done with surveys...usually creating/editing */
    const currentOperation = useAppSelector(s => s.navigation.operationType);
    /** This contains the old survey data. */
    const reduxSurveyData = useAppSelector(s => s.navigation.operationData as Survey & { id: string });
    const labels = useAppSelector(s => s.data.labels);
    const dispatch = useAppDispatch();

    const saveSurvey = async () => {
        let survey: Survey = {
            title: title,
            description: desc,
            questions: questions,
        }
        if (currentOperation === OperationType.Creating)
            await newSurvey(survey);
        else
            await editSurvey(reduxSurveyData.id, survey);

        dispatch(changePage({ type: PageType.AdminHome }));
        dispatch(setSurveys(await getSurveys()));
    }

    const addNewQuestion = () => {
        setQuestions(s => [...s, { prompt: "", answers: [], questionType: Question.MultipleChoice }])
    }

    const addNewAnswer = (qIndex: number) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        const newAnswer: Answer = { text: '', labelIds: [] };
        cloneQuestions[qIndex].answers.push(newAnswer)

        setQuestions(cloneQuestions);
    }

    const changeQuestionPrompt = (qIndex: number, newPrompt: string) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].prompt = newPrompt;

        setQuestions(cloneQuestions);
    }
    const changeQuestionType = (qIndex: number, newType: Question) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].questionType = newType;
        if (newType !== Question.MultipleChoice)
            cloneQuestions[qIndex].answers = [{ text: "", labelIds: [] }]
        setQuestions(cloneQuestions);

    }
    const changeAnswerText = (qIndex: number, aIndex: number, newText: string) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].answers[aIndex].text = newText;

        setQuestions(cloneQuestions);
    }

    const deleteQuestion = (qIndex: number) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions.splice(qIndex, 1);

        setQuestions(cloneQuestions);
    }

    const deleteAnswer = (qIndex: number, aIndex: number) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        cloneQuestions[qIndex].answers.splice(aIndex, 1);

        setQuestions(cloneQuestions);
    }
    const changeLabels = (qIndex: number, aIndex: number, labelId: string) => {
        let cloneQuestions = lodash.cloneDeep(questions);

        const indexOfLabelId = questions[qIndex].answers[aIndex].labelIds.indexOf(labelId);
        if (indexOfLabelId === -1)
            cloneQuestions[qIndex].answers[aIndex].labelIds.push(labelId);
        else
            cloneQuestions[qIndex].answers[aIndex].labelIds.splice(indexOfLabelId, 1);

        setQuestions(cloneQuestions);
    }

    const getLabelConnections = (qIndex: number, aIndex: number) => {
        return labels.map(l => {
            // console.log(questions[qIndex].answers[aIndex].labelIds);
            return {
                ...l,
                isEnabled: questions[qIndex].answers[aIndex].labelIds.indexOf(l.id) !== -1
            }
        });
    }

    useEffect(() => {
        //copy the data from the redux state into the local state if editing (and only do it when the redux state changes)
        if (currentOperation === OperationType.Editing) {
            setDesc(reduxSurveyData.description)
            setTitle(reduxSurveyData.title);
            setQuestions(reduxSurveyData.questions);
        }
    }, [reduxSurveyData, currentOperation]);

    return (
        <div className="surveyCreator">
            <button className="red" onClick={() => dispatch(changePage({ type: PageType.AdminHome }))}>Go Back</button>
            <div className="surveyHeader">
                <input type='text' className="surveyTitle" placeholder="Survey Title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="surveyDescription" placeholder="Survey Description..." value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            {
                questions.map((q, qIndex) => {
                    return (
                        <div className="createdQuestion" key={qIndex}>
                            <div>
                                <div className="header">
                                    <input type='text' className="prompt" value={q.prompt} placeholder="Question Prompt..." onChange={(e) => changeQuestionPrompt(qIndex, e.target.value)} />
                                    <div className="questionType">
                                        <select name="questionType" title="Question Type" onChange={e => changeQuestionType(qIndex, Question[e.target.value as keyof typeof Question])}>
                                            <option value="MultipleChoice" selected={q.questionType === Question.MultipleChoice}>Multiple Choice</option>
                                            <option value="Scale" selected={q.questionType === Question.Scale}>Scale</option>
                                            <option value="FreeResponse" selected={q.questionType === Question.FreeResponse}>Free Response</option>
                                        </select>
                                    </div>
                                    {q.questionType === Question.Scale ?
                                        <LabelConnector
                                            toggleLabel={(labelId: string) => changeLabels(qIndex, 0, labelId)}
                                            labels={getLabelConnections(qIndex, 0)}
                                        />
                                        : null
                                    }
                                    <i className="fas fa-trash-alt delete" onClick={() => deleteQuestion(qIndex)}></i>
                                </div>
                                {q.questionType === Question.MultipleChoice ?
                                    <div className='answers'>
                                        {
                                            q.answers?.map((option, aIndex) => {
                                                return <div key={"answer" + aIndex} className="answer" >
                                                    <input type="radio" placeholder='N/A' />
                                                    <input type="text" placeholder="Answer..." onChange={(e) => changeAnswerText(qIndex, aIndex, e.target.value)} value={option.text} />
                                                    <LabelConnector
                                                        toggleLabel={(labelId: string) => changeLabels(qIndex, aIndex, labelId)}
                                                        labels={getLabelConnections(qIndex, aIndex)}
                                                    />
                                                    <i className="fas fa-trash-alt delete" onClick={() => deleteAnswer(qIndex, aIndex)}></i>
                                                </div >
                                            })
                                        }
                                        <button onClick={() => addNewAnswer(qIndex)}>Add Answer</button>
                                    </div>
                                    : null
                                }
                                {q.questionType === Question.Scale ?
                                    <div className='s-answers'>
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
                                {q.questionType === Question.FreeResponse ?
                                    <div>
                                        During survey administering, the user will be presented with a text input field
                                    </div>
                                    : null
                                }
                            </div>
                            <div></div>
                        </div>
                    )
                })
            }
            <button onClick={addNewQuestion}>New Question</button>
            <button onClick={saveSurvey}>{currentOperation === OperationType.Creating ? "Save Survey as New" : "Save Edits"}</button>
        </div >
    )
}

export default SurverCreator;