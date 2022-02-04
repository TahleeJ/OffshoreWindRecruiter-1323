import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { changeOperation, OperationType } from '../../redux/navigationSlice';
import ListViewer from '../ListViewer';
import SurveyAmdminister from './SurveyAdminister';
import SurverCreator from './SurveyCreator';

/** The props (arguments) to create this element */
interface props {

}


/** The Survey Home to select and administer surveys */
const SurveyHome: React.FC<props> = (props) => {
    const operationType = useAppSelector(s => s.navigation.operationType);
    // const operationData = useAppSelector(s => s.navigation.operationData);
    const dispatch = useAppDispatch();

    const getSectionFromOType = (type: OperationType) => {
        switch (type) {
            case OperationType.Administering:   //This will be shown when the survey is being administered
                return <SurveyAmdminister/>;
            case OperationType.Creating:
                return <SurverCreator />
            default:
                return (
                    <div className='optionPage'>
                        This will eventually be replaced with a survey list. For now, just click the survey list or choose to create a new survey.
                        <br />
                        <ListViewer height='500px' title='Surveys'>
                            <div onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>test survey</div>
                            <div onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>test survey</div>
                            <div onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>test survey</div>
                            <div onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>test survey</div>
                            <div onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>test survey</div>
                            <div onClick={() => dispatch(changeOperation({ operation: OperationType.Administering }))}>test survey</div>
                        </ListViewer>
                    </div>
                );
        }
    }

    return (<div id="surveyHome">{getSectionFromOType(operationType)}</div>)
}

export default SurveyHome;