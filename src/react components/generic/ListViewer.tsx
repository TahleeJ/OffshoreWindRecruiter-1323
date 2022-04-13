import Tooltip from 'rc-tooltip';
import React from 'react';
import TooltipInfo from '../TooltipInfo';
import ToolTipInfo from '../TooltipInfo';

/** The props (arguments) to create this element */
interface props {
    height?: string;
    title?: string;
    handleNew?: () => void;
    content?: string; //info content to add to the info popup
}

/** The header of the application. */
const ListViewer: React.FC<props> = (props) => {
    
    return (
        <div className='listViewer' style={props.height ? { height: props.height } : {}}>
            {props.title ?
                (<>
                    <div className='title'>
                        {props.title}
                        <TooltipInfo textarea={props.content}></TooltipInfo>
                    </div>
                    
                    {props.handleNew ?
                        <i className="fas fa-plus addNew" onClick={props.handleNew} />
                        : null
                    }
                </>)
                : null
            }
            <div className='listElements'>
                {props.children}
            </div>

        </div>
    );
}

export default ListViewer;