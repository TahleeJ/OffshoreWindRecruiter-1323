import React, { useState } from "react";
import DeletePopup from "./DeletePopup";



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
                <DeletePopup
                    style="delete"
                    type={p.type?.toUpperCase()}
                    name={p.name}
                    handleCancel={togglePopup}
                    handleDelete={() => { p.handleDelete(); togglePopup() }}
                />
            }
        </div>
    )
}

export default ListElement