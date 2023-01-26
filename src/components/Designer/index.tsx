// Waveforme Designer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';
import { RegionParams } from 'wavesurfer.js/src/plugin/regions';

import Waveform, { WaveformOptions, WaveformCallbacks, WaveformInteractionCallbacks } from './Waveform';
import AudioUploader, { AudioUploaderCallbacks } from './AudioUploader';
import WaveformControls, { WaveformControlsCallbacks } from './WaveformControls';
import Trimmer, { TrimmerCallbacks } from './Trimmer';
import TrimmerControls, { TrimmerControlsCallbacks } from './TrimmerControls';
import { Clamp } from './util';


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

            console.log('Running audioReadyCallback');
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

    // Primary wavesurfer callbacks
    const waveformCallbacks: WaveformCallbacks = {
        audioProcessWavesurferCallback: (position) => {
            waveformPosition.current = position;
        },
        finishWavesurferCallback: () => {
            waveformPosition.current = 0;
            setSeek(0);
            setWaveformOptions(prev => ({ ...prev, playing: false }));
        },
        pauseWavesurferCallback: (position) => {
            console.log('wavesurfer pause fired');

            // Only pause state if position is at trimmer end
            console.log(`position = ${position}, trimmerPlayEnd = ${trimmerPlayEnd.current}`);

            if (trimmerPlayEnd.current && Math.abs(position - trimmerPlayEnd.current) <= 0.01) {
                setWaveformOptions(prev => ({ ...prev, playing: false }));
            }
        },
        seekWavesurferCallback: (position) => {
            waveformPosition.current = position;
        },
    }

    // Primary waveform control callbacks
    const waveformControlsCallbacks: WaveformControlsCallbacks = {
        playButtonClickCallback: () => {
            setWaveformOptions(prev => ({ ...prev, playing: !prev.playing }));
        },
        normalizeButtonClickCallback: () => {
            setWaveformOptions(prev => ({ ...prev, normalize: !prev.normalize }));
        },
        barHeightRangeChangeCallback: (value) => {
            setWaveformOptions(prev => ({ ...prev, barHeight: value }));
        },
        barWidthRangeChangeCallback: (value) => {
            setWaveformOptions(prev => ({ ...prev, barWidth: value }));
        },
        barGapRangeChangeCallback: (value) => {
            setWaveformOptions(prev => ({ ...prev, barGap: value }));
        },
        trimCallback: () => {
            setWaveformOptions(prev => ({ ...prev, playing: false }));
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
        NORMAL WAVEFORM PREVIEW INTERACTION CALLBACKS
    */

    const [seek, setSeek] = useState<number>(0);

    const normalWaveformInteractionCallbacks: WaveformInteractionCallbacks = {
        onDrag: (position) => {
            console.log('Normal waveform onDrag');
            setSeek(position);
        },
        onDragFinish: (position) => {
            console.log('Normal waveform onDragFinish');
            setSeek(position);
        },
    }



    /*
        TRIMMER
    */

    const [isTrimmerEnabled, setIsTrimmerEnabled] = useState<boolean>(false);
    const [trimmerRegions, setTrimmerRegions] = useState<RegionParams[]>();
    const [shouldTrim, setShouldTrim] = useState<boolean>(false);
    const trimmerBeginSec = useRef<number>(0);
    const trimmerEndSec = useRef<number>(0);
    const trimmerPlayEnd = useRef<number>();

    // Primary trimmer callbacks
    const trimmerCallbacks: TrimmerCallbacks = {
        trimCompleteCallback: async (audioBuffer) => {
            console.log('Running trimCompleteCallback');
            
            setAudioBuffer(audioBuffer);

            // Ensure some waveform options are cleaned up
            waveformPosition.current = 0;
            setSeek(0);
            setWaveformOptions(prev => ({ ...prev, playing: false }))

            // Done trimming so set shouldTrim back to false
            setShouldTrim(false);

            // Update UI state
            setIsTrimmerEnabled(false);
            setShouldDisplayWaveform(true);
        },
    }

    // Trimmer region generator helper
    const generateTrimmerRegion = (start: number, end: number): RegionParams => {
        return {
            start: start,
            end: end,
            loop: false,
            drag: false,
            resize: false,
            color: '#30C5FF80',
            preventContextMenu: true,
            showTooltip: false,
        }
    }

    // Trimmer configurator
    useEffect(() => {
        if (!isTrimmerEnabled) {
            console.log('Cleaning up trimmer regions');
            setTrimmerRegions([]);

            setSeek(0);
            waveformPosition.current = 0;
            setWaveformOptions(prev => ({ ...prev, playing: false }));

            return;
        };

        console.log('Setting up trimmer regions');

        trimmerBeginSec.current = audioBuffer!.duration * 0.3;
        trimmerEndSec.current = audioBuffer!.duration * 0.7;

        const trimmerRegion = generateTrimmerRegion(audioBuffer!.duration * 0.3, audioBuffer!.duration * 0.7);

        console.log(`Setting trimmerRegions to ${JSON.stringify(trimmerRegion)}`);
        setTrimmerRegions([trimmerRegion]);

    }, [isTrimmerEnabled]);



    /*
        TRIMMER WAVEFORM INTERACTION CALLBACKS
    */

    const trimmerWaveformInteractionCallbacks: WaveformInteractionCallbacks = {
        onDrag: (position) => {
            console.log('Trimmer waveform onDrag. Mutating trimmer regions...');

            const newRegion = generateTrimmerRegion(trimmerBeginSec.current, trimmerEndSec.current);
            const positionSec = position * audioBuffer!.duration;
            const isStartCloser = (Math.abs(trimmerBeginSec.current - positionSec) < Math.abs(trimmerEndSec.current - positionSec));

            if (isStartCloser) {
                newRegion.start = positionSec;
            }
            else {
                newRegion.end = positionSec;
            }

            trimmerBeginSec.current = newRegion.start!;
            trimmerEndSec.current = newRegion.end!;

            trimmerPlayEnd.current = undefined;
            setWaveformOptions(prev => ({ ...prev, playing: false }));

            setTrimmerRegions([newRegion]);
        },
        
        onDragFinish: (position) => {
            console.log('Trimmer waveform onDragFinish');
            const positionSec = position * audioBuffer!.duration;
            const isStartCloser = (Math.abs(trimmerBeginSec.current - positionSec) < Math.abs(trimmerEndSec.current - positionSec));

            const previewPlaybackDuration = 1.5;

            if (isStartCloser) {
                setSeek(position);
                trimmerBeginSec.current = position * audioBuffer!.duration;
                (trimmerEndSec.current - positionSec) > previewPlaybackDuration ? 
                    trimmerPlayEnd.current = (positionSec + 1.5) : 
                    trimmerPlayEnd.current = trimmerEndSec.current;
            }
            else {
                trimmerPlayEnd.current = positionSec;
                if ((positionSec - trimmerBeginSec.current) > 1.5) {
                    const pos = Clamp(((positionSec - 1.5) / audioBuffer!.duration), 0, 1);
                    setSeek(pos);
                    waveformPosition.current = pos * audioBuffer!.duration;
                }
                else {
                    const pos = Clamp(trimmerBeginSec.current / audioBuffer!.duration, 0, 1);
                    setSeek(pos);
                    waveformPosition.current = pos * audioBuffer!.duration;
                }
            }

            setWaveformOptions(prev => ({ ...prev, playing: true }));
        },
    }



    /*
        TRIMMER CONTROLS
    */

    const trimmerControlsCallbacks: TrimmerControlsCallbacks = {
        trimButtonCallback: () => {
            setShouldTrim(true);
        },
        playButtonCallback: () => {
            if (waveformOptions.playing) {
                setWaveformOptions(prev => ({ ...prev, playing: false }));
                trimmerPlayEnd.current = trimmerEndSec.current;
                const pos = Clamp(trimmerBeginSec.current / audioBuffer!.duration, 0, 1);
                setSeek(pos);
                waveformPosition.current = pos * audioBuffer!.duration;
            }
            else {
                const pos = Clamp(trimmerBeginSec.current / audioBuffer!.duration, 0, 1);
                setSeek(pos);
                waveformPosition.current = pos * audioBuffer!.duration;
                trimmerPlayEnd.current = trimmerEndSec.current;
                setWaveformOptions(prev => ({ ...prev, playing: true }));
            }
        },
        backButtonCallback: () => {
            setIsTrimmerEnabled(false);
            setShouldDisplayWaveform(true);
        }
    }



    /*
        DEV
    */

    useEffect(() => {
        //setShouldDisplayWaveform(true);
        //setIsTrimmerEnabled(true);
    }, []);

    return (
        <Container
            className='d-flex flex-column justify-content-center align-items-center mt-2'
            style={{ maxWidth: '640px' }}
        >
            {!shouldDisplayWaveform && !isTrimmerEnabled &&
                <AudioUploader {...audioUploaderCallbacks} />
            }
            {shouldDisplayWaveform &&
                <>
                    <Waveform
                        {...waveformOptions}
                        {...waveformCallbacks}
                        {...normalWaveformInteractionCallbacks}
                        seek={seek}
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
            {isTrimmerEnabled &&
                <>
                    <Trimmer
                        {...trimmerCallbacks}
                        beginSec={trimmerBeginSec}
                        endSec={trimmerEndSec}
                        shouldTrim={shouldTrim}
                        duration={audioBuffer!.duration}
                        audioContext={audioContext!}
                        audioBuffer={audioBuffer!}
                    />
                    <Waveform
                        {...waveformOptions}
                        {...waveformCallbacks}
                        {...trimmerWaveformInteractionCallbacks}
                        position={waveformPosition}
                        seek={seek}
                        audioBuffer={audioBuffer!}
                        audioContext={audioContext!}
                        regions={trimmerRegions}
                        playEnd={trimmerPlayEnd}
                    />
                    <TrimmerControls
                        {...trimmerControlsCallbacks}
                        waveformOptions={waveformOptions}
                    />
                </>
            }
        </Container>
    );
}

export default Designer;