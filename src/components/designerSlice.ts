// Waveforme designerSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DesignerState {
    activePage: 'uploader' | 'main' | 'trimmer',
    localOriginalMP3URL: string | null,
}

const initialState: DesignerState = {
    activePage: 'uploader',
    localOriginalMP3URL: null,
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
        
    }
});

export const {
    switchPage,
    setLocalOriginalMP3URL,
} = designerSlice.actions;

export default designerSlice.reducer;