// Waveforme Trimmer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';

import TrimmerControls, { TrimmerControlsCallbacks } from '../TrimmerControls';

interface TrimmerOptions {
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    duration: number,

    shouldTrim: boolean,
    beginSec: React.MutableRefObject<number>,
    endSec: React.MutableRefObject<number>,
}

interface TrimmerCallbacks {
    trimCompleteCallback: (audioBuffer: AudioBuffer) => void,
}

function Trimmer(props: TrimmerOptions & TrimmerCallbacks) {

    /*
        AUDIO BUFFER SLICER
    */

    const sliceAudioBuffer = (buffer: AudioBuffer, beginSec: number, endSec: number): AudioBuffer => {
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
            newAudioBuffer = props.audioContext.createBuffer(channels, sampleCount, rate);
            const tempArray = new Float32Array(sampleCount);

            for (let channel = 0; channel < channels; channel++) {
                buffer.copyFromChannel(tempArray, channel, startOffset);
                newAudioBuffer.copyToChannel(tempArray, channel, 0);
            }
        }
        catch (error) {
            throw new Error(error);
        }

        return newAudioBuffer;
    }



    /*
        DETECT A NEED TO TRIM
    */

    useEffect(() => {
        if (props.shouldTrim) props.trimCompleteCallback(sliceAudioBuffer(props.audioBuffer, props.beginSec.current!, props.endSec.current!));
    }, [props.shouldTrim]);

    

    // Return nothing. The trimmer component has no UI. It only performs trim logic based on props.
    return (<></>);
}

export { TrimmerCallbacks };
export default Trimmer;