import React, { useState } from "react";
import Prompt from "../Prompt";



interface props {

    type?: string;
    name: string;
    handleEdit: () => void;
    handleDelete: () => void;
}

const ListElement: React.FC<props> = (p) => {
    const [popupVisible, setPopupvisible] = useState<Boolean>(false);
    const togglePopup = () => {
        setPopupvisible(!popupVisible);
    }
    return (
        <div className="listElement">
            <div className="name">{p.name}</div>
            <i className="fas fa-edit edit" onClick={p.handleEdit} />
            <i className="fas fa-trash-alt delete" onClick={togglePopup} />

            {popupVisible &&
                <Prompt
                    title={"Are you sure you want to delete '" + p.name + "'?"}
                    message="Deleting this item is not reversible"
                    handleCancel={togglePopup}
                    handleAction={() => { p.handleDelete(); togglePopup() }}
                />
            }
        </div>
    )
}

export default ListElement