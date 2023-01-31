// Waveforme designerSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../state/store';
import { RegionParams } from 'wavesurfer.js/src/plugin/regions';
import { generateTrimmerRegion } from './util';


enum WaveformStyle {
    BAR,
    ORGANIC,
}

enum DesignerTool {
    UPLOADER,
    MAIN,
    TRIMMER,
}

interface AudioBufferData {
    channelData: Float32Array,
    frameCount: number,
}

interface TrimmerRegionBoundaries {
    start: number,
    end: number,
}

interface DesignerState {
    audioBufferChannelData: Float32Array,
    audioBufferFrameCount: number,
    origMp3File: Uint8Array,

    // Waveform customization options
    heightMultiplier: number,
    normalize: boolean,
    style: WaveformStyle,
    barHeight: number,
    barWidth: number,
    barGap: number,

    dragPos: number,
    dragFinishSignal: number,

    playing: boolean,
    activeTool: DesignerTool,
    seek: number,
    playEnd: number | null,
    trimSignal: boolean,

    trimmerRegionBoundaries: TrimmerRegionBoundaries,

    regions: RegionParams[],
}

const initialState: DesignerState = {

    audioBufferChannelData: new Float32Array(),
    audioBufferFrameCount: 0,
    origMp3File: new Uint8Array(),

    heightMultiplier: 0.5,
    normalize: false,
    style: WaveformStyle.BAR,
    barHeight: 1,
    barWidth: 1,
    barGap: 1,

    dragPos: 0,
    dragFinishSignal: 0,

    playing: false,
    activeTool: DesignerTool.UPLOADER,
    seek: 0,
    playEnd: null,
    trimSignal: false,
    trimmerRegionBoundaries: { start: 0.3, end: 0.7 },

    regions: [],
}

export const designerSlice = createSlice({
    name: 'designer',
    initialState,
    reducers: {
        setAudioBufferData: (state, action: PayloadAction<AudioBufferData>) => {
            state.audioBufferChannelData = action.payload.channelData;
            state.audioBufferFrameCount = action.payload.frameCount;
        },
        setOrigMp3File: (state, action: PayloadAction<Uint8Array>) => {
            state.origMp3File = action.payload;
        },
        setHeightMultiplier: (state, action: PayloadAction<number>) => {
            state.heightMultiplier = action.payload;
        },
        setNormalize: (state, action: PayloadAction<boolean>) => {
            state.normalize = action.payload;
        },
        toggleNormalize: (state) => {
            state.normalize = !state.normalize;
        },
        setStyle: (state, action: PayloadAction<WaveformStyle>) => {
            state.style = action.payload;
        },
        setBarHeight: (state, action: PayloadAction<number>) => {
            state.barHeight = action.payload;
        },
        setBarWidth: (state, action: PayloadAction<number>) => {
            state.barWidth = action.payload;
        },
        setBarGap: (state, action: PayloadAction<number>) => {
            state.barGap = action.payload;
        },

        play: (state) => {
            state.playing = false;
        },
        pause: (state) => {
            state.playing = false;
        },
        playPause: (state) => {
            state.playing = !state.playing;
        },

        seekTo: (state, action: PayloadAction<number>) => {
            state.seek = action.payload;
        },
        playUntil: (state, action: PayloadAction<number>) => {
            state.playEnd = action.payload;
        },
        disablePlayEnd: (state) => {
            state.playEnd = null;
        },

        switchActiveTool: (state, action: PayloadAction<DesignerTool>) => {
            state.activeTool = action.payload;
        },

        signalTrimmerStart: (state) => {
            state.trimSignal = true;
        },
        indicateTrimmerComplete: (state) => {
            state.trimSignal = false;
        },
        setTrimmerRegionBoundaries: (state, action: PayloadAction<TrimmerRegionBoundaries>) => {
            state.trimmerRegionBoundaries = action.payload;
        },
        setTrimmerStartPos: (state, action: PayloadAction<number>) => {
            state.trimmerRegionBoundaries = { start: action.payload, end: state.trimmerRegionBoundaries.end };
        },
        setTrimmerEndPos: (state, action: PayloadAction<number>) => {
            state.trimmerRegionBoundaries = { start: state.trimmerRegionBoundaries.end, end: action.payload };
        },

        setDragPos: (state, action: PayloadAction<number>) => {
            state.dragPos = action.payload;
        },
        signalDragFinished: (state) => {
            state.dragFinishSignal = state.dragFinishSignal + 1;
        },

        setRegions: (state, action: PayloadAction<RegionParams[]>) => {
            state.regions = action.payload;
        },
    },
});

export const {
    setAudioBufferData, setOrigMp3File, setRegions,
    setHeightMultiplier, setNormalize, setStyle,
    setBarHeight, setBarWidth, setBarGap,
    play, pause, seekTo, playPause,
    playUntil, disablePlayEnd, toggleNormalize,
    switchActiveTool, signalTrimmerStart, indicateTrimmerComplete,
    setTrimmerRegionBoundaries,
    setTrimmerStartPos, setTrimmerEndPos, setDragPos
} = designerSlice.actions;

export { WaveformStyle, DesignerTool, AudioBufferData };
export default designerSlice.reducer;