import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { hasId, JobOpp, Label, SurveyTemplate, AdministeredSurveyResponse } from '../firebase/Types';


interface dataState {
    surveys: (SurveyTemplate & hasId)[];
    surveyResponses: (AdministeredSurveyResponse & hasId)[];
    jobOpps: (JobOpp & hasId)[];
    labels: (Label & hasId)[];
}

const initialState = {
    surveys: [],
    surveyResponses: [],
    jobOpps: [],
    labels: []
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
        setSurveyResponses(state, { payload }: PayloadAction<(AdministeredSurveyResponse & hasId)[]>) {
            state.surveyResponses = payload;
        }
    }
});


export const { setSurveys, setLabels, setJobOpps, setSurveyResponses } = dataSlice.actions;
export default dataSlice.reducer;
