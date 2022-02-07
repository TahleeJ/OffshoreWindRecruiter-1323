import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

/** This enum is used to distinguish between different types of pages */
export enum PageType {
    AdminHome,
    Home,
    Survey,
    LabelManage,
    JobManage,
    AdminManage,
    
    DeletePopup
}

export enum OperationType {
    Idle,
    Editing,
    Deleting,
    Creating,
    Administering
}

export interface OperationData {
    /** The Id of the current operation data. Could be a label ID, job opportunity ID, etc. */
    currentItemId: number;
    /** This value can hold anything. Perhaps it will hold the rest of the information of a job opportunity, or maybe a label. */
    otherInformation: any;
}

/** The slice of state for navigating to different types of pages in the application. */
interface navigationState {
    currentPage: PageType;
    operationType: OperationType;
    /** This value is null if the operation type doesn't need it. Otherwise contains the necessary information to render the page. */
    operationData: OperationData | null;
}

const initialState = {
    currentPage: PageType.Home,
    operationData: null
} as navigationState;

/** The slice of the state that deals with navigating to parts of the application*/
const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        /** Change the type of the page and optionally specify the operation and the data of the operation. */
        changePage(state, { payload }: PayloadAction<{ type: PageType, operation?: OperationType, data?: OperationData }>) {
            state.currentPage = payload.type;
            state.operationType = payload.operation ? payload.operation : OperationType.Idle;
            state.operationData = payload.data ? payload.data : null;
        },
        changeOperation(state, { payload }: PayloadAction<{ operation: OperationType, data?: OperationData }>) {
            state.operationType = payload.operation;
            state.operationData = payload.data ? payload.data : null;
        },
        changeOperationData(state, { payload }: PayloadAction<OperationData | null>) {
            state.operationData = payload;
        }
    }
})




export const { changePage, changeOperation, changeOperationData } = navigationSlice.actions
export default navigationSlice.reducer