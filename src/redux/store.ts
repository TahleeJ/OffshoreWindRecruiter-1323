import { configureStore } from '@reduxjs/toolkit'
//we can add all of our frontend state "slices" as imports here:
import example from './sampleSlice';


export const store = configureStore({
    //we now add all of our state "slices" into a single reducer element
    reducer: {
        example
    }
})

/** This is the root state (a redux thing) of the application. Get values using `useAppSelector` and change using `useAppDispatch` from hooks.ts -sean */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch