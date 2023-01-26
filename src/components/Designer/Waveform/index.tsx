// Waveforme Waveform index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { RegionParams, RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { WaveSurferParams } from 'wavesurfer.js/types/params';

import { Clamp } from '../util';

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
    pauseWavesurferCallback: (progress: number) => void,
    seekWavesurferCallback: (progress: number) => void,
}

interface WaveformInteractionCallbacks {
    onDrag: (position: number) => void,
    onDragFinish: (position: number) => void,
}

function Waveform(props: WaveformOptions & WaveformCallbacks & WaveformInteractionCallbacks &
{
    position: React.MutableRefObject<number>,
    seek?: number,
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    regions?: RegionParams[],
    playEnd?: React.MutableRefObject<number | undefined>,
}
) {

    const wavesurfer = useRef<WaveSurfer>();
    const waveformContainer = useRef<HTMLDivElement>(null);
    const waveformParentContainer = useRef<HTMLDivElement>(null);



    /*
        DOM INTERACTION
    */

    const isDragging = useRef<boolean>(false);

    const onMouseMove = (event: MouseEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onMouseMove');
        if (!isDragging.current) return;
        const position = (event.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        console.log(`Mouse dragged at x position ${position}`);
        props.onDrag(Clamp(position, 0, 1));
    }
    const onMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onMouseDown');
        isDragging.current = true;
        const position = (event.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        console.log('Mouse is now dragging!')
        props.onDrag(Clamp(position, 0, 1));
    }
    const onMouseUp = (event: MouseEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onMouseUp');
        isDragging.current = false;
        const position = (event.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        console.log('Mouse is no longer dragging.');
        props.onDragFinish(Clamp(position, 0, 1));
    }

    const onTouchStart = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.target!.addEventListener('touchmove', event => onTouchMove(event as TouchEvent));
        event.target!.addEventListener('touchend', event => onTouchEnd(event as TouchEvent));
        console.log('Running onTouchStart');
        const position = (event.changedTouches.item(0)!.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        props.onDrag(Clamp(position, 0, 1));
    }
    const onTouchMove = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onTouchMove');
        console.log(`bubbles = ${event.bubbles}`);
        const position = (event.changedTouches.item(0)!.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        props.onDrag(Clamp(position, 0, 1));
    }
    const onTouchEnd = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.target!.removeEventListener('touchmove', event => onTouchMove(event as TouchEvent));
        event.target!.removeEventListener('touchend', event => onTouchEnd(event as TouchEvent));
        console.log('Running onTouchEnd');
        const position = (event.changedTouches.item(0)!.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        props.onDragFinish(Clamp(position, 0, 1));
    }

    // Register helpers
    let parentContainerHolder: HTMLDivElement;
    useEffect(() => {
        console.log('Registering DOM interaction handlers');
        parentContainerHolder = waveformParentContainer.current!;
        parentContainerHolder.addEventListener('mousedown', event => onMouseDown(event));
        parentContainerHolder.addEventListener('mousemove', event => onMouseMove(event));
        parentContainerHolder.addEventListener('mouseup', event => onMouseUp(event));
        parentContainerHolder.addEventListener('touchstart', event => onTouchStart(event));

        return () => {
            console.log('Cleaning up DOM interaction handlers');
            parentContainerHolder.removeEventListener('mousedown', event => onMouseDown(event));
            parentContainerHolder.removeEventListener('mousemove', event => onMouseMove(event));
            parentContainerHolder.removeEventListener('mouseup', event => onMouseUp(event));
            parentContainerHolder.removeEventListener('touchstart', event => onTouchStart(event));
        }
    }, []);



    /*
        WAVESURFER PARAMETERS
    */

    // Helper function to generate params based off of waveformOptions and default values
    const paramMaker = () => ({
        barHeight: props.barHeight,
        barWidth: props.barWidth,
        barGap: props.barGap,
        normalize: props.normalize,
        cursorWidth: props.playing ? 1 : 0,
        container: waveformContainer.current!,
        removeMediaElementOnDestroy: false,
        backend: 'WebAudio',
        audioContext: props.audioContext,
        responsive: false,
        interact: false,
        hideScrollbar: true,
        progressColor: '#0D5BFF',
        waveColor: '#000000',
        barMinHeight: 3,
        height: (waveformParentContainer.current?.offsetWidth as number * props.heightMultiplier),
    });



    /*
        WAVESURFER RENDERER
        Only do a full render on the following changes
        (Other changes can be made to an existing waveform - see OTHER WAVESURFER UPDATER EFFECTS):
        playing
        heightMultiplier
        barGap
        barWidth
        barHeight
        normalize
        audioBuffer
        audioContext
    */

    useEffect(() => {

        // Async render function to be called later
        const render = async () => {
            console.log('Rendering waveform');
            console.log(props);

            // Async load wavesurfer
            const WaveSurfer = (await import('wavesurfer.js')).default;
            const RegionsPlugin = (await import('wavesurfer.js/src/plugin/regions')).default;

            // Initialize wavesurfer if it's undefined
            if (wavesurfer.current === undefined) {
                const params = paramMaker();
                wavesurfer.current! = WaveSurfer.create(params as WaveSurferParams);

                const regionsPluginParams: RegionsPluginParams = {
                    dragSelection: false,
                    snapToGridInterval: undefined,
                    snapToGridOffset: undefined,
                    edgeScrollWidth: undefined,
                }
                wavesurfer.current!.addPlugin(RegionsPlugin.create(regionsPluginParams));

                // Assign event handlers
                wavesurfer.current!.on('audioprocess', handleAudioProcess);
                wavesurfer.current!.on('finish', handleFinish);
                wavesurfer.current!.on('pause', handlePause);
                wavesurfer.current!.on('seek', handleSeek);
            }

            // Set params for this render
            const params = paramMaker();
            wavesurfer.current!.params = Object.assign({}, wavesurfer.current!.defaultParams, params);

            // Re-create drawer
            wavesurfer.current!.drawer.destroy();
            wavesurfer.current!.createDrawer();

            // Load audio
            wavesurfer.current.loadDecodedBuffer(props.audioBuffer);

            // Add regions if regions were passed in props
            if (props.regions !== undefined && props.regions!.length > 0) {

                console.log('Removing old regions');
                wavesurfer.current!.regions.clear();

                console.log('Building regions');

                props.regions.forEach(region => {
                    // Copy the object just in case
                    wavesurfer.current!.addRegion({...region});
                });
            }

            // Set cursor position
            wavesurfer.current!.seekTo((1 / wavesurfer.current!.getDuration()) * props.position.current);

            // Play the waveform if props deem so
            props.playing ? wavesurfer.current!.play() : wavesurfer.current!.pause();

            // Set the play end if passed in props
            (props.playEnd?.current !== undefined) ?
                wavesurfer.current!.setPlayEnd(props.playEnd.current) :
                wavesurfer.current!.setPlayEnd(wavesurfer.current!.getDuration());
        }

        // Call async render
        render();
    }, [
        props.playing, props.heightMultiplier, props.barGap, props.barWidth,
        props.barHeight, props.normalize, props.audioBuffer, props.audioContext,
    ]);

    // Cleanup when unmounted
    useEffect(() => {
        return () => {
            if (wavesurfer.current) {
                wavesurfer.current!.destroy();
                wavesurfer.current = undefined;
            }
        }
    }, []);



    /*
        OTHER WAVESURFER UPDATER EFFECTS
    */

    useEffect(() => {
        props.playing ? wavesurfer.current?.play() : wavesurfer.current?.pause();
    }, [props.playing]);

    useEffect(() => {
        if (props.seek !== undefined) wavesurfer.current?.seekTo(props.seek);
    }, [props.seek]);

    useEffect(() => {
        if (props.playEnd?.current !== undefined) {
            wavesurfer.current?.setPlayEnd(props.playEnd.current);
        }
        else {
            wavesurfer.current?.setPlayEnd(wavesurfer.current!.getDuration());
        }
    }, [props.playEnd?.current]);

    useEffect(() => {
        console.log('Regions changed in Waveform: ' + JSON.stringify(props.regions));
        wavesurfer.current?.regions.clear();

        if (props.regions === undefined || props.regions.length === 0) {
            return;
        }

        props.regions.forEach(region => {
            // Clone the object just in case
            wavesurfer.current?.addRegion({...region});
        });

    }, [props.regions]);



    /*
        WAVESURFER EVENT CALLBACKS
    */

    const handleAudioProcess = () => {
        props.audioProcessWavesurferCallback(wavesurfer.current!.getCurrentTime());
    }
    const handleFinish = () => {
        props.finishWavesurferCallback();
    }
    const handlePause = () => {
        props.pauseWavesurferCallback(wavesurfer.current!.getCurrentTime());
    }
    const handleSeek = () => {
        props.seekWavesurferCallback(wavesurfer.current!.getCurrentTime());
    }

    return (
        <>
            <Container fluid className='d-flex justify-content-start align-items-center mb-1'>
                <h6 className='fw-light fst-italic m-0 p-0'>Waveforme Preview</h6>
            </Container>
            <div
                ref={waveformParentContainer}
                style={{ width: '100%', touchAction: 'none' }}
            >
                <div
                    id='waveform'
                    ref={waveformContainer}
                />
            </div>
        </>
    )
}

export { WaveformOptions, WaveformCallbacks, WaveformInteractionCallbacks };
export default Waveform;