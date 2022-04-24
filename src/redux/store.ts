import { Action, configureStore } from '@reduxjs/toolkit';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';

import data from './dataSlice.ts';
import navigation from './navigationSlice';


const config = {
    // navigation dispatches will not be triggered in other tabs
    predicate: (action: Action<string>) => !action.type.startsWith('navigation')
};
const syncMiddleware = [createStateSyncMiddleware(config)];

export const store = configureStore({
    // We now add all of our state "slices" into a single reducer element
    reducer: {
        /** The slice of the state that deals with navigating to parts of the application */
        navigation,
        /** The slice of the state that deals with cloud data, such as the list of surveys */
        data
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(syncMiddleware)
});

initMessageListener(store);

/** This is the root state (a redux thing) of the application. Get values using `useAppSelector` and change using `useAppDispatch` from hooks.ts */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
