import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Survey } from '../firebase/Types';


interface dataState {
    surveys: (Survey & { id: string })[];
    surveyResponses: any[];
    jobOpps: any[];
    labels: any[];
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
        setSurveys(state, { payload }: PayloadAction<(Survey & { id: string })[]>) {
            state.surveys = payload;
        },
        //add other methods here for when we know the types of labels, jobOpps, etc
    }
})




export const { setSurveys: updateSurveyList } = dataSlice.actions
export default dataSlice.reducer