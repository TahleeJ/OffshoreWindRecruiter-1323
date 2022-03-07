import React from 'react';

/** The props (arguments) to create this element */
interface props {
    title?: String;
    message?: String;
    handleCancel?: () => void;
    handleAction?: () => void;
}

/** The header of the application. */
const Prompt: React.FC<props> = (props) => {
    return (
        <div id='Popup' className='Popup'>
            <div className='popBox'>
                <div className='PopupText'>
                    <h1>{props.title}</h1>
                    <p>{props.message}</p>
                </div>
                {props.handleCancel || props.handleAction ?
                    <div className='Buttons'>
                        {props.handleCancel && <button onClick={props.handleCancel}>Cancel</button>}
                        {props.handleAction && <button className="red" onClick={props.handleAction}>Delete</button>}
                    </div>
                    : null
                }
            </div>
        </div>
    )
}

export default Prompt

