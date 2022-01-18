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
            case OperationType.Administering:
                return (<div className='administerSurveyPage'>
                    You are administering a survey. This will be changed
                </div>);
            default:
                return (<div>
                    This will eventually be replaced with a survey list. For now, just click the button
                    <br />
                    <button onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>Administer dev survey</button>
                </div>);
        }
    }

    return <div id="surveyHome">{getSectionFromOType(operationType)}</div>
}

export default SurveyHome;