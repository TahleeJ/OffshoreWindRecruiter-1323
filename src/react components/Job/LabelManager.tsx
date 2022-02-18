import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { changePage, PageType } from '../../redux/navigationSlice';
import ListViewer from '../ListViewer';
import ListElement from '../survey/ListElement';


/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const LabelManager: React.FC<props> = (props) => {
    const [InputValue, setInputValue] = useState("");
    const appDispatch = useAppDispatch();

    return (
        <div id='labelEditor' className='labelEditor'>
            <div className='labelHeader'>
                <div className='labelTitle'>Edit Label</div>
            </div>
            <div className="labelNamePrompt">
                <div className="title">Edit Label Name:</div>
                <input type="text" className ="labelNameInput" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Label Name'></input>
            </div>
            <div className="listContainer">
                <div className="questionsList">
                    <ListViewer height="350px" title="Associated Questions">                      
                        <ListElement name="Question Example" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Question Example" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Question Example" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Question Example" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Question Example" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Question Example" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                    </ListViewer>
                </div>
                <div className="jobOpsList">
                    <ListViewer height="350px" title="Associated Job Opportunities">                      
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                        <ListElement name="Job Opportunity" handleEdit={() => alert("This function has not been completed yet.")} handleDelete={() => alert("This function has not been completed yet.")} />
                    </ListViewer>
                </div>
            </div>
            <div className="buttons">
                <button className='gray' onClick={() => {appDispatch(changePage({ type: PageType.LabelManage })) }}>Cancel</button>
                <button className="green">Save Changes</button>
            </div>
        </div>
    );
}

export default LabelManager;