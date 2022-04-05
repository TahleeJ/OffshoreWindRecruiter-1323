import lodash from 'lodash';
import React, { useEffect, useState } from 'react';
import { hasId, QuestionType, SurveyResponse, SurveyTemplate } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changeOperation, changePage, OperationType, PageType, submitSurveyResponse } from '../../redux/navigationSlice';
import Prompt from '../Prompt';
import { authInstance } from '../../firebase/Firebase';
import { logSurveyAdministered } from '../../firebase/Analytics/Analytics';

interface props {

}



const SurveyAdminister: React.FC = (p: props) => {
    const reduxSurveyData = useAppSelector(s => s.navigation.operationData as SurveyTemplate & hasId);
    const [answers, setAnswers] = useState<(string | number)[]>([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [popupVisible, setPopupvisible] = useState<Boolean>(false);
    const dispatch = useAppDispatch();

    const togglePopup = () => setPopupvisible(!popupVisible);
    const handleRadioChange = (qI: number, aI: number) => {
        let clone = lodash.cloneDeep(answers);
        clone[qI] = aI;

        setAnswers(clone)
    }
    const handleTextChange = (qI: number, text: string) => {
        let clone = lodash.cloneDeep(answers);
        clone[qI] = text;

        setAnswers(clone)
    }
    const conditionallySave = async () => {
        if (answers.filter(a => a === "").length > 0) {
            togglePopup();
        } else {
            let survey: SurveyResponse = {
                surveyId: reduxSurveyData.id,
                taker: {
                    name: name,
                    email: email,
                    phone: phone,
                },
                answers: answers
            }


            logSurveyAdministered(reduxSurveyData.title, authInstance.currentUser!.email!);

            dispatch(submitSurveyResponse(survey))
            dispatch(changeOperation({ operation: OperationType.Reviewing }));
        }
    }

    useEffect(() => {
        setAnswers(reduxSurveyData.questions.map(q => ""))
    }, [reduxSurveyData]);

    return (
        <div className='administerSurveyPage container'>
            <div className='survey'>
                <div className='surveyTitle'>{reduxSurveyData.title}</div>
                <div className='description'>{reduxSurveyData.description}</div>
                <div className='questions'>
                    <div className={'question ' + QuestionType.FreeResponse}>
                        <div className='title'>Name:</div>
                        <input type="text" placeholder='John Doe...' value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className={'question ' + QuestionType.FreeResponse}>
                        <div className='title'>Phone Number (optional):</div>
                        <input type="text" placeholder='111 222 3456' value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className={'question ' + QuestionType.FreeResponse}>
                        <div className='title'>Email (optional):</div>
                        <input type="text" placeholder='example@email.com' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {reduxSurveyData.questions.map((question, qI) => {
                        return (
                            <div className={'question ' + QuestionType[question.questionType]} key={qI}>
                                <div className='title'>{question.prompt}</div>
                                {question.questionType === QuestionType.FreeResponse &&
                                    <textarea rows={5} placeholder='Answer...' value={answers[qI]} onChange={(e) => handleTextChange(qI, e.target.value)} />
                                }
                                {question.questionType === QuestionType.MultipleChoice &&
                                    <div className='answers'>
                                        {question.answers.map((answer, aI) => {
                                            return (
                                                <React.Fragment key={aI}>
                                                    <input type="radio" id={qI + "," + aI} name={qI.toString()} placeholder='N/A' checked={answers[qI] === aI} onChange={() => handleRadioChange(qI, aI)} />
                                                    <label htmlFor={qI + "," + aI}>{answer.text}</label>
                                                    <br />
                                                </React.Fragment>
                                            )
                                        })
                                        }
                                    </div>
                                }
                                {question.questionType === QuestionType.Scale &&
                                    <div className='answers'>
                                        Strongly Disagree
                                        {[0, 1, 2, 3, 4].map((index) => {
                                            return (
                                                <input key={index} type="radio" id={qI + "," + index} name={qI.toString()} placeholder='N/A' checked={answers[qI] === index} onChange={() => handleRadioChange(qI, index)} />
                                            )
                                        })}


                                        Strongly Agree
                                    </div>
                                }
                            </div>
                        )
                    })}
                    <button
                        onClick={() => dispatch(changePage({ type: PageType.Home }))}
                        className='red'
                    >
                        Cancel Survey
                    </button>
                    <button className='submit-survey' id={reduxSurveyData.title} onClick={conditionallySave}>Submit</button>
                </div>
            </div>
            {popupVisible &&
                <Prompt
                    title="Empty Input"
                    message="There are currently some empty text input fields. Please fill them all in before saving"
                    handleCancel={togglePopup}
                />
            }
        </div>
    )
}

export default SurveyAdminister;