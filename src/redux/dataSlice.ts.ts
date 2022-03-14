import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { hasId, JobOpp, Label, SurveyTemplate, SurveyResponse } from '../firebase/Types';


interface dataState {
    surveys: (SurveyTemplate & hasId)[];
    surveyResponses: (SurveyResponse & hasId)[];
    jobOpps: (JobOpp & hasId)[];
    labels: (Label & hasId)[];
    //add more here when we know what types they are
}

const initialState = {
    surveys: [],
    surveyResponses: [],
    jobOpps: [],
    labels: [],
    //then add the defaults here
} as dataState;

/** The slice of the state that deals with navigating to parts of the application */
const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSurveys(state, { payload }: PayloadAction<(SurveyTemplate & hasId)[]>) {
            state.surveys = payload;
        },
        setLabels(state, { payload }: PayloadAction<(Label & hasId)[]>) {
            state.labels = payload;
        },
        setJobOpps(state, { payload }: PayloadAction<(JobOpp & hasId)[]>) {
            state.jobOpps = payload;
        },
        setSurveyResponses(state, { payload }: PayloadAction<(SurveyResponse & hasId)[]>) {
            state.surveyResponses = payload;
        },
        //add other methods here for when we know the types of jobOpps, etc
    }
})


export const { setSurveys, setLabels, setJobOpps, setSurveyResponses } = dataSlice.actions
export default dataSlice.reducer