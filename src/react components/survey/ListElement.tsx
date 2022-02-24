import React, { useState } from "react";
import DeletePopup from "./DeletePopup";



interface props {
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
            <button className="edit" onClick={p.handleEdit}>Edit</button>
            <button className='red' onClick={togglePopup}>Delete</button>
            
            {popupVisible && <DeletePopup handleCancel={togglePopup} handleDelete={p.handleDelete}></DeletePopup>}

            
        </div>
    )
}

export default ListElement