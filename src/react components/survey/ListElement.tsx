import React from "react";

interface props {
    name: string;
    handleEdit: () => void;
    handleDelete: () => void;
}

const ListElement: React.FC<props> = (p) => {

    return (
        <div className="listElement">
            <div className="name">{p.name}</div>
            <button onClick={p.handleEdit}>Edit</button>
            <button className="red" onClick={p.handleDelete}>Delete</button>
        </div>
    )
}

export default ListElement