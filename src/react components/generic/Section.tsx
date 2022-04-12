import React, { useState } from "react";

interface props {
    // extraClassName : string
    title: string;
}

const Section: React.FC<props> = p => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={"section"}>
            <div className="title">
                {p.title}
                <i className={"toggleButton " + (isOpen ? "fas fa-caret-up" : "fas fa-caret-down")} onClick={() => setIsOpen(!isOpen)}></i>
            </div>
            <div className={"content " + (isOpen ? "open" : "closed") }>
                {p.children}
            </div>

        </div>
    )
}

export default Section;