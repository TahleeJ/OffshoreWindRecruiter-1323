import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

// Define a type for the slice state
interface exampleState {
    exampleValue: number;
}

// Define the initial state using that type
const initialState = { exampleValue: 0 } as exampleState;

/**THIS SHOULD NOT BE USED FOR ANYTHING...ITS JUST AN EXAMPLE TO SHOW HOW TO MAKE A SLICE OF STATE  @deprecated*/
const counterSlice = createSlice({
    name: 'example',
    initialState,
    reducers: {
        increment(state) {
            state.exampleValue++;
        },
        decrement(state) {
            state.exampleValue--;
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        incrementByAmount(state, action: PayloadAction<number>) {
            state.exampleValue += action.payload
        }
    }
})


// Other code such as selectors can use the imported `RootState` type. This line is not needed, but can make it easier to import stuff quickly
export const selectCount = (state: RootState) => state.example.exampleValue;

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer