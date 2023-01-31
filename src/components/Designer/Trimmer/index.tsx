// Waveforme Trimmer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';

import TrimmerControls from '../TrimmerControls';
import { useAppSelector, useAppDispatch } from '../../../state/hooks';
import { AudioBufferData, setAudioBufferData, indicateTrimmerComplete, pause, seekTo, setRegions, setTrimmerRegionBoundaries } from '../designerSlice';
import { generateTrimmerRegion } from '../util';

function Trimmer() {

    const dispatch = useAppDispatch();
    const trimSignal = useAppSelector(state => state.designer.trimSignal);
    const trimmerRegionBoundaries = useAppSelector(state => state.designer.trimmerRegionBoundaries);
    const audioBufferFrameCount = useAppSelector(state => state.designer.audioBufferFrameCount);
    const channelData = useAppSelector(state => state.designer.audioBufferChannelData);

    /*
        AUDIO BUFFER SLICER
    */

    const sliceAudioBuffer = () => {
        const audioCtx = new OfflineAudioContext(1, 128, 44100);
        const buffer = audioCtx.createBuffer(1, audioBufferFrameCount, 44100);
        buffer.copyToChannel(channelData, 0);

        const beginSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.start;
        const endSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.end;

        const duration = buffer.duration;
        const channels = buffer.numberOfChannels;
        const rate = buffer.sampleRate;

        if (beginSec < 0) {
            throw new Error('Begin time must be greater than zero!');
        }

        if (endSec > duration) {
            throw new Error(`End time (${endSec} sec) must be less than or equal to buffer duration (${duration} sec)`);
        }

        const startOffset = rate * beginSec;
        const endOffset = rate * endSec;
        const sampleCount = endOffset - startOffset;

        let newAudioBuffer: AudioBuffer;

        try {
            const audioContext = new OfflineAudioContext(1, 128, 44100);
            newAudioBuffer = audioContext.createBuffer(channels, sampleCount, rate);
            const tempArray = new Float32Array(sampleCount);

            for (let channel = 0; channel < channels; channel++) {
                buffer.copyFromChannel(tempArray, channel, startOffset);
                newAudioBuffer.copyToChannel(tempArray, channel, 0);
            }
        }
        catch (error) {
            throw new Error(error);
        }

        const newAudioBufferData: AudioBufferData = {
            channelData: newAudioBuffer.getChannelData(0),
            frameCount: newAudioBuffer.length,
        }
        dispatch(setAudioBufferData(newAudioBufferData));
    }



    /*
        DETECT A NEED TO TRIM
    */

    useEffect(() => {
        if (!trimSignal) {
            return;
        }

        sliceAudioBuffer();
        dispatch(indicateTrimmerComplete());

    }, [trimSignal]);



    // Configurator
    useEffect(() => {
        console.log('Setting up trimmer');
        const duration = audioBufferFrameCount / 44100;
        dispatch(setTrimmerRegionBoundaries({start: 0.3, end: 0.7}));

        return () => {
            console.log('Cleaning up trimmer/regions');
            dispatch(setRegions([]));
            dispatch(seekTo(0));
            dispatch(pause());
        }

    }, [])

    // Update regions on start/end pos changes
    useEffect(() => {
        const duration = audioBufferFrameCount / 44100;
        const startSec = duration * trimmerRegionBoundaries.start;
        const endSec = duration * trimmerRegionBoundaries.end;
        const trimmerRegion = generateTrimmerRegion(startSec, endSec);
        dispatch(setRegions([trimmerRegion]));
    }, [trimmerRegionBoundaries]);


    // Return nothing. The trimmer component has no UI. It only performs trim logic based on props.
    return (<></>);
}

export default Trimmer;