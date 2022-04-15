import React from 'react';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';


interface props {
    textarea?: string; // string text that you can edit to show infomation to users
}


const ToolTipInfo: React.FC<props> = (props) => {
    // const textarea=<span>{props.textarea}</span>
    return (
        <Tooltip trigger={['click']} placement='bottom' overlay={props.textarea}>
            <i className='fas fa-info info'></i>
        </Tooltip>
    );
};

export default ToolTipInfo;
