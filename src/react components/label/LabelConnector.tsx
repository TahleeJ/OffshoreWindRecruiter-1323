import React, { useEffect, useRef, useState } from "react";
import { hasId, Label } from "../../firebase/Types";
import LabelSelector from "./LabelSelector";

interface props {
    labels: (Label & hasId & { isEnabled: boolean })[];
    toggleLabel: (id: string) => void;
}

const LabelConnector: React.FC<props> = (p) => {
    const [selectorOpen, setSelectorOpen] = useState(false);
    const elementRef = useRef(null);
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

    const toggleSelector = () => setSelectorOpen(!selectorOpen);

    useEffect(() => {
        if (elementRef.current) {
            setTop((elementRef.current as HTMLElement).getBoundingClientRect().top as number)
            setLeft((elementRef.current as HTMLElement).getBoundingClientRect().left as number)
        }
    }, []);

    const labelCount = p.labels.filter(l => l.isEnabled).length;

    return (
        <>
            <i className="fas fa-tags" onClick={toggleSelector} ref={elementRef}>
                {labelCount > 0 ? <span className="labelCount">{labelCount}</span> : null}
            </i>

            {selectorOpen ?
                <LabelSelector
                    toggleLabel={p.toggleLabel}
                    handleClose={(e) => {
                        toggleSelector();
                    }}
                    labels={p.labels}
                    top={top}
                    left={left}
                />
                : null
            }
        </>
    )
}

export default LabelConnector;