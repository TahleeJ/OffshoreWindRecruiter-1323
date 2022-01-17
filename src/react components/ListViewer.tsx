import React from 'react';

/** The props (arguments) to create this element */
interface props {
    height: string;
    title?: string;
}

/** The header of the application. */
const ListViewer: React.FC<props> = (props) => {

    return (
        <div className='listViewer' style={{ height: props.height }}>
            {props.title ?
                <div className='title'>{props.title}</div>
                : null
            }
            <div className='listElements'>
                {props.children}
            </div>
        </div>
    );
}

export default ListViewer;