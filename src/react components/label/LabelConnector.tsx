import React, { useRef, useState } from 'react';
import { hasId, Label } from '../../firebase/Types';
import LabelSelector from './LabelSelector';


interface props {
    labels: (Label & hasId & { isEnabled: boolean })[];
    topOffset: number;
    toggleLabel: (id: string) => void;
}


const LabelConnector: React.FC<props> = props => {
    const [selectorOpen, setSelectorOpen] = useState(false);
    const elementRef = useRef<HTMLElement>(null);
    const toggleSelector = () => setSelectorOpen(!selectorOpen);

    const labelCount = props.labels.filter(l => l.isEnabled).length;

    return (
        <>
            <i className="fas fa-tags labelIcon" onClick={toggleSelector} ref={elementRef}>
                {labelCount > 0 ? <span className="labelCount">{labelCount}</span> : null}
            </i>

            {selectorOpen
                ? <LabelSelector
                    toggleLabel={props.toggleLabel}
                    handleClose={(e) => {
                        toggleSelector();
                    }}
                    labels={props.labels}
                    top={(elementRef.current as HTMLElement).getBoundingClientRect().top - props.topOffset}
                    left={(elementRef.current as HTMLElement).getBoundingClientRect().left}
                />
                : null
            }
        </>
    );
};

export default LabelConnector;
