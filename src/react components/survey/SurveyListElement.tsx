import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import { changeOperation, changePage, OperationType, PageType } from "../../redux/navigationSlice";

interface props {

}

const SurveyListElement: React.FC<props> = (p) => {
    const appDispatch = useAppDispatch();

    return (
        <div className="surveyListElement">
            <div className="name">Survey Template Name</div>
            <button onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Creating }))}>Edit</button>
            <button className="red" onClick={() => alert("This function has not been completed yet.")}>Delete</button>
        </div>
    )
}

export default SurveyListElement