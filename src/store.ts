// Waveforme store.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Redux store for waveforme

import { configureStore } from '@reduxjs/toolkit';

import designerSlice from './components/designerSlice';
import uploaderSlice from './components/uploaderSlice';
import waveformSlice from './components/waveformSlice';
import authSlice from './components/authSlice';

const isBrowser = typeof window !== 'undefined';

const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
    const result = next(action);
    if (isBrowser) {
        const authState = store.getState().auth;
        localStorage.setItem('authState', JSON.stringify(authState));
    }
    return result;
};

const preloadedState = isBrowser && localStorage.getItem('authState')
    ? { auth: JSON.parse(localStorage.getItem('authState')!) }
    : undefined;

const store = configureStore({
    reducer: {
        designer: designerSlice,
        uploader: uploaderSlice,
        waveform: waveformSlice,
        auth: authSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
});

store.subscribe(() => {
    if (isBrowser) {
        const authState = store.getState().auth;
        localStorage.setItem('authState', JSON.stringify(authState));
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;