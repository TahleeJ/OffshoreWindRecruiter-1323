import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import ListViewer from '../ListViewer';
import ListElement from '../survey/ListElement';
import LabelCreator from './LabelCreator';
import { deleteLabel, getLabels, newLabel } from '../../firebase/LabelQueries';
import { setLabels } from '../../redux/dataSlice.ts';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const LabelManager: React.FC<props> = (props) => {
    const [newLabelName, setLabelName] = useState("");
    const resetInput = () => { setLabelName(""); }
    const operationType = useAppSelector(s => s.navigation.operationType);
    const labels = useAppSelector(s => s.data.labels);
    const appDispatch = useAppDispatch();

    const createLabel = async () => {
        await newLabel({
            name: newLabelName
        });
        resetInput();
        appDispatch(setLabels(await getLabels()));
    }
    const removeLabel = async (id: string) => {
        await deleteLabel(id);
        appDispatch(setLabels(await getLabels()));
    }

    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
            case OperationType.Editing:
            case OperationType.Creating:
                return <LabelCreator />;
            default:
                return (
                    <div id="labelPage">
                        <div className='labelHeader'>Manage Labels</div>
                        <div className='searchBar'>
                            <input type="text" className='searchInput' value={newLabelName} onChange={(e) => setLabelName(e.target.value)} placeholder='Search'></input>
                        </div>
                        <div className='labelContainer'>
                            <div className='addLabelDiv'>
                                <div className='addLabelPrompt'>Add A New Label</div>
                                <div className='barRow'>
                                    <div className='addLabelBar'>
                                        <input type="text" className='labelInput' value={newLabelName} onChange={(e) => setLabelName(e.target.value)} placeholder='Label Name'></input>
                                    </div>
                                    <button className='labelSubmit' onClick={createLabel}>Submit</button>
                                </div>
                            </div>
                            <div className='labelList'>
                                <ListViewer height="350px">
                                    {labels.length > 0 ?
                                        labels.map((label, index) => {
                                            return <ListElement
                                                name={label.name}
                                                key={index}
                                                handleEdit={() => appDispatch(changePage({ type: PageType.LabelManage, operation: OperationType.Editing, data: label }))} handleDelete={() => removeLabel(label.id)}
                                            />
                                        })
                                        : <div>There are currently no labels. Create a new one above</div>
                                    }
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