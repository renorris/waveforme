// Waveforme Trimmer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';

import TrimmerControls, { TrimmerControlsCallbacks } from '../TrimmerControls';

interface TrimmerOptions {
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    duration: number,
}

interface TrimmerCallbacks {
    trimCompleteCallback: (audioBuffer: AudioBuffer) => void,
    trimSelectionChangeCallback: (primaryVal: number, comparatorVal: number, isStart: boolean) => void,
    trimSelectingCallback: (val1: number, val2: number) => void,
}

function Trimmer(props: React.PropsWithChildren & TrimmerOptions & TrimmerCallbacks) {

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
        TRIMMER CONTROLS
    */

    const trimmerControlsCallbacks: TrimmerControlsCallbacks = {
        trimButtonCallback: (val1, val2) => {
            console.log(`val1 = ${val1}`);
            console.log(`val2 = ${val2}`);

            let startPos = 0;
            let endPos = 1;

            if (val1 >= val2) {
                endPos = val1;
                startPos = val2;
            }
            else {
                startPos = val1;
                endPos = val2;
            }

            const startTime = startPos * props.audioBuffer.duration;
            const endTime = endPos * props.audioBuffer.duration;

            console.log(`startTime = ${startTime}`);
            console.log(`endTime = ${endTime}`);

            props.trimCompleteCallback(sliceAudioBuffer(props.audioBuffer, startTime, endTime));
        },

        selectionChangeCallback: (primaryVal, comparatorVal, isStart) => {
            // Forward along to parent component
            props.trimSelectionChangeCallback(primaryVal, comparatorVal, isStart);
        },

        selectingCallback: (val1, val2) => {
            // Forward along to parent component
            props.trimSelectingCallback(val1, val2);
        },
    }

    return (
        <>
            {props.children}
            <TrimmerControls
                {...trimmerControlsCallbacks}
            />
        </>
    )
}

export { TrimmerCallbacks };
export default Trimmer;