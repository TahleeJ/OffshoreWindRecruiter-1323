import React, { useState } from "react";
import Prompt from "../Prompt";

interface props {
    name: string;
    handleEdit?: () => void;
    handleDelete?: () => void;
}

const ListElement: React.FC<props> = (p) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const togglePopup = () => {
        setPopupVisible(!popupVisible);
    }

    return (
        <div className="listElement">
            <div className="name">{p.name}</div>
            {p.handleEdit && <i className="fas fa-edit edit" onClick={p.handleEdit} />}
            {p.handleDelete && <i className="fas fa-trash-alt delete" onClick={togglePopup} />}

            {(popupVisible) &&
                <Prompt
                    title={"Are you sure you want to delete '" + p.name + "'?"}
                    message="Deleting this item is not reversible"
                    handleCancel={togglePopup}
                    handleAction={() => {
                        if (p.handleDelete)
                            p.handleDelete();
                        togglePopup();
                    }}
                />
            }
        </div>
    )
}

export default ListElement