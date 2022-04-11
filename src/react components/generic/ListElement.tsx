import React, { useState } from "react";
import Prompt from "./Prompt";

interface props {
    name: string;
    handleView?: () => void;
    handleEdit?: () => void;
    handleDelete?: () => void;
}

const ListElement: React.FC<props> = (p) => {
    const [popupVisible, setPopupvisible] = useState<Boolean>(false);
    const togglePopup = () => {
        setPopupvisible(!popupVisible);
    }
    return (
        <div className={"listElement"}>
            <div className={"name" + (p.handleView ? " viewable" : "")} onClick={p.handleView}>{p.name}</div>
            {p.handleEdit && <i className="fas fa-edit edit" onClick={(e) => {
                e.stopPropagation(); //used to not active the "handleView" function
                e.nativeEvent.stopImmediatePropagation(); //used to not active the "handleView" function
                p.handleEdit && p.handleEdit();
            }} />}
            {p.handleDelete && <i className="fas fa-trash-alt delete" onClick={(e) => {
                e.stopPropagation(); //used to not active the "handleView" function
                e.nativeEvent.stopImmediatePropagation(); //used to not active the "handleView" function
                togglePopup();
            }} />}

            {(popupVisible) &&
                <Prompt
                    title={"Are you sure you want to delete '" + p.name + "'?"}
                    message="Deleting this item is not reversible"
                    handleCancel={togglePopup}
                    handleAction={() => {
                        if (p.handleDelete)
                            p.handleDelete();
                        togglePopup()
                    }}
                />
            }
        </div>
    )
}

export default ListElement