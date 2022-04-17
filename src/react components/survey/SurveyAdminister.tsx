import lodash from 'lodash';
import React, { useEffect, useState } from 'react';
import { hasId, ComponentType, SentSurveyResponse, SurveyTemplate } from '../../firebase/Types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changeOperation, changePage, OperationType, PageType, submitSurveyResponse } from '../../redux/navigationSlice';
import Prompt from '../generic/Prompt';
import { authInstance } from '../../firebase/Firebase';
import { logSurveyAdministered } from '../../firebase/Analytics/Logging';


const SurveyAdminister: React.FC = () => {
    const reduxSurveyData = useAppSelector(s => s.navigation.operationData as SurveyTemplate & hasId);
    const [answers, setAnswers] = useState<(string | number)[]>([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [popupVisible, setPopupVisible] = useState<Boolean>(false);
    const dispatch = useAppDispatch();

    const togglePopup = () => setPopupVisible(!popupVisible);
    const handleRadioChange = (qI: number, aI: number) => {
        const clone = lodash.cloneDeep(answers);
        clone[qI] = aI;

        setAnswers(clone);
    };
    const handleTextChange = (qI: number, text: string) => {
        const clone = lodash.cloneDeep(answers);
        clone[qI] = text;

        setAnswers(clone);
    };
    const conditionallySave = async () => {
        if (answers.some((answer, index) => reduxSurveyData.components[index].componentType & ComponentType.Question && answer === '')) {
            togglePopup();
        } else {
            const survey: SentSurveyResponse = {
                surveyId: reduxSurveyData.id,
                taker: {
                    name: name,
                    email: email,
                    phone: phone
                },
                answers: answers
            };


            logSurveyAdministered(reduxSurveyData.title, authInstance.currentUser!.email!);

            dispatch(submitSurveyResponse(survey));
            dispatch(changeOperation({ operation: OperationType.Reviewing }));
        }
    };

    useEffect(() => {
        setAnswers(reduxSurveyData.components.map(q => ''));
    }, [reduxSurveyData]);

    return (
        <div className='administerSurveyPage container'>
            <div className='survey'>
                <div className='surveyTitle'>{reduxSurveyData.title}</div>
                <div className='description'>{reduxSurveyData.description}</div>
                <div className='questions'>
                    <div className={'question ' + ComponentType.FreeResponse}>
                        <div className='title'>Name:</div>
                        <input type="text" placeholder='John Doe...' value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className={'question ' + ComponentType.FreeResponse}>
                        <div className='title'>Phone Number (optional):</div>
                        <input type="text" placeholder='111 222 3456' value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className={'question ' + ComponentType.FreeResponse}>
                        <div className='title'>Email (optional):</div>
                        <input type="text" placeholder='example@email.com' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {reduxSurveyData.components.map((component, cI) => {
                        return (
                            <div className={'question ' + ComponentType[component.componentType]} key={cI}>
                                {component.componentType & ComponentType.Question
                                    ? <div className='title'>{component.prompt}</div>
                                    : null
                                }

                                {component.componentType === ComponentType.Text &&
                                    <label>{component.prompt}</label>
                                }
                                {component.componentType === ComponentType.Image &&
                                    <img src={component.prompt} alt="Image" />
                                }
                                {component.componentType === ComponentType.FreeResponse &&
                                    <textarea rows={5} placeholder='Answer...' value={answers[cI]} onChange={(e) => handleTextChange(cI, e.target.value)} />
                                }
                                {component.componentType === ComponentType.MultipleChoice &&
                                    <div className='answers'>
                                        {component.answers.map((answer, aI) => {
                                            return (
                                                <React.Fragment key={aI}>
                                                    <input type="radio" id={cI + ',' + aI} name={cI.toString()} placeholder='N/A' checked={answers[cI] === aI} onChange={() => handleRadioChange(cI, aI)} />
                                                    <label htmlFor={cI + ',' + aI}>{answer.text}</label>
                                                    <br />
                                                </React.Fragment>
                                            );
                                        })
                                        }
                                    </div>
                                }
                                {component.componentType === ComponentType.Scale &&
                                    <div className='answers'>
                                        Strongly Disagree
                                        {[0, 1, 2, 3, 4].map((index) => {
                                            return (
                                                <input key={index} type="radio" id={cI + ',' + index} name={cI.toString()} placeholder='N/A' checked={answers[cI] === index} onChange={() => handleRadioChange(cI, index)} />
                                            );
                                        })}


                                        Strongly Agree
                                    </div>
                                }
                            </div>
                        );
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
    );
};

export default SurveyAdminister;
