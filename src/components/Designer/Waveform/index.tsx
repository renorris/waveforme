// Waveforme Waveform index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { RegionParams, RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { WaveSurferParams } from 'wavesurfer.js/types/params';

interface WaveformOptions {
    playing: boolean,
    heightMultiplier: number,
    barGap: number,
    barWidth: number,
    barHeight: number,
    normalize: boolean,
}

interface WaveformCallbacks {
    audioProcessWavesurferCallback: (position: number) => void,
    finishWavesurferCallback: () => void,
    seekWavesurferCallback: (progress: number) => void,
}

function Waveform(props: WaveformOptions & WaveformCallbacks &
{
    position: React.MutableRefObject<number>,
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    regions?: RegionParams[],
    playEnd?: React.MutableRefObject<number>,
}
) {

    const wavesurfer = useRef<WaveSurfer | null>(null);
    const waveformContainer1 = useRef<HTMLDivElement>(null);
    const waveformContainer2 = useRef<HTMLDivElement>(null);
    const containerOneSelected = useRef<boolean>(true);
    const waveformParentContainer = useRef<HTMLDivElement>(null);

    // Helper function to generate params based off of waveformOptions and default values
    const paramMaker = (waveformContainer: HTMLDivElement) => ({
        barHeight: props.barHeight,
        barWidth: props.barWidth,
        barGap: props.barGap,
        normalize: props.normalize,
        cursorWidth: 0,
        container: waveformContainer,
        backend: 'WebAudio',
        audioContext: props.audioContext,
        closeAudioContext: false,
        removeMediaElementOnDestroy: false,
        responsive: false,
        hideScrollbar: true,
        progressColor: '#0D5BFF',
        waveColor: '#000000',
        barMinHeight: 3,
        height: (waveformParentContainer.current?.offsetWidth as number * props.heightMultiplier),
    });

    // Waveform renderer
    useEffect(() => {

        // Async render function to be called later
        const render = async () => {
            console.log('Rendering waveform');
            console.log(props);

            // Async load wavesurfer
            const WaveSurfer = (await import('wavesurfer.js')).default;

            // Get selected container (the container not currently being used that we can render into)
            let selectedContainer;
            console.log(`containerOneSelected = ${containerOneSelected.current!}`);
            if (containerOneSelected.current!) {
                console.log(`Selected container 1`);
                selectedContainer = waveformContainer1;
            }
            else {
                console.log(`Selected container 2`);
                selectedContainer = waveformContainer2;
            }

            console.log(`Selected container: ${selectedContainer.current!.id}`);

            // Set selected container display to 'none' and clear innerHTML so it doesn't flicker
            selectedContainer.current!.innerHTML = '';
            selectedContainer.current!.style.display = 'none';

            // New wavesurfer inside selected container
            const newWavesurfer = WaveSurfer.create(paramMaker(selectedContainer.current!) as WaveSurferParams);

            // Load the audio buffer
            newWavesurfer.loadDecodedBuffer(props.audioBuffer!);

            // Swap selected container
            if (containerOneSelected.current!) {
                waveformContainer2.current!.innerHTML = '';
                waveformContainer2.current!.style.display = 'none';
            }
            else {
                waveformContainer1.current!.innerHTML = '';
                waveformContainer1.current!.style.display = 'none';
            }

            selectedContainer.current!.style.display = 'block';

            // Draw the buffer on our newly visible container so the waveform renders
            newWavesurfer.drawBuffer();

            // Destroy old wavesurfer & event callbacks
            if (wavesurfer.current) {
                wavesurfer.current!.unAll();
                wavesurfer.current!.destroy();
            }

            // Add regions if regions were passed in props
            if (props.regions !== undefined && props.regions.length > 0) {

                console.log('Building regions');

                const RegionsPlugin = (await import('wavesurfer.js/src/plugin/regions')).default;

                const regionsPluginParams: RegionsPluginParams = {
                    dragSelection: false,
                    snapToGridInterval: undefined,
                    snapToGridOffset: undefined,
                    edgeScrollWidth: undefined,
                }

                newWavesurfer.addPlugin(RegionsPlugin.create(regionsPluginParams));

                props.regions.forEach(params => {
                    newWavesurfer.addRegion(params);
                });
            }

            // Set cursor position
            newWavesurfer.seekTo((1 / newWavesurfer.getDuration()) * props.position.current);

            // Play the waveform if props deem so
            if (props.playing) newWavesurfer.play();

            // Set the play end if passed in props
            if (props.playEnd?.current !== undefined) {
                newWavesurfer.setPlayEnd(props.playEnd!.current);
                newWavesurfer.on('pause', handleFinish);
            }

            // Swap selected container
            console.log(`Current selection before swapping = ${containerOneSelected.current}`);
            containerOneSelected.current! = !containerOneSelected.current!;
            console.log(`Current selection after swapping = ${containerOneSelected.current}`);

            // Assign event handlers
            newWavesurfer.on('audioprocess', handleAudioProcess);
            newWavesurfer.on('finish', handleFinish);
            newWavesurfer.on('seek', handleSeek);

            // Set wavesurfer state to newWavesurfer
            wavesurfer.current = newWavesurfer;
        }

        // Call async render
        render();

    });

    // Event handlers
    const handleAudioProcess = () => {
        props.audioProcessWavesurferCallback(wavesurfer.current!.getCurrentTime());
    }
    const handleFinish = () => {
        props.finishWavesurferCallback();
    }
    const handleSeek = () => {
        props.seekWavesurferCallback(wavesurfer.current!.getCurrentTime());
    }

    // Clean up effect
    useEffect(() => {
        return () => {
            if (wavesurfer.current) {
                wavesurfer.current!.destroy();
            }
        }
    });

    return (
        <>
            <Container fluid className='d-flex justify-content-start align-items-center mb-1'>
                <h6 className='fw-light fst-italic m-0 p-0'>Waveforme Preview</h6>
            </Container>
            <div
                ref={waveformParentContainer}
                style={{ width: '100%' }}
            >
                <div
                    id='waveform-1'
                    ref={waveformContainer1}
                />
                <div
                    id='waveform-2'
                    ref={waveformContainer2}
                />
            </div>
        </>
    )
}

export { WaveformOptions, WaveformCallbacks };
export default Waveform;