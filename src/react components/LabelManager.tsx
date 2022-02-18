import React, { useContext, useState } from 'react';
import { AuthContext, authInstance } from "../firebase/Firebase";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';
import ListElement from './survey/ListElement';
import LabelManage from './Job/LabelManager';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const LabelManager: React.FC<props> = (props) => {
    const [InputValue, setInputValue] = useState("");
    const resetInput = () => {
        setInputValue("");
    }
    const operationType = useAppSelector(s => s.navigation.operationType);
    const appDispatch = useAppDispatch();
    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
            case OperationType.Editing:
            case OperationType.Creating:
                return <LabelManage />;
            default:
                return (
                    <div id = "labelPage">
                        <div className ='labelHeader'>Manage Labels</div>
                        <div className = 'searchBar'>
                            <input type = "text" className='searchInput' value = {InputValue} onChange = {(e) => setInputValue(e.target.value)} placeholder = 'Search'></input>
                        </div>
                        <div className = 'labelContainer'>
                            <div className = 'addLabelDiv'>
                                <div className = 'addLabelPrompt'>Add A New Label</div>
                                <div className = 'barRow'>
                                    <div className = 'addLabelBar'>
                                        <input type = "text" className='labelInput' value = {InputValue} onChange = {(e) => setInputValue(e.target.value)} placeholder = 'Label Name'></input>
                                    </div>
                                    <button className = 'labelSubmit'>Submit</button>
                                </div>
                            </div>
                            <div className = 'labelList'>
                                <ListViewer height="350px">                      
                                    <ListElement name="label" handleEdit={() => appDispatch(changePage({ type: PageType.LabelManage, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")} />
                                    <ListElement name="label" handleEdit={() => appDispatch(changePage({ type: PageType.LabelManage, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")} />
                                    <ListElement name="label" handleEdit={() => appDispatch(changePage({ type: PageType.LabelManage, operation: OperationType.Editing }))} handleDelete={() => alert("This function has not been completed yet.")} />
                                </ListViewer>
                            </div>
                        </div>
                    </div>
                );
        }
    }
    return (<div id="surveyHome">{getSectionFromOType(operationType)}</div>)
}

export default LabelManager;