// Waveforme uploaderSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UploaderState {
    phase: 'idle' | 'processing' | 'complete' | 'error',
}

const initialState: UploaderState = {
    phase: 'idle',
}

export const uploaderState = createSlice({
    name: 'uploader',
    initialState,
    reducers: {
        resetState: (state) => {
            state = initialState;
        },
        setPhase: (state, action: PayloadAction<UploaderState['phase']>) => {
            state.phase = action.payload;
        },
    }
});

export const { resetState, setPhase } = uploaderState.actions;
export default uploaderState.reducer;