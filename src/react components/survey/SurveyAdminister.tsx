import lodash from 'lodash';
import React, { useEffect, useState } from 'react';
import { newSurveyResponse } from '../../firebase/Queries/SurveyQueries';
import { hasId, QuestionType, SurveyResponse, SurveyTemplate } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, PageType } from '../../redux/navigationSlice';
import Prompt from '../Prompt';

interface props {

}

const initialResponse: SurveyResponse = {
    surveyId: "",
    taker: {
        name: "",
        email: "",
        phone: "",
    },
    answers: []
}

const SurveyAdminister: React.FC = (p: props) => {
    const reduxSurveyData = useAppSelector(s => s.navigation.operationData as SurveyTemplate & hasId);
    const [responseState, setResponseState] = useState<SurveyResponse>(initialResponse);
    const dispatch = useAppDispatch();
    const [popupVisible, setPopupvisible] = useState<Boolean>(false);

    const togglePopup = () => setPopupvisible(!popupVisible);
    const handleRadioChange = (qI: number, aI: number) => {
        let clone = lodash.cloneDeep(responseState.answers);
        clone[qI] = aI;

        setResponseState({
            ...responseState,
            answers: clone
        })
    }
    const handleTextChange = (qI: number, text: string) => {
        let clone = lodash.cloneDeep(responseState.answers);
        clone[qI] = text;

        setResponseState({
            ...responseState,
            answers: clone
        })
    }
    const conditionallySave = async () => {
        if (responseState.answers.filter(a => a === "").length > 0) {
            togglePopup();
        } else {
            let survey: SurveyResponse = {
                surveyId: responseState.surveyId,
                taker: {
                    name: responseState.taker.name,
                    email: responseState.taker.email,
                    phone: responseState.taker.phone,
                },
                answers: responseState.answers
            }
            await newSurveyResponse(survey);

            dispatch(changePage({ type: PageType.Home }));
            //TODO: Get survey responses
            // dispatch();
        }
    }

    useEffect(() => {
        setResponseState({
            ...initialResponse,
            surveyId: reduxSurveyData.id,
            answers: reduxSurveyData.questions.map(q => "")
        })
    }, [reduxSurveyData]);

    return (
        <div className='administerSurveyPage container'>
            <div className='survey'>
                <div className='surveyTitle'>{reduxSurveyData.title}</div>
                <div className='description'>{reduxSurveyData.description}</div>
                <div className='questions'>
                    {
                        reduxSurveyData.questions.map((question, qI) => {
                            return (
                                <div className={'question ' + QuestionType[question.questionType]} key={qI}>
                                    <div className='title'>{question.prompt}</div>
                                    {question.questionType === QuestionType.FreeResponse &&
                                        <textarea rows={5} placeholder='Answer...' value={responseState.answers[qI]} onChange={(e) => handleTextChange(qI, e.target.value)} />
                                    }
                                    {question.questionType === QuestionType.MultipleChoice &&
                                        <div className='answers'>
                                            {question.answers.map((answer, aI) => {
                                                return (
                                                    <React.Fragment key={aI}>
                                                        <input type="radio" id={qI + "," + aI} name={qI.toString()} placeholder='N/A' checked={responseState.answers[qI] === aI} onChange={() => handleRadioChange(qI, aI)} />
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
                                                    <input key={index} type="radio" id={qI + "," + index} name={qI.toString()} placeholder='N/A' checked={responseState.answers[qI] === index} onChange={() => handleRadioChange(qI, index)} />
                                                )
                                            })}


                                            Strongly Agree
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }
                    <button
                        onClick={() => dispatch(changePage({ type: PageType.Home }))}
                        className='gray'
                    >Cancel Survey</button>
                    <button onClick={conditionallySave}>Submit</button>
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