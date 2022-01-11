import { configureStore } from '@reduxjs/toolkit'
//we can add all of our frontend state "slices" as imports here:
import example from './sampleSlice';
import navigation from './navigationSlice';


export const store = configureStore({
    //we now add all of our state "slices" into a single reducer element
    reducer: {
        /** DO NOT USE...this is just an example if you wish to create another one */
        example,
        /** The slice of the state that deals with navigating to parts of the application*/
        navigation,
    }
})

/** This is the root state (a redux thing) of the application. Get values using `useAppSelector` and change using `useAppDispatch` from hooks.ts -sean */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch