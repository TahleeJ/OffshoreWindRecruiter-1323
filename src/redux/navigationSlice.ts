import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { submitSurvey } from '../firebase/Firebase';
import { AdministeredSurveyResponse } from '../firebase/Types';
import { logJobsMatched } from '../firebase/Analytics/Logging';
import { getSurvey } from '../firebase/Queries/SurveyQueries';

/** This enum is used to distinguish between different types of pages */
export enum PageType {
    AdminHome,
    Home,
    Survey,
    LabelManage,
    JobManage,
    AdminManage,
    Analytics,

    InfoPage,
    DeletePopup
}

export enum OperationType {
    Idle,
    Editing,
    Deleting,
    Creating,
    Administering,
    Reviewing,
    Responding
}

export enum Status {
    idle = "idle",
    pending = "pending",
    fulfilled = 'fulfilled',
    rejected = 'rejected'
}

/** The slice of state for navigating to different types of pages in the application. */
interface navigationState {
    currentPage: PageType;
    operationType: OperationType;
    /** This value is null if the operation type doesn't need it. Otherwise contains the necessary information to render the page. */
    operationData: any | null;

    status: Status;
}

const initialState = {
    currentPage: PageType.Home,
    operationData: null,
    status: Status.idle
} as navigationState;

/** The slice of the state that deals with navigating to parts of the application*/
const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        /** Change the type of the page and optionally specify the operation and the data of the operation. */
        changePage(state, { payload }: PayloadAction<{ type: PageType, operation?: OperationType, data?: any | null }>) {
            state.currentPage = payload.type;
            state.operationType = payload.operation ? payload.operation : OperationType.Idle;
            state.operationData = payload.data ? payload.data : null;
        },
        changeOperation(state, { payload }: PayloadAction<{ operation: OperationType, data?: any | null }>) {
            state.operationType = payload.operation;
            state.operationData = payload.data ? payload.data : null;
        },
        changeOperationData(state, { payload }: PayloadAction<any | null>) {
            state.operationData = payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(submitSurveyResponse.fulfilled, (state, action) => {
            action.payload.data.recommendedJobs.sort((a, b) => b.score - a.score);
            
            state.operationData = action.payload.data;
            state.status = Status.fulfilled;
        });
        builder.addCase(submitSurveyResponse.pending, (state, action) => {
            state.status = Status.pending;
        });
        builder.addCase(submitSurveyResponse.rejected, (state, action) => {
            state.operationData = action.error;
            state.status = Status.rejected;
        });
    },
})

export const submitSurveyResponse = createAsyncThunk('navigation/submitSurveyResponse',
    async (survey: AdministeredSurveyResponse) => {
        const result = await submitSurvey(survey);

        logJobsMatched(survey.surveyId, result.data.recommendedJobs);

        return result;
    }
);

export const { changePage, changeOperation, changeOperationData } = navigationSlice.actions
export default navigationSlice.reducer