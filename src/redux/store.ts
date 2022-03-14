import { configureStore } from '@reduxjs/toolkit';

import data from './dataSlice.ts';
import navigation from './navigationSlice';
import example from './sampleSlice';


export const store = configureStore({
    // We now add all of our state "slices" into a single reducer element
    reducer: {
        /** DO NOT USE...this is just an example if you wish to create another one */
        example,
        /** The slice of the state that deals with navigating to parts of the application */
        navigation,
        /** The slice of the state that deals with cloud data, such as the list of surveys */
        data,
    }
})

/** This is the root state (a redux thing) of the application. Get values using `useAppSelector` and change using `useAppDispatch` from hooks.ts */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch