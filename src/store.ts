// Waveforme store.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Redux store for waveforme

import { configureStore } from '@reduxjs/toolkit';

import designerSlice from './components/designerSlice';
import uploaderSlice from './components/uploaderSlice';
import waveformSlice from './components/waveformSlice';
import authSlice from './components/authSlice';

const store = configureStore({
    reducer: {
        designer: designerSlice,
        uploader: uploaderSlice,
        waveform: waveformSlice,
        auth: authSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;