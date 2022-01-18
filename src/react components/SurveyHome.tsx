import React, { useEffect, useState } from 'react';
import { Todo, ListTodosQuery } from '../API';
import { listTodos } from '../graphql/queries';
import callGraphQL from '../queries/callGraphQL';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changeOperation, OperationType } from '../redux/navigationSlice';

/** The props (arguments) to create this element */
interface props {

}

/** We can create this functions and put them all in a folder such as ./queries They can then be used to interact with the database */
async function sampleQuery(): Promise<Todo[] | null> {
    try {
        const sampleData = await callGraphQL<ListTodosQuery>(listTodos)
        console.log("Got data", sampleData);
        return sampleData.data?.listTodos?.items as Todo[] || null;
    } catch (error: any) {
        console.warn(error);
    }
    return null;
}



/** The Survey Home to select and administer surveys */
const SurveyHome: React.FC<props> = (props) => {
    const operationType = useAppSelector(s => s.navigation.operationType);
    const operationData = useAppSelector(s => s.navigation.operationData);
    const dispatch = useAppDispatch();

    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
            case OperationType.Administering:   //This will be shown when the survey is being administered
                return (<div className='administerSurveyPage'>
                    <div className='survey'>
                        <div className='surveyTitle'>
                            Survey Title
                        </div>
                        <div className='description'>
                            This is the description of the survey. There probably should be instructions here, and potentially a brief background of why the survey is taken
                        </div>
                        <div className='questions'>
                            {/* The questions will go here. They will be mapped from the current survey */}
                            <div className='question frq'>
                                <div className='title'>This is an FRQ! What do you think of it?</div>
                                <textarea rows={5} placeholder='Answer...' />
                            </div>
                            <div className='question sq'>
                                <div className='title'>This is an Scaled Question! What do you think of it?</div>
                                <div className='options'>
                                    Strongly Disagree
                                    <input type="radio" id="QUESTION_ID_1" name="QUESTIONID" placeholder='N/A' />
                                    <input type="radio" id="QUESTION_ID_2" name="QUESTIONID" placeholder='N/A' />
                                    <input type="radio" id="QUESTION_ID_3" name="QUESTIONID" placeholder='N/A' />
                                    <input type="radio" id="QUESTION_ID_4" name="QUESTIONID" placeholder='N/A' />
                                    <input type="radio" id="QUESTION_ID_5" name="QUESTIONID" placeholder='N/A' />
                                    Strongly Agree
                                </div>
                            </div>
                            <div className='question mcq'>
                                <div className='title'>This is a multiple choice question! What do you think of it?</div>
                                <div className='options'>
                                    <input type="radio" id="QUESTION2_ID_1" name="QUESTIONID2" placeholder='N/A' />
                                    <label htmlFor='QUESTION_ID_1'>Option 1</label>
                                    <br />

                                    <input type="radio" id="QUESTION2_ID_2" name="QUESTIONID2" placeholder='N/A' />
                                    <label htmlFor='QUESTION2_ID_2'>Option 2</label>
                                    <br />

                                    <input type="radio" id="QUESTION2_ID_3" name="QUESTIONID2" placeholder='N/A' />
                                    <label htmlFor='QUESTION2_ID_3'>Option 3</label>
                                    <br />

                                    <input type="radio" id="QUESTION2_ID_4" name="QUESTIONID2" placeholder='N/A' />
                                    <label htmlFor='QUESTION2_ID_4'>Option 4</label>
                                </div>
                            </div>
                            <button onClick={() => alert("This isn't done yet bro")} className='gray'>Cancel Survey</button>
                            <button onClick={() => alert("This isn't done yet bro")}>Submit</button>
                        </div>
                    </div>
                </div>);
            default:
                return (<div>
                    This will eventually be replaced with a survey list. For now, just click the button
                    <br />
                    <button onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>Administer test survey</button>
                </div>);
        }
    }

    return <div id="surveyHome">{getSectionFromOType(operationType)}</div>
}

export default SurveyHome;