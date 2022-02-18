import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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

/** The slice of state for navigating to different types of pages in the application. */
interface navigationState {
    currentPage: PageType;
    operationType: OperationType;
    /** This value is null if the operation type doesn't need it. Otherwise contains the necessary information to render the page. */
    operationData: any | null;
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
    }
})




export const { changePage, changeOperation, changeOperationData } = navigationSlice.actions
export default navigationSlice.reducer