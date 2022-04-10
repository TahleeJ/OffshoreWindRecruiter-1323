import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changePage, OperationType, PageType } from '../../redux/navigationSlice';
import ListViewer from '../generic/ListViewer';
import ListElement from '../generic/ListElement';
import LabelCreator from './LabelCreator';
import { deleteLabel, getLabels, newLabel } from '../../firebase/Queries/LabelQueries';
import { setLabels } from '../../redux/dataSlice.ts';
import Prompt from '../generic/Prompt';

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
    const [popupVisible, setPopupVisible] = useState<Boolean>(false);
    const [errorMessage, setErrorMessage] = useState("");

    const togglePopup = () => setPopupVisible(!popupVisible);
    const checkEmpty = async () => {
        if (newLabelName.trim()) {
            await newLabel({
                name: newLabelName
            });
            resetInput();
            appDispatch(setLabels(await getLabels()));
            setErrorMessage("");
        } else {
            togglePopup();
            setErrorMessage("*This field is required");
        }
    }

    const removeLabel = async (id: string) => {
        // Should add some confirmation here

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
                        <div className='labelContainer'>
                            <button className='gray goBack' onClick={() => appDispatch(changePage({ type: PageType.AdminHome }))}>Go back</button>
                            <div className='addLabel'>
                                <div className='addLabelPrompt'>Add A New Label</div>
                                <input type="text" className='labelInput' value={newLabelName} onChange={(e) => setLabelName(e.target.value)} placeholder='Label Name' />

                                <button className='labelSubmit' onClick={checkEmpty}>Create</button>
                                {popupVisible && <Prompt title="Empty Input" message="You must provide text in order to create a new label" handleCancel={togglePopup} />}
                                <div className="error">{errorMessage}</div>
                            </div>
                            <ListViewer height="350px" title='Current Labels'>
                                {labels.length > 0 ?
                                    labels.map((label, index) => {
                                        return <ListElement
                                            name={label.name}
                                            key={index}
                                            handleEdit={() => appDispatch(changePage({ type: PageType.LabelManage, operation: OperationType.Editing, data: label }))}
                                            handleDelete={() => removeLabel(label.id)}
                                        />
                                    })
                                    : <div>There are currently no labels. Create a new one above</div>
                                }
                            </ListViewer>
                        </div>
                    </div >
                );
        }
    }

    return getSectionFromOType(operationType)
}

export default LabelManager;