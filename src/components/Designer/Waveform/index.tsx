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

// Optional interaction callbacks
interface WaveformInteractionCallbacks {
    // On touchmove and mousedrag on wavesurfer container
    onDragWavesurferCallback?: (position: number) => void,

    // On touchend and mouseup on wavesurfer container
    onInteractUp?: () => void,
}

function Waveform(props: WaveformOptions & WaveformCallbacks & WaveformInteractionCallbacks &
{
    updateSignal?: number,
    position: number,
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    regions?: RegionParams[],
    playEnd?: number,
}
) {

    const wavesurfer = useRef<WaveSurfer | null>(null);
    const waveformContainer1 = useRef<HTMLDivElement>(null);
    const waveformContainer2 = useRef<HTMLDivElement>(null);
    const containerOneSelected = useRef<boolean>(true);
    const waveformParentContainer = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);

    // DOM interaction handlers
    const handleMouseDown = () => {
        console.log('Handling mouse down');
        isDragging.current = true;
    }
    const handleMouseUp = () => {
        console.log('Handling mouse up');
        isDragging.current = false;
        props.onInteractUp!();
    }
    const handleMouseMove = (event: MouseEvent, container: HTMLDivElement) => {
        console.log('Handling mouse move');
        if (isDragging.current!) {
            const position = (event.clientX - container.offsetLeft) / container.clientWidth;
            props.onDragWavesurferCallback!(position);
        }
    }
    const handleTouchUp = () => {
        console.log('Handling touch up');
        props.onInteractUp!();
    }
    const handleTouchMove = (event: TouchEvent, container: HTMLDivElement) => {
        console.log('Handling touch move');
        const position = (event.touches.item(0)!.clientX - container.offsetLeft) / container.clientWidth;
        props.onDragWavesurferCallback!(position);
    }

    // Initialize DOM interaction handlers
    useEffect(() => {
        if (props.onDragWavesurferCallback !== undefined && props.onInteractUp !== undefined) {
            waveformParentContainer.current!.addEventListener('mousedown', handleMouseDown);
            waveformParentContainer.current!.addEventListener('mouseup', handleMouseUp);
            waveformParentContainer.current!.addEventListener('touchend', handleTouchUp);
            waveformParentContainer.current!.addEventListener('mousemove', (event) => handleMouseMove(event, waveformParentContainer.current!));
            waveformParentContainer.current!.addEventListener('touchmove', (event) => handleTouchMove(event, waveformParentContainer.current!));

            return () => {
                waveformParentContainer.current!.removeEventListener('mousedown', handleMouseDown);
                waveformParentContainer.current!.removeEventListener('mouseup', handleMouseUp);
                waveformParentContainer.current!.removeEventListener('touchend', handleTouchUp);
                waveformParentContainer.current!.removeEventListener('mousemove', (event) => handleMouseMove(event, waveformParentContainer.current!));
                waveformParentContainer.current!.removeEventListener('touchmove', (event) => handleTouchMove(event, waveformParentContainer.current!));
            }
        }
    }, []);

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
        interact: false,
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
            const RegionsPlugin = (await import('wavesurfer.js/src/plugin/regions')).default;

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
            newWavesurfer.seekTo((1 / newWavesurfer.getDuration()) * props.position);

            // Play the waveform if props deem so
            if (props.playing) newWavesurfer.play();

            // Set the play end if passed in props
            if (props.playEnd !== undefined) {
                newWavesurfer.setPlayEnd(props.playEnd);
                newWavesurfer.on('pause', handleFinish);
            }

            // Swap selected container
            console.log(`Current selection before swapping = ${containerOneSelected.current}`);
            containerOneSelected.current! = !containerOneSelected.current!;
            console.log(`Current selection after swapping = ${containerOneSelected.current}`);

            // Assign wavesurfer event handlers
            newWavesurfer.on('audioprocess', handleAudioProcess);
            newWavesurfer.on('finish', handleFinish);
            newWavesurfer.on('seek', handleSeek);

            // Set wavesurfer state to newWavesurfer
            wavesurfer.current = newWavesurfer;
        }

        // Call async render
        render();

    }, [
        props.barGap,
        props.barHeight,
        props.barWidth,
        props.normalize,
        props.heightMultiplier,
        props.playing,
        props.audioBuffer,
        props.regions,
    ]);

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

export { WaveformOptions, WaveformCallbacks, WaveformInteractionCallbacks };
export default Waveform;