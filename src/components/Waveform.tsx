// Waveforme Waveform.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
import { clamp } from './waveformUtil';
import html2canvas from 'html2canvas';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { stop, setSelectedRegionStart, setSelectedRegionEnd, resetState, play, pause, WaveformState } from './waveformSlice';
import { setLocalWaveformImageURL } from './designerSlice';
import { RegionParams, RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { mp3UrlToAudioBuffer } from './designerUtil';



export default function Waveform() {

    // Config redux
    const dispatch = useAppDispatch();
    const activePage = useAppSelector(state => state.designer.activePage);
    const localOriginalMP3URL = useAppSelector(state => state.designer.localOriginalMP3URL);
    const waveformRenderOptions = useAppSelector(state => state.waveform.waveformRenderOptions);
    const playbackDirective = useAppSelector(state => state.waveform.playbackDirective);
    const activeTrimmedRegion = useAppSelector(state => state.waveform.activeTrimmedRegion);


    // Declare selected region selector & a setter to store the state in an arbitrary ref 
    // so we can use it outside of a useEffect
    const selectedRegion = useAppSelector(state => state.waveform.selectedRegion);
    const selectedRegionRef = useRef<[number, number]>([0, 0]);
    useEffect(() => {
        selectedRegionRef.current = [...selectedRegion];
    }, [selectedRegion]);


    // Define wavesurfer & assoc. container refs
    const waveformParentContainerRef = useRef<HTMLDivElement>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer>();
    // Track wavesurfer position to keep it synced on a re-render.
    const wavesurferPositionNormalized = useRef<number>(0);
    // Track whether wavesurfer 'ready' was fired.
    const wavesurferReady = useRef<boolean>(false);



    // Param generator helper
    const generateWavesurferParams = (
        container: HTMLDivElement,

        heightMultiplier: number,
        mode: WaveformState['waveformRenderOptions']['mode'],
        barHeight: number,
        barWidth: number,
        barGap: number,
        normalization: boolean,
    ) => ({
        barHeight: barHeight,
        barWidth: mode === 'bar' ? barWidth : null,
        barGap: barGap,
        normalize: normalization,
        cursorWidth: 0,
        container: container,
        removeMediaElementOnDestroy: false,
        backend: 'WebAudio',
        responsive: false,
        interact: false,
        hideScrollbar: true,
        progressColor: '#0D5BFF',
        waveColor: '#000000',
        barMinHeight: 3,
        height: (waveformParentContainerRef.current!.offsetWidth * heightMultiplier),
    });

    // Wavesurfer audio buffer drawer helper
    const drawAudioBufferOnWavesurfer = (audioBuf: AudioBuffer) => {
        // Re-create drawer
        wavesurfer.current!.drawer.destroy();
        wavesurfer.current!.createDrawer();

        // Load audio
        wavesurfer.current!.loadDecodedBuffer(audioBuf);
    }

    // Wavesurfer reset parameters helper
    const resetParametersOnWavesurfer = (params: WaveSurferParams) => {
        // Set new params
        wavesurfer.current!.params = Object.assign({}, wavesurfer.current!.defaultParams, params);

        // Destroy drawer
        wavesurfer.current!.drawer.destroy();

        // Re-create
        wavesurfer.current!.createDrawer();

        // Draw the buffer
        wavesurfer.current!.drawBuffer();

        // Set progress synchronously once here to remove flickering, otherwise wavesurfer 
        // waits for an audioprocess event to update the position, which is enough to flicker
        // back to 0 for a few ms
        wavesurfer.current!.drawer.progress(wavesurfer.current!.backend.getPlayedPercents());
    }

    // Wait for wavesurfer ref load helper
    // Use to ensure that wavesurfer is indeed constructed and fully defined before continuing
    const waitForWavesurferDefined = async () => {
        while (!wavesurfer.current) await new Promise(r => setTimeout(r, 50));
    }

    // Wait for wavesurfer audio load helper
    const waitForWavesurferAudioLoaded = async () => {
        while (!wavesurfer.current) await new Promise(r => setTimeout(r, 50));
        while (wavesurferReady.current === false) await new Promise(r => setTimeout(r, 50));
    }



    // Wavesurfer constructor/deconstructor
    useLayoutEffect(() => {
        const construct = async () => {
            console.log('Constructing wavesurfer');
            const WaveSurfer = (await import('wavesurfer.js')).default;
            const RegionsPlugin = (await import('wavesurfer.js/src/plugin/regions')).default;

            const params = generateWavesurferParams(
                waveformContainerRef.current!,
                waveformRenderOptions.heightMultiplier,
                waveformRenderOptions.mode,
                waveformRenderOptions.barHeight,
                waveformRenderOptions.barWidth,
                waveformRenderOptions.barGap,
                waveformRenderOptions.audioNormalization,
            );

            const newWavesurfer = WaveSurfer.create(params as WaveSurferParams);

            const regionsPluginParams: RegionsPluginParams = {
                dragSelection: false,
                snapToGridInterval: undefined,
                snapToGridOffset: undefined,
                edgeScrollWidth: undefined,
            }
            newWavesurfer.addPlugin(RegionsPlugin.create(regionsPluginParams));

            // Assign event handlers
            newWavesurfer.on('ready', () => wavesurferReady.current = true);
            newWavesurfer.on('pause', pauseHandler);
            newWavesurfer.on('finish', finishHandler);
            newWavesurfer.on('audioprocess', setWavesurferPosition);
            newWavesurfer.on('stop', setWavesurferPosition);

            // Draw an empty waveform as a temporary placeholder
            newWavesurfer.empty();

            wavesurfer.current = newWavesurfer;
        }

        construct();

        return () => {
            console.log('De-constructing wavesurfer');

            const deconstruct = async () => {
                console.log('Saving an image of the waveform');
                
                wavesurfer.current!.seekTo(0);

                const canvas = await html2canvas(waveformParentContainerRef.current!, {
                    backgroundColor: '#FFFFFF',
                });
                const imageBlob = await new Promise<Blob | null>(resolve => {
                    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
                });
                if (!imageBlob) throw Error('Unable to get image from canvas');
                
                const url = window.URL.createObjectURL(imageBlob);
                dispatch(setLocalWaveformImageURL(url));

                // Destroy wavesurfer instance
                wavesurfer.current!.destroy();

                // Call resetState to clean up stuff for next time
                dispatch(resetState());
            }

            if (wavesurfer.current) deconstruct();
        };
    }, []);



    // Whenever MP3 URL changes, re-draw wavesurfer
    // Also, whenever activeTrimmedRegion changes, re-draw wavesurfer
    // 
    // Everything else that can be mutated directly on an existing wavesurfer object 
    // will have its own useEffect.
    useEffect(() => {

        const run = async () => {
            // Important: async block until wavesurfer is defined.
            // Wavesurfer must be constructed before we run anything against it here.
            //console.log('MP3 URL effect waiting for wavesurfer defined');
            await waitForWavesurferDefined();
            //console.log('MP3 URL effect continuing...');

            //console.log('Render new MP3 URL on wavesurfer');
            // Get audiobuffer from current URL
            if (!localOriginalMP3URL) return;

            const audioBuf = await mp3UrlToAudioBuffer(localOriginalMP3URL, activeTrimmedRegion[0], activeTrimmedRegion[1]);
            drawAudioBufferOnWavesurfer(audioBuf);
        }

        run();

    }, [localOriginalMP3URL, activeTrimmedRegion]);



    // Whenever waveform render options change, re-draw wavesurfer
    useEffect(() => {

        const run = async () => {
            // Important: async block until wavesurfer is defined.
            // Wavesurfer must be constructed before we run anything against it here.
            //console.log('Render options effect waiting for wavesurfer defined');
            await waitForWavesurferDefined();
            //console.log('Render options effect continuing...');

            const params = generateWavesurferParams(
                waveformContainerRef.current!,
                waveformRenderOptions.heightMultiplier,
                waveformRenderOptions.mode,
                waveformRenderOptions.barHeight,
                waveformRenderOptions.barWidth,
                waveformRenderOptions.barGap,
                waveformRenderOptions.audioNormalization,
            );

            // Update wavesurfer
            resetParametersOnWavesurfer(params as WaveSurferParams);
        }

        run();

    }, [waveformRenderOptions]);



    // On playbackDirective change, mirror change to wavesurfer
    useEffect(() => {
        const run = async () => {
            // Important: async block until wavesurfer is defined.
            // Wavesurfer must be constructed before we run anything against it here.
            //console.log('playbackDirective effect waiting for wavesurfer defined');
            await waitForWavesurferDefined();
            await waitForWavesurferAudioLoaded();
            //console.log('playbackDirective effect continuing...');

            switch (playbackDirective) {
                case 'play':
                    if (activePage === 'main') wavesurfer.current!.play();
                    else if (activePage === 'trimmer') {
                        const duration = wavesurfer.current!.getDuration();
                        wavesurfer.current!.play(selectedRegionRef.current[0] * duration, selectedRegionRef.current[1] * duration);
                    }
                    break;
                case 'pause':
                    wavesurfer.current!.pause();
                    break;
                case 'stop':
                    wavesurfer.current!.stop();
                    break;
            }
        }

        run();

    }, [playbackDirective]);



    // On selected region change, re-draw regions on wavesurfer.
    // Only applicable for 'trimmer' activePage.
    useEffect(() => {

        const run = async () => {
            // Important: async block until wavesurfer is defined & audio loaded.
            // Wavesurfer must be constructed before we run anything against it here.
            //console.log('Region draw effect waiting for wavesurfer defined/audio loaded');
            await waitForWavesurferDefined();
            await waitForWavesurferAudioLoaded();
            //console.log('Region draw effect continuing...');

            if (activePage !== 'trimmer') {
                wavesurfer.current!.regions.clear();
                return;
            }

            wavesurfer.current!.regions.clear();

            const duration = wavesurfer.current!.getDuration();

            const region: RegionParams = {
                start: selectedRegion[0] * duration,
                end: selectedRegion[1] * duration,
                loop: false,
                drag: false,
                resize: false,
                color: '#30C5FF80',
                preventContextMenu: true,
                showTooltip: false,
            }

            wavesurfer.current!.addRegion(region);
        }

        run();

    }, [selectedRegion]);



    // 'finish' wavesurfer event handler. Just call stop() on wavesurfer for now.
    const finishHandler = () => {
        dispatch(stop());
    }

    // 'pause' wavesurfer event handler. Just call pause() on wavesurfer for now.
    const pauseHandler = () => {
        if (activePage === 'trimmer') {
            dispatch(stop());
        }
    }

    // 'audioprocess' wavesurfer event handler. Just keep track of the wavesurfer position for now.
    const setWavesurferPosition = () => {
        const normalizedPos = wavesurfer.current!.getCurrentTime() / wavesurfer.current!.getDuration();
        wavesurferPositionNormalized.current = clamp(normalizedPos, 0, 1);
    }



    // On component mount, configure touch/mouse drag handlers
    let parentContainerHolder: HTMLDivElement;
    useEffect(() => {

        const run = async () => {
            // Wait for wavesurfer load & audio ready
            await waitForWavesurferDefined();
            await waitForWavesurferAudioLoaded();

            console.log('Registering DOM interaction handlers');
            parentContainerHolder = waveformParentContainerRef.current!;
            parentContainerHolder.addEventListener('mousemove', e => onMouseMove(e));
            parentContainerHolder.addEventListener('touchstart', e => onTouchStart(e));
        }

        run();

        return () => {
            console.log('Cleaning up DOM interaction handlers');
            parentContainerHolder.removeEventListener('mousemove', e => onMouseMove(e));
            parentContainerHolder.removeEventListener('touchstart', e => onTouchStart(e));
        }
    }, []);



    // Helper to determine whether a position is closer to the start or the end of the trimmer region
    const isStartCloser = (pos: number): boolean => {
        const startPos = selectedRegionRef.current[0];
        const endPos = selectedRegionRef.current[1];

        return Math.abs(pos - startPos) < Math.abs(pos - endPos);
    }



    // Helpers to handle drags and drag finishes. Abstracts away the mouse vs. touch
    // Perform relevant logic based on activePage
    const onDrag = (pos: number) => {
        // If activePage === 'main', just seek the audio on drag.
        if (activePage === 'main') {
            wavesurfer.current!.seekTo(pos);
            dispatch(play());
        }
        // If activePage === 'trimmer', determine closest bar of region and mutate it
        else if (activePage === 'trimmer') {
            dispatch(stop());
            if (isStartCloser(pos)) {
                dispatch(setSelectedRegionStart(pos));
            }
            else {
                dispatch(setSelectedRegionEnd(pos));
            }
        }
    }
    const onDragFinish = (pos: number) => {
        // If activePage === 'main', just seek the audio on drag.
        if (activePage === 'main') {
            wavesurfer.current!.seekTo(pos);
        }
        // If activePage === 'trimmer', dispatch a stop then a play. The play effect will handle the proper section to play back.
        else if (activePage === 'trimmer') {
            const duration = wavesurfer.current!.getDuration();
            const startSec = selectedRegionRef.current[0] * duration;
            const endSec = selectedRegionRef.current[1] * duration;

            if (isStartCloser(pos)) {
                dispatch(play());
            }
            else {
                if (endSec - startSec > 1.5) {
                    wavesurfer.current!.play(endSec - 1.5, endSec);
                }
                else {
                    wavesurfer.current!.play(startSec, endSec);
                }
            }
        }
    }



    // Helper to generate normalized 0..1 position relative to waveform container
    // based on provided clientX value
    const waveformPosFromClientX = (clientX: number) => {
        return clamp((clientX - waveformParentContainerRef.current!.offsetLeft) / waveformParentContainerRef.current!.clientWidth, 0, 1);
    }

    // Touch/mouse dragging handlers
    const onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.target!.addEventListener('touchmove', e => onTouchMove(e as TouchEvent));
        e.target!.addEventListener('touchend', e => onTouchEnd(e as TouchEvent));
        onDrag(waveformPosFromClientX(e.changedTouches.item(0)!.clientX));
    }
    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        onDrag(waveformPosFromClientX(e.changedTouches.item(0)!.clientX));
    }
    const onTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.target!.removeEventListener('touchmove', e => onTouchMove(e as TouchEvent));
        e.target!.removeEventListener('touchend', e => onTouchEnd(e as TouchEvent));
        onDragFinish(waveformPosFromClientX(e.changedTouches.item(0)!.clientX));
    }

    const isMouseDragging = useRef<boolean>(false);
    const onMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (e.buttons === 0 && isMouseDragging.current) {
            onDragFinish(waveformPosFromClientX(e.clientX));
        }

        isMouseDragging.current = e.buttons === 1;
        if (!isMouseDragging.current) return;

        onDrag(waveformPosFromClientX(e.clientX));
    }



    return (
        <Container
            fluid
            style={{ maxWidth: '640px', width: '100%' }}
        >
            <Row className='justify-content-center align-items-center'>
                <Col>
                    <div
                        id='waveformParent'
                        ref={waveformParentContainerRef}
                    >
                        <div
                            id='waveform'
                            ref={waveformContainerRef}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}