import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { OperationType } from '../../redux/navigationSlice';
import SurveyAdminister from './SurveyAdminister';
import SurveyCreator from './SurveyCreator';
import ResponseView from './ResponseView';
import SurveyReviewer from './SurveyResult';
import SurveySelect from './SurveySelect';


const SurveyHome: React.FC = () => {
    const operationType = useAppSelector(s => s.navigation.operationType);
    // const operationData = useAppSelector(s => s.navigation.operationData);

    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
        case OperationType.Idle:
            return <SurveySelect />;
        case OperationType.Administering: // This will be shown when the survey is being administered
            return <SurveyAdminister/>;
        case OperationType.Editing:
        case OperationType.Creating:
            return <SurveyCreator />;
        case OperationType.Reviewing:
            return <SurveyReviewer />;
        case OperationType.Responding:
            return <ResponseView />;
        default:
            return (
                <div className='optionPage'> Not actually sure how you got here... </div>
            );
        }
    };

    return (<div id="surveyHome">{getSectionFromOType(operationType)}</div>);
};

export default SurveyHome;
