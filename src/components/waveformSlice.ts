// Waveforme waveformSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PieceName } from '../jewelry';

export interface WaveformState {
    // Options requiring a wavesurfer "re-render" on change:
    waveformRenderOptions: {
        heightMultiplier: number,
        mode: 'bar' | 'wave',
        barHeight: number,
        barWidth: number,
        barGap: number,
        audioNormalization: boolean,
        shouldCutoff: boolean,
        cutoffIntensity: number,
    }

    playbackDirective: 'play' | 'pause' | 'stop',

    selectedRegion: [number, number],

    activeTrimmedRegion: [number, number],
    activeTrimmedRegionHistory: [number, number][],
    activeTrimmedRegionDuration: number,

    selectedPiece: PieceName | null,
}

const initialState: WaveformState = {
    waveformRenderOptions: {
        heightMultiplier: 0.5,
        mode: 'wave',
        barHeight: 1,
        barWidth: 1,
        barGap: 1,
        audioNormalization: true,
        shouldCutoff: true,
        cutoffIntensity: 2,
    },
    playbackDirective: 'stop',
    selectedRegion: [0.25, 0.75],

    activeTrimmedRegion: [0, 1],
    activeTrimmedRegionHistory: [[0, 1]],
    activeTrimmedRegionDuration: 0,

    selectedPiece: null,
}

export const waveformState = createSlice({
    name: 'waveform',
    initialState,
    reducers: {
        resetState: (state) => {
            state.playbackDirective = 'stop';
            state.selectedRegion = initialState.selectedRegion;
        },

        // Waveform render options
        setHeightMultiplier: (state, action: PayloadAction<number>) => {
            state.waveformRenderOptions.heightMultiplier = action.payload;
        },
        setMode: (state, action: PayloadAction<WaveformState['waveformRenderOptions']['mode']>) => {
            state.waveformRenderOptions.mode = action.payload;
        },
        swapMode: state => {
            state.waveformRenderOptions.mode = state.waveformRenderOptions.mode === 'bar' ? 'wave' : 'bar';
        },
        setBarHeight: (state, action: PayloadAction<number>) => {
            state.waveformRenderOptions.barHeight = action.payload;
            state.waveformRenderOptions.audioNormalization = false;
        },
        incrementBarHeight: (state, action: PayloadAction<number>) => {
            if (action.payload < 0 && state.waveformRenderOptions.barHeight <= 0) return;
            state.waveformRenderOptions.barHeight += action.payload;
            state.waveformRenderOptions.audioNormalization = false;
        },
        setBarWidth: (state, action: PayloadAction<number>) => {
            state.waveformRenderOptions.barWidth = action.payload;
        },
        incrementBarWidth: (state, action: PayloadAction<number>) => {
            if (action.payload < 0 && state.waveformRenderOptions.barWidth <= 1) return;
            state.waveformRenderOptions.barWidth += action.payload;
        },
        setBarGap: (state, action: PayloadAction<number>) => {
            state.waveformRenderOptions.barGap = action.payload;
        },
        incrementBarGap: (state, action: PayloadAction<number>) => {
            if (action.payload < 0 && state.waveformRenderOptions.barGap <= 1) return;
            state.waveformRenderOptions.barGap += action.payload;
        },
        setAudioNormalization: (state, action: PayloadAction<boolean>) => {
            state.waveformRenderOptions.audioNormalization = action.payload;
        },
        toggleAudioNormalization: (state) => {
            state.waveformRenderOptions.audioNormalization = !state.waveformRenderOptions.audioNormalization;
        },
        enableCutoff: state => {
            state.waveformRenderOptions.shouldCutoff = true;
        },
        disableCutoff: state => {
            state.waveformRenderOptions.shouldCutoff = false;
        },
        toggleCutoff: state => {
            state.waveformRenderOptions.shouldCutoff = !state.waveformRenderOptions.shouldCutoff;
        },
        incrementCutoffIntensity: state => {
            if (state.waveformRenderOptions.cutoffIntensity + 0.1 < 0.8) {
                state.waveformRenderOptions.cutoffIntensity += 0.1;
            }
        },
        decrementCutoffIntensity: state => {
            if (state.waveformRenderOptions.cutoffIntensity - 0.1 > 0.1) {
                state.waveformRenderOptions.cutoffIntensity -= 0.1;
            }
        },


        play: state => {
            state.playbackDirective = 'play';
        },
        pause: state => {
            state.playbackDirective = 'pause';
        },
        playPause: state => {
            state.playbackDirective = state.playbackDirective === 'play' ? 'pause' : 'play';
        },
        playStop: state => {
            state.playbackDirective = state.playbackDirective === 'play' ? 'stop' : 'play';
        },
        stop: state => {
            state.playbackDirective = 'stop';
        },

        setSelectedRegionStart: (state, action: PayloadAction<number>) => {
            state.selectedRegion = [action.payload, state.selectedRegion[1]];
        },
        setSelectedRegionEnd: (state, action: PayloadAction<number>) => {
            state.selectedRegion = [state.selectedRegion[0], action.payload];
        },
        setSelectedRegion: (state, action: PayloadAction<WaveformState['selectedRegion']>) => {
            state.selectedRegion = action.payload;
        },

        setActiveTrimmedRegionDuration: (state, action: PayloadAction<number>) => {
            state.activeTrimmedRegionDuration = action.payload;
        },  

        // - Transfers selected region to actively trimmed region.
        // - Compensates for "drift" from previous trims. Uses the existing
        //   actively trimmed region as a "frame" to reference the next
        //   so it's actually trimmed properly, so it's not trimmed in reference to
        //   0 and 1 from the original audio duration.
        transferSelectedRegionToTrimmedRegion: state => {
            const previousRegion: WaveformState['activeTrimmedRegion'] = [...state.activeTrimmedRegion];
            const range = previousRegion[1] - previousRegion[0];
            const newStart = state.selectedRegion[0] * range + previousRegion[0];
            const newEnd = state.selectedRegion[1] * range + previousRegion[0];
            const newRegion: WaveformState['activeTrimmedRegion'] = [newStart, newEnd];
            state.activeTrimmedRegion = [...newRegion];
            state.activeTrimmedRegionHistory.push([...newRegion]);
        },

        revertTrimmedSelectionToOriginal: state => {
            const originalRegion = state.activeTrimmedRegionHistory.at(0)!;
            state.activeTrimmedRegionHistory = [originalRegion];
            state.activeTrimmedRegion = originalRegion;
        },

        undoSingleTrimSelection: state => {
            const history = [...state.activeTrimmedRegionHistory];
            
            // Don't do anything if there's only one element in the list
            if (history.length <= 1) return;

            // Remove the latest trim
            history.pop();

            // Set active to the latest
            state.activeTrimmedRegion = history[history.length - 1];

            // Update history list
            state.activeTrimmedRegionHistory = history;
        },

        setSelectedPiece: (state, action: PayloadAction<WaveformState['selectedPiece'] | null>) => {
            state.selectedPiece = action.payload;
        },
    }
});

export const { 
    resetState, 
    setHeightMultiplier,
    setMode,
    swapMode,
    setBarHeight, 
    incrementBarHeight,
    setBarWidth,
    incrementBarWidth,
    setBarGap, 
    incrementBarGap,
    setAudioNormalization,
    toggleAudioNormalization,
    enableCutoff,
    disableCutoff,
    toggleCutoff,
    incrementCutoffIntensity,
    decrementCutoffIntensity,
    play,
    pause,
    playPause,
    playStop,
    stop,
    setSelectedRegionStart,
    setSelectedRegionEnd,
    setSelectedRegion,
    setActiveTrimmedRegionDuration,
    transferSelectedRegionToTrimmedRegion,
    revertTrimmedSelectionToOriginal,
    undoSingleTrimSelection,
    setSelectedPiece,
} = waveformState.actions;

export default waveformState.reducer;