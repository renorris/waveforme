// Waveforme designerSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DesignerState {
    activePage: 'uploader' | 'main' | 'trimmer' | 'exporter',
    localOriginalMP3URL: string | null,
    localWaveformImageURL: string | null,
}

const initialState: DesignerState = {
    activePage: 'uploader',
    localOriginalMP3URL: null,
    localWaveformImageURL: null,
}

export const designerSlice = createSlice({
    name: 'designer',
    initialState,
    reducers: {
        
        switchPage: (state, action: PayloadAction<DesignerState['activePage']>) => {
            state.activePage = action.payload;
        },

        setLocalOriginalMP3URL: (state, action: PayloadAction<string>) => {
            // Clean up existing URL if exists
            if (state.localOriginalMP3URL !== null) {
                try {
                    window.URL.revokeObjectURL(state.localOriginalMP3URL);
                }
                catch (err) {
                    console.error('Error revoking original MP3 URL.');
                    console.error(err);
                }
            }

            // Set new URL
            state.localOriginalMP3URL = action.payload;
        },

        setLocalWaveformImageURL: (state, action: PayloadAction<string>) => {
            // Clean up existing URL if exists
            if (state.localWaveformImageURL !== null) {
                try {
                    window.URL.revokeObjectURL(state.localWaveformImageURL);
                }
                catch (err) {
                    console.error('Error revoking waveform image URL.');
                    console.error(err);
                }
            }

            // Set new URL
            state.localWaveformImageURL = action.payload;
        },
        
    }
});

export const {
    switchPage,
    setLocalOriginalMP3URL,
    setLocalWaveformImageURL,
} = designerSlice.actions;

export default designerSlice.reducer;