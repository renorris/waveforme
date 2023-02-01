// Waveforme store.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Redux store for waveforme

import { configureStore } from '@reduxjs/toolkit';

import designerSlice from './components/designerSlice';
import uploaderSlice from './components/uploaderSlice';
import waveformSlice from './components/waveformSlice';

const store = configureStore({
    reducer: {
        designer: designerSlice,
        uploader: uploaderSlice,
        waveform: waveformSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;