// Waveforme Designer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Container from 'react-bootstrap/esm/Container';

import Waveform, { WaveformOptions, WaveformCallbacks } from './Waveform';
import AudioUploader, { AudioUploaderCallbacks } from './AudioUploader';
import WaveformControls, { WaveformControlsCallbacks } from './WaveformControls';
import Trimmer, { TrimmerCallbacks } from './Trimmer';

function Designer() {

    // Hold audio context and buffer in a ref because it doesn't work in a state obj
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);

    // Set initial values in browser
    useEffect(() => {
        audioContextRef.current = new AudioContext({ sampleRate: 44100 });
        audioBufferRef.current = new AudioBuffer({ length: 1, sampleRate: 44100 });
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
            audioBufferRef.current = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            audioFile.current = file;
            setShouldDisplayWaveform(true);
        },
    };

    // Audio file refs
    const audioFile = useRef<File | null>(null);

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
            setIsTrimmerEnabled(true);
            setShouldDisplayWaveform(false);
        },
    };

    // Trimmer enabled state
    const [isTrimmerEnabled, setIsTrimmerEnabled] = useState<boolean>(false);

    // Trimmer callbacks
    const trimmerCallbacks: TrimmerCallbacks = {
        trimCompleteCallback: async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            audioBufferRef.current = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            audioFile.current = file;

            waveformPosition.current = 0;
            setWaveformOptions(Object.assign({}, waveformOptions, { playing: false }));
            
            setIsTrimmerEnabled(false);
            setShouldDisplayWaveform(true);
        }
    }

    return (
        <Container
            className='d-flex flex-column justify-content-center align-items-center'
            style={{ maxWidth: '512px' }}
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
                        audioBuffer={audioBufferRef.current!}
                        audioContext={audioContextRef.current!}
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
                    duration={audioBufferRef.current!.duration}
                    file={audioFile.current!}
                >
                    <Waveform
                        {...waveformOptions}
                        {...waveformCallbacks}
                        position={waveformPosition.current!}
                        audioBuffer={audioBufferRef.current!}
                        audioContext={audioContextRef.current!}
                    />
                </Trimmer>
            }
        </Container>
    );
}

export default Designer;