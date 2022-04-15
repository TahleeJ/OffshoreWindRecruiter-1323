import React, { useState } from 'react';
import Prompt from './Prompt';


interface props {
    name: string;
    handleView?: () => void;
    handleEdit?: () => void;
    handleDelete?: () => void;
}


const ListElement: React.FC<props> = props => {
    const [popupVisible, setPopupVisible] = useState<Boolean>(false);
    const togglePopup = () => {
        setPopupVisible(!popupVisible);
    };
    return (
        <div className={'listElement'}>
            <div className={'name' + (props.handleView ? ' viewable' : '')} onClick={props.handleView}>{props.name}</div>
            {props.handleEdit && <i className="fas fa-edit edit" onClick={(e) => {
                e.stopPropagation(); // used to not active the "handleView" function
                e.nativeEvent.stopImmediatePropagation(); // used to not active the "handleView" function
                props.handleEdit && props.handleEdit();
            }} />}
            {props.handleDelete && <i className="fas fa-trash-alt delete" onClick={(e) => {
                e.stopPropagation(); // used to not active the "handleView" function
                e.nativeEvent.stopImmediatePropagation(); // used to not active the "handleView" function
                togglePopup();
            }} />}

            {(popupVisible) &&
                <Prompt
                    title={"Are you sure you want to delete '" + props.name + "'?"}
                    message="Deleting this item is not reversible"
                    handleCancel={togglePopup}
                    handleAction={() => {
                        if (props.handleDelete)
                            props.handleDelete();
                        togglePopup();
                    }}
                />
            }
        </div>
    );
};

export default ListElement;
