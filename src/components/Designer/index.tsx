// Waveforme Designer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';
import { RegionParams } from 'wavesurfer.js/src/plugin/regions';

import Waveform, { WaveformOptions, WaveformCallbacks } from './Waveform';
import AudioUploader, { AudioUploaderCallbacks } from './AudioUploader';
import WaveformControls, { WaveformControlsCallbacks } from './WaveformControls';
import Trimmer, { TrimmerCallbacks } from './Trimmer';


function Designer() {

    /*
        AUDIO INITIALIZATION
    */

    // Hold audio context and buffer
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    // Set initial values in browser
    useEffect(() => {
        setAudioContext(new AudioContext({ sampleRate: 44100 }));
        setAudioBuffer(new AudioBuffer({ length: 1, sampleRate: 44100 }));
    }, []);



    /*
        AUDIO UPLOADER
    */

    // Original audio file (for an optional revert)
    const origAudioFile = useRef<File | null>(null);

    // Audio uploader callbacks
    const audioUploaderCallbacks: AudioUploaderCallbacks = {

        // Fired on audio upload & FFmpeg decoding completion
        audioReadyCallback: async (file) => {

            // Decode mp3 into AudioBuffer
            const arrayBuffer = await file.arrayBuffer();
            setAudioBuffer(await audioContext!.decodeAudioData(arrayBuffer));

            // Store original mp3 blob for an revert feature
            origAudioFile.current = file;

            setShouldDisplayWaveform(true);
        },
    };



    /*
        WAVEFORM
    */

    const waveformPosition = useRef<number>(0);
    const [shouldDisplayWaveform, setShouldDisplayWaveform] = useState<boolean>(false);

    // Primary waveform options
    const [waveformOptions, setWaveformOptions] = useState<WaveformOptions>({
        playing: false,
        heightMultiplier: 0.5,
        barGap: 1,
        barWidth: 1,
        barHeight: 1,
        normalize: false,
    });

    // Primary waveform callbacks
    const waveformCallbacks: WaveformCallbacks = {
        audioProcessWavesurferCallback: (position) => {
            waveformPosition.current = position;
        },
        finishWavesurferCallback: () => {
            waveformPosition.current = 0;
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));
        },
        seekWavesurferCallback: (position) => {
            waveformPosition.current = position;
        },
    }

    // Primary waveform control callbacks
    const waveformControlsCallbacks: WaveformControlsCallbacks = {
        playButtonClickCallback: () => {
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: !waveformOptions.playing }));
        },
        normalizeButtonClickCallback: () => {
            setWaveformOptions(Object.assign({}, waveformOptions, { normalize: !waveformOptions.normalize }));
        },
        barHeightRangeChangeCallback: (value) => {
            setWaveformOptions(Object.assign({}, waveformOptions, { barHeight: value }));
        },
        barWidthRangeChangeCallback: (value) => {
            setWaveformOptions(Object.assign({}, waveformOptions, { barWidth: value }));
        },
        barGapRangeChangeCallback: (value) => {
            setWaveformOptions(Object.assign({}, waveformOptions, { barGap: value }));
        },
        trimCallback: () => {
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));
            waveformPosition.current = 0;
            setIsTrimmerEnabled(true);
            setShouldDisplayWaveform(false);
        },
        revertButtonCallback: async () => {
            // Decode an audio buffer from the origAudioFile then set it
            const arrayBuffer = await origAudioFile.current!.arrayBuffer();
            setAudioBuffer(await audioContext!.decodeAudioData(arrayBuffer));

            // Set position to zero
            waveformPosition.current = 0;
        },
    };



    /*
        TRIMMER
    */

    // Trimmer enabled state
    const [isTrimmerEnabled, setIsTrimmerEnabled] = useState<boolean>(false);
    const [trimmerRegions, setTrimmerRegions] = useState<RegionParams[]>([]);
    const trimmerPlayEndRef = useRef<number>(0);

    // Primary trimmer callbacks
    const trimmerCallbacks: TrimmerCallbacks = {
        trimCompleteCallback: async (audioBuffer) => {
            setAudioBuffer(audioBuffer);

            // Ensure some waveform options are cleaned up
            waveformPosition.current = 0;
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));

            // Update UI state
            setIsTrimmerEnabled(false);
            setShouldDisplayWaveform(true);
        },

        // Primary val: the value the user just modified
        // Comparator val: Value to compare again to ensure that the 2 second
        // snippet value isn't greater than the difference between both values
        trimSelectionChangeCallback(primaryVal, comparatorVal, isStart) {
            // Fired on completed selection change in trimmer. 
            // 1. setPlayEnd to play a short clip of the selected spot for better UX.

            // Only run if isSelecting = true
            //if (!isSelecting.current) {
            //    return;
            //}

            console.log(`Running trimSelectionChangeCallback: primaryVal = ${primaryVal}, isStart = ${isStart}`);

            // -- ENTER -- (((Logic Hell))):

            const bufferSecs = 1.5;
            const primaryValTime = primaryVal * audioBuffer!.duration;
            const comparatorValTime = comparatorVal * audioBuffer!.duration;

            if (isStart) {
                // Set play position right at the starting point if user has modified the start position
                waveformPosition.current = primaryValTime;

                // Set play end to bufferSecs seconds past the starting point ONLY IF
                // the difference is less than bufferSecs seconds.
                if (((comparatorValTime) - (primaryValTime)) > bufferSecs) {
                    trimmerPlayEndRef.current = (primaryValTime) + bufferSecs;
                }
                else {
                    // Else just set it to the comparator value so it stops playing at the 
                    // end of the selection.
                    trimmerPlayEndRef.current = (comparatorValTime);
                }
            }
            else {
                // Else set play position bufferSecs seconds before the end ONLY IF
                // the difference is less than bufferSecs seconds.
                // snippet of where their audio is trimmed at
                if (((primaryValTime) - (comparatorValTime)) > bufferSecs) {
                    waveformPosition.current = (primaryValTime) - bufferSecs;
                }
                else {
                    // Else just set it to the comparator value so it start playing at the 
                    // end of the selection.
                    waveformPosition.current = (comparatorValTime);
                }

                // Set play end to the end selection
                trimmerPlayEndRef.current = primaryValTime;
            }

            // Set isSelecting to false
            //isSelecting.current = false;

            setWaveformOptions(Object.assign({}, waveformOptions, { playing: true }));
        },

        trimSelectingCallback(val1, val2) {
            // Fired continuously as user is selecting a region
            // 1. Update the regions in the rendered waveform to display the selected area.

            console.log(`Running trimSelectingCallback: val1 = ${val1}, val2 = ${val2}`);

            // Testing...
            //trimmerPlayEndRef.current = null;

            let start = 0;
            let end = 1;
            if (val1 >= val2) {
                start = val2;
                end = val1;
            }
            else {
                start = val1;
                end = val2;
            }

            const startTime = start * audioBuffer!.duration;
            const endTime = end * audioBuffer!.duration;

            const regionParams: RegionParams = {
                start: startTime,
                end: endTime,
                loop: false,
                drag: false,
                resize: false,
                color: '#89CFF080',
                preventContextMenu: true,
                showTooltip: false,
            }

            // Set playing to false
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));

            // Set position to 0
            waveformPosition.current = 0;

            // Set playEnd
            trimmerPlayEndRef.current = endTime;

            // Set isSelecting
            //isSelecting.current = true;

            console.log(`Setting trimmerRegions to [regionParams]`);
            setTrimmerRegions([regionParams]);
        }
    }



    /*
        DEV
    */

    useEffect(() => {
        //setShouldDisplayWaveform(true);
    }, []);

    return (
        <Container
            className='d-flex flex-column justify-content-center align-items-center mt-2'
            style={{ maxWidth: '640px' }}
        >
            {!shouldDisplayWaveform && !isTrimmerEnabled &&
                <AudioUploader {...audioUploaderCallbacks} />
            }
            {shouldDisplayWaveform && !isTrimmerEnabled &&
                <>
                    <Waveform
                        {...waveformOptions}
                        {...waveformCallbacks}
                        position={waveformPosition}
                        audioBuffer={audioBuffer!}
                        audioContext={audioContext!}
                    />
                    <WaveformControls
                        {...waveformControlsCallbacks}
                        waveformOptions={waveformOptions}
                    />
                </>
            }
            {!shouldDisplayWaveform && isTrimmerEnabled &&
                <Trimmer
                    {...trimmerCallbacks}
                    duration={audioBuffer!.duration}
                    audioContext={audioContext!}
                    audioBuffer={audioBuffer!}
                >
                    <Waveform
                        {...waveformOptions}
                        {...waveformCallbacks}
                        position={waveformPosition}
                        audioBuffer={audioBuffer!}
                        audioContext={audioContext!}
                        regions={trimmerRegions}
                        playEnd={trimmerPlayEndRef ? trimmerPlayEndRef : undefined}
                    />
                </Trimmer>
            }
        </Container>
    );
}

export default Designer;