// Waveforme waveformSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WaveformState {
    // Options requiring a wavesurfer "re-render" on change:
    waveformRenderOptions: {
        heightMultiplier: number,
        barHeight: number,
        barWidth: number,
        barGap: number,
        audioNormalization: boolean,
    }

    playbackDirective: 'play' | 'pause' | 'stop',

    selectedRegion: [number, number],
}

const initialState: WaveformState = {
    waveformRenderOptions: {
        heightMultiplier: 0.5,
        barHeight: 1,
        barWidth: 1,
        barGap: 1,
        audioNormalization: false
    },
    playbackDirective: 'stop',
    selectedRegion: [0.25, 0.75],
}

export const waveformState = createSlice({
    name: 'waveform',
    initialState,
    reducers: {
        resetState: (state) => {
            state = initialState;
        },

        // Waveform render options
        setHeightMultiplier: (state, action: PayloadAction<number>) => {
            let newWaveformRenderOptions = {...state.waveformRenderOptions};
            newWaveformRenderOptions.heightMultiplier = action.payload;
            state.waveformRenderOptions = newWaveformRenderOptions;
        },
        setBarHeight: (state, action: PayloadAction<number>) => {
            let newWaveformRenderOptions = {...state.waveformRenderOptions};
            newWaveformRenderOptions.barHeight = action.payload;
            state.waveformRenderOptions = newWaveformRenderOptions;
        },
        setBarWidth: (state, action: PayloadAction<number>) => {
            let newWaveformRenderOptions = {...state.waveformRenderOptions};
            newWaveformRenderOptions.barWidth = action.payload;
            state.waveformRenderOptions = newWaveformRenderOptions;
        },
        setBarGap: (state, action: PayloadAction<number>) => {
            let newWaveformRenderOptions = {...state.waveformRenderOptions};
            newWaveformRenderOptions.barGap = action.payload;
            state.waveformRenderOptions = newWaveformRenderOptions;
        },
        setAudioNormalization: (state, action: PayloadAction<boolean>) => {
            let newWaveformRenderOptions = {...state.waveformRenderOptions};
            newWaveformRenderOptions.audioNormalization = action.payload;
            state.waveformRenderOptions = newWaveformRenderOptions;
        },

        play: state => {
            state.playbackDirective = 'play';
        },
        pause: state => {
            state.playbackDirective = 'pause';
        },
        stop: state => {
            state.playbackDirective = 'stop';
        },


    }
});

export const { 
    resetState, 
    setHeightMultiplier, 
    setBarHeight, 
    setBarWidth, 
    setBarGap, 
    setAudioNormalization,
    play,
    pause,
    stop,
} = waveformState.actions;
export default waveformState.reducer;