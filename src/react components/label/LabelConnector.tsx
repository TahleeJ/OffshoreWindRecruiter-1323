import React, { useEffect, useRef, useState } from "react";
import { hasId, Label } from "../../firebase/Types";
import LabelSelector from "./LabelSelector";

interface props {
    labels: (Label & hasId & { isEnabled: boolean })[];
    topOffset: number;
    toggleLabel: (id: string) => void;
}

const LabelConnector: React.FC<props> = (p) => {
    const [selectorOpen, setSelectorOpen] = useState(false);
    const elementRef = useRef<HTMLElement>(null);
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

    const toggleSelector = () => setSelectorOpen(!selectorOpen);

    useEffect(() => {
        if (elementRef.current) {
            console.log(p.topOffset)
            // setTop( as number)
            // setLeft( as number)
        }
    }, []);

    const labelCount = p.labels.filter(l => l.isEnabled).length;

    return (
        <>
            <i className="fas fa-tags labelIcon" onClick={toggleSelector} ref={elementRef}>
                {labelCount > 0 ? <span className="labelCount">{labelCount}</span> : null}
            </i>

            {selectorOpen ?
                <LabelSelector
                    toggleLabel={p.toggleLabel}
                    handleClose={(e) => {
                        toggleSelector();
                    }}
                    labels={p.labels}
                    top={(elementRef.current as HTMLElement).getBoundingClientRect().top - p.topOffset}
                    left={(elementRef.current as HTMLElement).getBoundingClientRect().left}
                />
                : null
            }
        </>
    )
}

export default LabelConnector;