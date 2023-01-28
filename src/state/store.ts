// Waveforme store.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Main Redux state for Waveforme app

import { configureStore } from '@reduxjs/toolkit';

import designerSlice from '../components/Designer/designerSlice';

const store = configureStore({
    reducer: {
        designer: designerSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                //ignoredActions: ['your/action/type'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.channelData', 'payload'],
                // Ignore these paths in the state
                ignoredPaths: ['designer.audioBufferChannelData', 'designer.origMp3File'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
