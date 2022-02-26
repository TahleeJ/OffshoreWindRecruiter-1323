import React from 'react';

/** The props (arguments) to create this element */
interface props {
    type?: String;
    name: String;
    handleCancel: () => void;
    handleDelete: () => void;
}

/** The header of the application. */
const DeletePopup: React.FC<props> = (props) => {
    return  (
        <div id='Popup' className='Popup'>
            <div className = 'popBox'>
                <div className='PopupText'>
                    <h1>Are you sure you want to delete {props.type} {props.name}?</h1>
                    <p>This action is permanent</p>
                </div>
                <div className='Buttons'>
                    <button className="red" onClick={props.handleDelete}>Delete</button>
                    <button onClick={props.handleCancel}>Cancel</button>
                </div>
            </div>
            
        </div>
    )
}

export default DeletePopup

