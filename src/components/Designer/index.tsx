// Waveforme Designer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';

import Waveform, { WaveformOptions, WaveformCallbacks, WaveformInteractionCallbacks } from './Waveform';
import AudioUploader, { AudioUploaderCallbacks } from './AudioUploader';
import WaveformControls, { WaveformControlsCallbacks } from './WaveformControls';
import Trimmer, { TrimmerCallbacks } from './Trimmer';
import { RegionParams } from 'wavesurfer.js/src/plugin/regions';

function Designer() {

    // Hold audio context and buffer
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    // Set initial values in browser
    useEffect(() => {
        setAudioContext(new AudioContext({ sampleRate: 44100 }));
        setAudioBuffer(new AudioBuffer({ length: 1, sampleRate: 44100 }));
    }, []);

    // Options prop for waveform component
    const [waveformOptions, setWaveformOptions] = useState<WaveformOptions>({
        playing: false,
        heightMultiplier: 0.5,
        barGap: 1,
        barWidth: 1,
        barHeight: 1,
        normalize: false,
    });

    const [waveformUpdateSignal, setWaveformUpdateSignal] = useState<number>(0);

    // Waveform callback prop
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

    // Waveform position ref
    const waveformPosition = useRef<number>(0);

    // Callbacks for audio uploader
    const audioUploaderCallbacks: AudioUploaderCallbacks = {
        audioReadyCallback: async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            setAudioBuffer(await audioContext!.decodeAudioData(arrayBuffer));

            // Set current AND original audio file since this is the first upload
            activeAudioFile.current = file;
            origAudioFile.current = file;

            setShouldDisplayWaveform(true);
        },
    };

    // Audio file refs
    // Active audio file
    const activeAudioFile = useRef<File | null>(null);

    // Original audio file (for an optional revert)
    const origAudioFile = useRef<File | null>(null);

    // Should display waveform state
    const [shouldDisplayWaveform, setShouldDisplayWaveform] = useState<boolean>(false);

    // Callbacks for waveform controls
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

            // Set active audio file to original
            activeAudioFile.current = origAudioFile.current;

            // Set position to zero
            waveformPosition.current = 0;
        },
    };

    // Trimmer enabled state
    const [isTrimmerEnabled, setIsTrimmerEnabled] = useState<boolean>(false);

    // Trimmer callbacks
    const trimmerCallbacks: TrimmerCallbacks = {
        trimCompleteCallback: async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            setAudioBuffer(await audioContext!.decodeAudioData(arrayBuffer));
            activeAudioFile.current = file;

            waveformPosition.current = 0;
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));

            setIsTrimmerEnabled(false);
            setShouldDisplayWaveform(true);
        },

        trimCloseCallback() {
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));
            setIsTrimmerEnabled(false);
            setShouldDisplayWaveform(true);
        },

        trimPlayPauseCallback() {
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: !waveformOptions.playing }));
        },
    }

    // Trimmer waveform callbacks
    const trimmerWaveformInteractionCallbacks: WaveformInteractionCallbacks = {
        onDragWavesurferCallback: (position) => {
            console.log('onDragWavesurferCallback (Trimmer) fired');
            isSelecting.current = true;
            setWaveformUpdateSignal(waveformUpdateSignal + 1);
        },
        onInteractUp: () => {
            console.log('onInteractUp (Trimmer) fired');
            if (isSelecting.current)  {
                isSelecting.current = false;
                setWaveformUpdateSignal(waveformUpdateSignal + 1);
            }
        },
    }

    // Trimmer-specific refs to pass into waveform
    const [trimmerRegions, setTrimmerRegions] = useState<RegionParams[]>([]);
    const trimmerPlayEndRef = useRef<number | null>(null);

    // Fix weird state bug by only allowing selectionChangeCallback to run if selectingCallback ran immediately prior
    const isSelecting = useRef<boolean>(false);

    // Re-render on window resize
    useEffect(() => {
        const handleResize = () => {
            console.log('Window resize fired');
            useForceUpdate();
        }

        console.log('Adding resize event listener');
        window.addEventListener('resize', handleResize);

        return () => {
            console.log('Removing resize event listener');
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Force update helper
    const [arbValue, setArbValue] = useState(0); // integer state
    const useForceUpdate = () => {
        console.log('Forcing update');
        return () => setArbValue(value => value + 1); // update state to force render
    }

    // DEV:
    useEffect(() => {
        //setShouldDisplayWaveform(true);
        setIsTrimmerEnabled(true);
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
                        position={waveformPosition.current!}
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
                    waveformOptions={waveformOptions}
                    duration={audioBuffer!.duration}
                    file={activeAudioFile.current!}
                >
                    <Waveform
                        {...waveformOptions}
                        {...waveformCallbacks}
                        {...trimmerWaveformInteractionCallbacks}
                        position={waveformPosition.current!}
                        audioBuffer={audioBuffer!}
                        audioContext={audioContext!}
                        regions={trimmerRegions}
                        playEnd={trimmerPlayEndRef.current ? trimmerPlayEndRef.current : undefined}
                        updateSignal={waveformUpdateSignal}
                    />
                </Trimmer>
            }
        </Container>
    );
}

export default Designer;