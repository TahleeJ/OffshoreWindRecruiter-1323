import React, { useState } from "react";

import * as firestore from "@firebase/firestore";

import { Answer, QuestionType, Survey, SurveyQuestion } from "../../firebase/Types";
import db from "../../firebase/Firestore";

interface props {

}

const devQuestions: SurveyQuestion[] = [
    {
        prompt: "",
        questionType: QuestionType.MultipleChoice,
        answers: [],
    }
]

const SurverCreator: React.FC = (props: props) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [questions, setQuestions] = useState<SurveyQuestion[]>(devQuestions);

    const saveSurvey = () => {
        let survey: Survey = {
            title: title,
            description: desc,
            questions: questions
        }


        const surveyDoc = firestore.doc(db.Surveys, title);  // Refrence to a specific survey at 'survey/{title}'
        firestore.setDoc(surveyDoc, survey);

        // Gets survey
        firestore.getDoc(surveyDoc).then(d => {
            console.log(d.data()?.questions)
        })
    }

    const addNewQuestion = () => {
        setQuestions(s => [...s, { prompt: "", answers: [], questionType: QuestionType.MultipleChoice }])
    }
    const addNewAnswer = (qIndex: number) => {
        let cpyQuestions: any[] = [];
        questions.forEach((q, i) => {
            let value = q;
            if (i === qIndex) {
                const newAnswer: Answer = { text: '', labels: [] };
                const answers = q.answers ? [...q.answers, newAnswer] : [newAnswer];
                value = {
                    ...q,
                    answers: answers
                };
            }
            cpyQuestions.push(value);
        });
        setQuestions(cpyQuestions);
    }
    const changeQuestionPrompt = (index: number, newPrompt: string) => {
        let cpyQuestions: any[] = [];
        questions.forEach((q, i) => {
            let value = q;
            if (i === index) {
                value = {
                    ...q,
                    prompt: newPrompt
                };
            }
            cpyQuestions.push(value);
        });
        setQuestions(cpyQuestions);
    }
    const changeQuestionType = (index: number, type: string) => {
        let cpyQuestions: any[] = [];
        questions.forEach((q, i) => {
            let value = q;
            if (i === index) {
                value = {
                    ...q,
                    questionType: (QuestionType as any)[type]
                };
            }
            cpyQuestions.push(value);
        });
        setQuestions(cpyQuestions);
    }
    const changeAnswerText = (qIndex: number, aIndex: number, newText: string) => {
        let cpyQuestions: any[] = [];
        questions.forEach((q, qI) => {
            let changedQ = q;
            if (qI === qIndex) { //this is the question that needs to be modified
                const answers: Answer[] = [];
                (q.answers as Answer[]).forEach((a, aI) => {
                    let changedA = a;
                    if (aI === aIndex) { //this is the answer that needs to be modified
                        changedA = {
                            ...a,
                            text: newText
                        }
                    }
                    answers.push(changedA);
                });
                changedQ = {
                    ...q,
                    answers: answers
                };
            }
            cpyQuestions.push(changedQ);
        });
        setQuestions(cpyQuestions);
        // questions.forEach(q => {
        //     q.Answers?.forEach(a => {
        //         console.log(a.text)
        //     });
        // });
    }
    const deleteQuestion = (qIndex: number) => {
        let cpyQuestions: any[] = [];
        questions.forEach((q, i) => {
            if (i !== qIndex) cpyQuestions.push(q);
        });
        setQuestions(cpyQuestions);
    }
    const deleteAnswer = (qIndex: number, aIndex: number) => {
        let cpyQuestions: any[] = [];
        questions.forEach((q, qi) => {
            if (qi === qIndex) {
                let cpyQ = Object.assign(q);
                const cpyAnswers: Answer[] = [];
                q.answers?.forEach((a, ai) => {
                    if (ai !== aIndex)
                        cpyAnswers.push(a)
                })
                cpyQ.answers = cpyAnswers;
                cpyQuestions.push(cpyQ);
            } else cpyQuestions.push(q);
        });
        setQuestions(cpyQuestions);
    }

    return (
        <div className="surveyCreator">
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
                                        <select name="questionType" title="Question Type" onChange={(e) => changeQuestionType(qIndex, e.target.value)}>
                                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                            <option value="SCALE">Scale</option>
                                            <option value="FREE_RESPONSE">Free Response</option>
                                        </select>
                                    </div>
                                    <button className="delete red" onClick={() => deleteQuestion(qIndex)}>-</button>
                                </div>
                                {
                                    q.questionType === QuestionType.MultipleChoice ?
                                        <div className='options'>
                                            {
                                                q.answers?.map((answer, aIndex) => {
                                                    return <div key={"answer" + aIndex} className="answer" >
                                                        <input type="radio" placeholder='N/A' />
                                                        <input type="text" placeholder="Answer..." onChange={(e) => changeAnswerText(qIndex, aIndex, e.target.value)} value={answer.text} />
                                                        <button className="red delete" onClick={() => deleteAnswer(qIndex, aIndex)}>-</button>
                                                    </div >
                                                })
                                            }
                                            <button onClick={() => addNewAnswer(qIndex)}>Add Answer</button>
                                        </div>
                                        : null
                                }
                                {
                                    q.questionType === QuestionType.Scale ?
                                        <div className='s-options'>
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
                                {
                                    q.questionType === QuestionType.FreeResponse ?
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
        </div>
    )
}

export default SurverCreator;