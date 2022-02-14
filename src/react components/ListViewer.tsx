import React from 'react';

/** The props (arguments) to create this element */
interface props {
    height: string;
    title?: string;
    handleNew?: () => void;
}

/** The header of the application. */
const ListViewer: React.FC<props> = (props) => {

    return (
        <div className='listViewer' style={{ height: props.height }}>
            {props.title ?
                <div className='title'>{props.title}</div>
                : null
            }
            <div className='button'>
                <button className='green' onClick={props.handleNew} hidden={!props.handleNew}>Add New</button>
            </div>
            <div className='listElements'>
                {props.children}
            </div>
            
        </div>
    );
}

export default ListViewer;