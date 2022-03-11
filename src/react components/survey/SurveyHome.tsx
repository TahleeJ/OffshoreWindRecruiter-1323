import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { OperationType } from '../../redux/navigationSlice';
import SurveyAmdminister from './SurveyAdminister';
import SurveyCreator from './SurveyCreator';

/** The props (arguments) to create this element */
interface props {

}


/** The Survey Home to select and administer surveys */
const SurveyHome: React.FC<props> = (props) => {
    const operationType = useAppSelector(s => s.navigation.operationType);
    // const operationData = useAppSelector(s => s.navigation.operationData);

    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
            case OperationType.Administering:   //This will be shown when the survey is being administered
                return <SurveyAmdminister/>;
            case OperationType.Editing:
            case OperationType.Creating:
                return <SurveyCreator />
            default:
                return (
                    <div className='optionPage'> Not actually sure how you got here... </div>
                );
        }
    }

    return (<div id="surveyHome">{getSectionFromOType(operationType)}</div>)
}

export default SurveyHome;