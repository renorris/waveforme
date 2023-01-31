// Waveforme Waveform index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { RegionParams, RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { WaveSurferParams } from 'wavesurfer.js/types/params';

import { Clamp, generateTrimmerRegion } from '../util';
import { useAppSelector, useAppDispatch } from '../../../state/hooks';
import { seekTo, pause, play, setDragPos, DesignerTool, setTrimmerStartPos, setTrimmerEndPos, playUntil } from '../designerSlice';

function Waveform() {

    const wavesurfer = useRef<WaveSurfer>();
    const waveformContainer = useRef<HTMLDivElement>(null);
    const waveformParentContainer = useRef<HTMLDivElement>(null);
    const wavesurferPosition = useRef<number>(0);

    const dispatch = useAppDispatch();
    // Use selectors here to listen for state
    const heightMultiplier = useAppSelector(state => state.designer.heightMultiplier);
    const barHeight = useAppSelector(state => state.designer.barHeight);
    const barWidth = useAppSelector(state => state.designer.barWidth);
    const barGap = useAppSelector(state => state.designer.barGap);
    const normalize = useAppSelector(state => state.designer.normalize);
    const playing = useAppSelector(state => state.designer.playing);
    const seek = useAppSelector(state => state.designer.seek);
    const audioBufferChannelData = useAppSelector(state => state.designer.audioBufferChannelData);
    const audioBufferFrameCount = useAppSelector(state => state.designer.audioBufferFrameCount);
    const trimmerRegionBoundaries = useAppSelector(state => state.designer.trimmerRegionBoundaries);
    const playEnd = useAppSelector(state => state.designer.playEnd);
    const regions = useAppSelector(state => state.designer.regions);
    const dragPos = useAppSelector(state => state.designer.dragPos);
    const dragFinishSignal = useAppSelector(state => state.designer.dragFinishSignal);
    const activeTool = useAppSelector(state => state.designer.activeTool);



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
        dispatch(setDragPos(Clamp(position, 0, 1)));
    }
    const onMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onMouseDown');
        isDragging.current = true;
        const position = (event.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        console.log('Mouse is now dragging!')
        dispatch(setDragPos(Clamp(position, 0, 1)));
    }
    const onMouseUp = (event: MouseEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onMouseUp');
        isDragging.current = false;
        const position = (event.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        console.log('Mouse is no longer dragging.');
        dispatch(setDragPos(Clamp(position, 0, 1)));
    }

    const onTouchStart = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.target!.addEventListener('touchmove', event => onTouchMove(event as TouchEvent));
        event.target!.addEventListener('touchend', event => onTouchEnd(event as TouchEvent));
        console.log('Running onTouchStart');
        const position = (event.changedTouches.item(0)!.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        dispatch(setDragPos(Clamp(position, 0, 1)));
    }
    const onTouchMove = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.log('Running onTouchMove');
        console.log(`bubbles = ${event.bubbles}`);
        const position = (event.changedTouches.item(0)!.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        dispatch(setDragPos(Clamp(position, 0, 1)));
    }
    const onTouchEnd = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.target!.removeEventListener('touchmove', event => onTouchMove(event as TouchEvent));
        event.target!.removeEventListener('touchend', event => onTouchEnd(event as TouchEvent));
        console.log('Running onTouchEnd');
        const position = (event.changedTouches.item(0)!.clientX - waveformParentContainer.current!.offsetLeft) / waveformParentContainer.current!.clientWidth;
        dispatch(setDragPos(Clamp(position, 0, 1)));
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
        barHeight: barHeight,
        barWidth: barWidth,
        barGap: barGap,
        normalize: normalize,
        cursorWidth: playing ? 1 : 0,
        container: waveformContainer.current!,
        removeMediaElementOnDestroy: false,
        backend: 'WebAudio',
        //audioContext: props.audioContext,
        responsive: false,
        interact: false,
        hideScrollbar: true,
        progressColor: '#0D5BFF',
        waveColor: '#000000',
        barMinHeight: 3,
        height: (waveformParentContainer.current?.offsetWidth as number * heightMultiplier),
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
        activeTool
    */

    useEffect(() => {

        // Async render function to be called later
        const render = async () => {
            console.log('Rendering waveform');

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
            // Might be slow: TODO - only create new buffer when necessary
            const audioCtx = wavesurfer.current!.backend.getAudioContext();
            const audioBuffer = audioCtx.createBuffer(1, audioBufferFrameCount, 44100);
            audioBuffer.copyToChannel(audioBufferChannelData, 0);
            wavesurfer.current.loadDecodedBuffer(audioBuffer);

            // Add regions if regions were passed in props
            if (regions.length > 0) {

                console.log('Removing old regions');
                wavesurfer.current!.regions.clear();

                console.log('Building regions');

                regions.forEach(region => {
                    // Copy the object just in case
                    wavesurfer.current!.addRegion({ ...region });
                });
            }

            // Sync cursor position
            wavesurfer.current!.seekTo((1 / wavesurfer.current!.getDuration()) * wavesurferPosition.current);

            // Play the waveform if props deem so
            if (playing) wavesurfer.current!.play();

            // Set the play end if passed in props
            (playEnd !== null) ?
                wavesurfer.current!.setPlayEnd(playEnd) :
                wavesurfer.current!.setPlayEnd(wavesurfer.current!.getDuration());
        }

        // Call async render
        render();
    }, [
        playing, heightMultiplier, barGap, barWidth,
        barHeight, normalize, audioBufferChannelData,
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
        playing ? wavesurfer.current?.play() : wavesurfer.current?.pause();
    }, [playing]);

    useEffect(() => {
        wavesurfer.current?.seekTo(seek);
    }, [seek]);

    useEffect(() => {
        if (playEnd !== null) {
            wavesurfer.current?.setPlayEnd(playEnd);
        }
        else {
            wavesurfer.current?.setPlayEnd(wavesurfer.current!.getDuration());
        }
    }, [playEnd]);

    useEffect(() => {
        console.log('Regions changed in Waveform: ' + JSON.stringify(regions));
        wavesurfer.current?.regions.clear();

        if (regions.length === 0) {
            return;
        }

        regions.forEach(region => {
            // Clone the object just in case
            wavesurfer.current?.addRegion({ ...region });
        });

    }, [regions]);

    // On drag
    useEffect(() => {
        if (activeTool === DesignerTool.MAIN) {
            dispatch(seekTo(dragPos));
        }
        else if (activeTool === DesignerTool.TRIMMER) {
            console.log('Trimmer waveform onDrag. Mutating trimmer regions...');

            const startSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.start;
            const endSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.end;
            const positionSec = (audioBufferFrameCount / 44100) * dragPos;
            const isStartCloser = (Math.abs(startSec - positionSec) < Math.abs(endSec - positionSec));

            if (isStartCloser) {
                dispatch(setTrimmerStartPos(dragPos));
            }
            else {
                dispatch(setTrimmerEndPos(dragPos));
            }

            dispatch(pause());
        }
    }, [dragPos]);

    // On drag finish
    useEffect(() => {
        if (activeTool === DesignerTool.MAIN) {
            dispatch(seekTo(dragPos));
        }
        else if (activeTool === DesignerTool.TRIMMER) {
            console.log('Trimmer waveform onDragFinish');
            const startSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.start;
            const endSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.end;
            const positionSec = (audioBufferFrameCount / 44100) * dragPos;
            const isStartCloser = (Math.abs(startSec - positionSec) < Math.abs(endSec - positionSec));

            const previewPlaybackDuration = 1.5;
            const duration = audioBufferFrameCount / 44100;

            if (isStartCloser) {
                dispatch(seekTo(dragPos));
                dispatch(setTrimmerStartPos(dragPos));
                (endSec - positionSec) > previewPlaybackDuration ?
                    dispatch(playUntil((positionSec + 1.5) / duration)) :
                    dispatch(playUntil(endSec));
            }
            else {
                dispatch(playUntil(positionSec));
                if ((positionSec - startSec) > previewPlaybackDuration) {
                    const pos = Clamp(((positionSec - previewPlaybackDuration) / duration), 0, 1);
                    dispatch(seekTo(pos));
                }
                else {
                    const pos = Clamp(startSec / duration, 0, 1);
                    dispatch(seekTo(pos));
                }
            }

            dispatch(play());
        }
    }, [dragFinishSignal]);



    /*
        WAVESURFER EVENT CALLBACKS
    */

    const handleAudioProcess = () => {
        wavesurferPosition.current = wavesurfer.current!.getCurrentTime();
    }
    const handleFinish = () => {
        wavesurferPosition.current = 0;
        dispatch(seekTo(0));
        dispatch(pause());
    }
    const handlePause = () => {
        console.log('wavesurfer pause fired');

        const positionSec = wavesurfer.current!.getCurrentTime();
        const startSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.start;
        const endSec = (audioBufferFrameCount / 44100) * trimmerRegionBoundaries.end;
        // Only pause state if position is at trimmer end
        console.log(`positionSec = ${positionSec}, playEnd = ${playEnd}`);

        if (endSec && Math.abs(positionSec - endSec) <= 0.01) {
            dispatch(pause());
        }
    }
    const handleSeek = () => {
        wavesurferPosition.current = wavesurfer.current!.getCurrentTime();
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

export default Waveform;