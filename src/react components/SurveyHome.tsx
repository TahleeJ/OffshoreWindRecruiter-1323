import React, { useEffect, useState } from 'react';
import { Todo, ListTodosQuery } from '../API';
import { listTodos } from '../graphql/queries';
import callGraphQL from '../queries/callGraphQL';

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
sampleQuery();

/** The header of the application. */
const SurveyHome: React.FC<props> = (props) => {
    const [sampleTodos, setSampleTodos] = useState<Todo[] | null>(null); //This is the state of this component.

    //"useEffect" is called after every render. In this case, we provide the empty array [] so that it's only called after the first render.
    useEffect(() => {
        /** This function will call our query and then set the state with the todos (triggering a rerender automatically) */
        async function wrappedQuery() {
            const todos = await sampleQuery();
            setSampleTodos(todos);
        }
        wrappedQuery();
    }, []);

    return (
        <>
            <div>THIS ELEMENT NEEDS TO BE DEVELOPED</div>
            <br />
            {   //SAMPLE: 
                sampleTodos?.map(todo => {
                    return <div key={todo.id}>TODO: {todo.description}</div>
                }) || null
            }
        </>
    );
}

export default SurveyHome;