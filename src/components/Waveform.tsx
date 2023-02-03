// Waveforme Waveform.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useRef, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
import { clamp } from './waveformUtil';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { stop } from './waveformSlice';
import { RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { mp3UrlToAudioBuffer } from './designerUtil';

export default function Waveform() {

    // Config redux
    const dispatch = useAppDispatch();
    const activePage = useAppSelector(state => state.designer.activePage);
    const localOriginalMP3URL = useAppSelector(state => state.designer.localOriginalMP3URL);
    const waveformRenderOptions = useAppSelector(state => state.waveform.waveformRenderOptions);
    const playbackDirective = useAppSelector(state => state.waveform.playbackDirective);

    // Define wavesurfer & assoc. container refs
    const waveformParentContainerRef = useRef<HTMLDivElement>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer>();
    // Track wavesurfer position to keep it synced on a re-render.
    const wavesurferPositionNormalized = useRef<number>(0);

    // Define helper functions to mutate wavesurfer
    // ---


    // Param generator helper
    const generateWavesurferParams = (
        container: HTMLDivElement,

        heightMultiplier: number,
        barHeight: number,
        barWidth: number,
        barGap: number,
        normalization: boolean,

        cursorWidth: number,
    ) => ({
        barHeight: barHeight,
        barWidth: barWidth,
        barGap: barGap,
        normalize: normalization,
        cursorWidth: cursorWidth,
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
        while (!wavesurfer.current) await new Promise(r => setTimeout(r, 10));
    }


    // Wavesurfer constructor/deconstructor
    useEffect(() => {
        const construct = async () => {
            console.log('Constructing wavesurfer');
            const WaveSurfer = (await import('wavesurfer.js')).default;
            const RegionsPlugin = (await import('wavesurfer.js/src/plugin/regions')).default;

            const params = generateWavesurferParams(
                waveformContainerRef.current!,
                waveformRenderOptions.heightMultiplier,
                waveformRenderOptions.barHeight,
                waveformRenderOptions.barWidth,
                waveformRenderOptions.barGap,
                waveformRenderOptions.audioNormalization,
                0,
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
            newWavesurfer.on('finish', finishHandler);
            newWavesurfer.on('audioprocess', setWavesurferPosition);
            newWavesurfer.on('stop', setWavesurferPosition);

            wavesurfer.current = newWavesurfer;
        }

        construct();

        return () => {
            console.log('De-constructing wavesurfer');
            if (wavesurfer.current) wavesurfer.current.destroy();
        };
    }, []);



    // Whenever MP3 URL changes, re-draw wavesurfer
    // 
    // Everything else that can be mutated directly on an existing wavesurfer object 
    // will have its own useEffect.
    useEffect(() => {

        const run = async () => {
            // Important: async block until wavesurfer is defined.
            // Wavesurfer must be constructed before we run anything against it here.
            console.log('MP3 URL effect waiting for wavesurfer defined');
            await waitForWavesurferDefined();
            console.log('MP3 URL effect continuing...');

            //console.log('Render new MP3 URL on wavesurfer');
            // Get audiobuffer from current URL
            if (!localOriginalMP3URL) return;

            const audioBuf = await mp3UrlToAudioBuffer(localOriginalMP3URL);
            drawAudioBufferOnWavesurfer(audioBuf);
        }

        run();

    }, [localOriginalMP3URL]);



    // Whenever waveform render options change, re-draw wavesurfer
    // Also re-render params on playbackDirective change. (Syncs playback
    // cursor visibility.)
    useEffect(() => {

        const run = async () => {
            // Important: async block until wavesurfer is defined.
            // Wavesurfer must be constructed before we run anything against it here.
            console.log('Render options effect waiting for wavesurfer defined');
            await waitForWavesurferDefined();
            console.log('Render options effect continuing...');

            const params = generateWavesurferParams(
                waveformContainerRef.current!,
                waveformRenderOptions.heightMultiplier,
                waveformRenderOptions.barHeight,
                waveformRenderOptions.barWidth,
                waveformRenderOptions.barGap,
                waveformRenderOptions.audioNormalization,
                playbackDirective === 'stop' ? 0 : 1,
            );

            // Update wavesurfer
            resetParametersOnWavesurfer(params as WaveSurferParams);
        }

        run();

    }, [waveformRenderOptions, playbackDirective]);



    // On playbackDirective change, mirror change to wavesurfer
    useEffect(() => {
        const run = async () => {
            // Important: async block until wavesurfer is defined.
            // Wavesurfer must be constructed before we run anything against it here.
            console.log('playbackDirective effect waiting for wavesurfer defined');
            await waitForWavesurferDefined();
            console.log('playbackDirective effect continuing...');

            switch (playbackDirective) {
                case 'play':
                    wavesurfer.current!.play();
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



    // 'finish' wavesurfer event handler. Just call stop() on wavesurfer for now.
    const finishHandler = () => {
        dispatch(stop());
    }

    // 'audioprocess' wavesurfer event handler. Just keep track of the wavesurfer position for now.
    const setWavesurferPosition = () => {
        const normalizedPos = wavesurfer.current!.getCurrentTime() / wavesurfer.current!.getDuration();
        wavesurferPositionNormalized.current = clamp(normalizedPos, 0, 1);
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