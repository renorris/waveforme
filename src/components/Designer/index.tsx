import React, { useState, useEffect, useRef, useCallback } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import { WaveSurferParams } from 'wavesurfer.js/types/params';

function Designer() {

    // Hold master AudioContext ref
    const audioContextRef = useRef<AudioContext>();

    // Initial set
    useEffect(() => {
        audioContextRef.current = new AudioContext({ sampleRate: 44100 });
    }, []);

    // Hold master audio ArrayBuffer ref
    const audioBufferRef = useRef<AudioBuffer>();

    // Hold audio uploaded state
    const [audioUploaded, setAudioUploaded] = useState<boolean>(false);

    // Hold wavesurfer instance ref
    const wavesurferRef = useRef<WaveSurfer>();

    // Hold wavesurfer DOM refs
    const waveformContainerRef = useRef<HTMLDivElement | null>();
    const waveformParentContainerRef = useRef<HTMLDivElement | null>();

    // Hold wavesurfer audio data ref
    const audioDataRef = useRef<string>('https://wavesurfer-js.org/example/media/demo.wav');

    // Hold playing state
    const [playing, setPlaying] = useState<boolean>(false);

    // Hold position ref
    const audioPositionRef = useRef<number>(0);

    // Hold testing audioprocess ref
    const audioprocessTest = useRef<number>(0);

    // Hold waveform options state
    const [waveformOptions, setWaveformOptions] = useState({
        heightMultiplier: 0.5,
        barGap: 1,
        barWidth: 1,
        barHeight: 1,
        normalize: false,
    });

    // Helper function to generate params based off of waveformOptions and default values
    const wavesurferParams = (waveformContainer: HTMLDivElement) => ({
        barHeight: waveformOptions.barHeight,
        barWidth: waveformOptions.barWidth,
        barGap: waveformOptions.barGap,
        normalize: waveformOptions.normalize,
        cursorWidth: 0,
        container: waveformContainer,
        backend: 'WebAudio',
        audioContext: audioContextRef.current,
        closeAudioContext: false,
        responsive: false,
        hideScrollbar: true,
        progressColor: '#0D5BFF',
        waveColor: '#000000',
        height: (waveformParentContainerRef.current?.offsetWidth as number * waveformOptions.heightMultiplier),
    });

    // Wavesurfer rendering effect, re-renders everything cleanly (hopefully) with each React render...!
    // Also only for the client, which is the whole point here. Wavesurfer unfortunately doesn't work on SSR very well.
    useEffect(() => {
        const create = async () => {
            console.log('Inside async create()');

            // Create the new container for the waveform.
            // This will replace the current #waveform once we're ready draw (after .load)
            let newWaveformContainer = document.createElement('div');
            newWaveformContainer.id = "newWaveform";
            newWaveformContainer.style.display = "none";
            waveformParentContainerRef.current?.appendChild(newWaveformContainer);

            // Load WaveSurfer (SSR makes this a pain)
            const WaveSurfer = (await import('wavesurfer.js')).default;

            // Create the new wavesurfer object
            let newWavesurfer = WaveSurfer.create(wavesurferParams(newWaveformContainer) as WaveSurferParams);

            // Load the audio
            newWavesurfer.loadDecodedBuffer(audioBufferRef.current);

            // Now wait for a .once 'ready' fire...
            //newWavesurfer.once('ready', () => {
            //console.log("newWavesurfer 'ready' fired!");

            let waveformContainer = document.getElementById("waveform") as HTMLDivElement;
            let waveformParentContainer: HTMLDivElement = waveformParentContainerRef.current as HTMLDivElement;

            // Empty the current waveform container to make room (idk why it needs this)
            waveformContainer.innerHTML = '';

            // Append the new container to parent
            waveformParentContainer.appendChild(newWaveformContainer);

            // Remove the old container
            waveformContainer.remove();

            // Set new container to #waveform
            newWaveformContainer.id = "waveform";

            // Set display to 'block' so we can draw the buffer
            newWaveformContainer.style.display = "block";

            // Draw the buffer
            newWavesurfer.drawBuffer();

            // Destroy old wavesurfer and registered events
            if (wavesurferRef.current) {
                wavesurferRef.current.unAll();
                //wavesurferRef.current.un('audioprocess', audioprocessHandler);
                //wavesurferRef.current.un('finish', finishHandler);
                wavesurferRef.current.destroy();
            }

            // Re-assign wavesurfer to new one
            wavesurferRef.current = newWavesurfer;

            // Assign event handlers
            wavesurferRef.current.on('audioprocess', handleAudioprocess);
            wavesurferRef.current.on('finish', handleFinish);

            // Set seek position of waveform
            wavesurferRef.current.seekTo((1 / wavesurferRef.current.getDuration()) * audioPositionRef.current);

            // If playing, play waveform
            if (playing) {
                wavesurferRef.current.play();
            }
            //});
        }

        if (audioUploaded) {
            create();
        }

    }, [waveformOptions, audioUploaded]);

    // Handle component unmount equivalent
    useEffect(() => {
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.pause();
                wavesurferRef.current.destroy();
            }
        }
    }, []);

    // Handle file upload events
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let arrayBuffer = await event.target.files?.item(0)?.arrayBuffer();
        console.log(arrayBuffer);
        audioBufferRef.current = await audioContextRef.current?.decodeAudioData(arrayBuffer as ArrayBuffer);
        console.log(audioBufferRef.current);
        
        setAudioUploaded(true);
    }

    // wavesurfer audioprocess event callback handler
    const handleAudioprocess = () => {
        // test TODO: remove
        audioprocessTest.current++;

        // Set current position
        audioPositionRef.current = wavesurferRef.current?.getCurrentTime() as number;
    }

    // wavesurfer finish event callback handler
    const handleFinish = () => {
        audioPositionRef.current = 0;
        setPlaying(false);
        wavesurferRef.current?.seekTo(0);
    }

    // Handle waveform option controls
    const handleNormalizeButtonPress = () => {
        setWaveformOptions(Object.assign({}, waveformOptions, { normalize: !waveformOptions.normalize }));
    }

    const handleBarHeightRangeChange = (value: number) => {
        setWaveformOptions(Object.assign({}, waveformOptions, { barHeight: value }));
    }

    const handleBarWidthRangeChange = (value: number) => {
        setWaveformOptions(Object.assign({}, waveformOptions, { barWidth: value }));
    }

    const handleBarGapRangeChange = (value: number) => {
        setWaveformOptions(Object.assign({}, waveformOptions, { barGap: value }));
    }

    const handlePlayButtonClick = () => {
        if (playing) {
            wavesurferRef.current?.pause();
        }
        else {
            wavesurferRef.current?.play();
        }

        setPlaying(!playing);
    }

    return (
        <Container fluid className='designerContainer d-flex flex-column justify-content-center align-items-center mx-0 px-2'>
            <div
                className='audioUploadContainer'
                style={{ display: `${audioUploaded ? 'none' : 'block'}` }}
            >
                <input
                    id='formFile'
                    className='form-control'
                    type='file'
                    onChange={event => handleFileUpload(event)}
                />
            </div>

            <div
                id='waveformParentContainer'
                ref={waveformParentContainerRef as React.MutableRefObject<HTMLDivElement | null>}
                className='waveformParentContainer d-flex flex-column mx-2'
                style={{ width: '100%', maxWidth: '512px' }}
            >
                <div
                    id='waveform'
                    ref={waveformContainerRef as React.MutableRefObject<HTMLDivElement | null>}
                />
            </div>

            <Container className='audioControlsRowFlexContainer mt-3 d-flex flex-row gap-2 justify-content-center align-items-center'>
                <Button
                    onClick={handlePlayButtonClick}
                    variant={playing ? 'danger' : 'success'}
                >
                    {playing ? 'Pause' : 'Play'}
                </Button>
            </Container>

            <Container className='debugColumnFlexContainer mt-3 d-flex flex-column gap-2 justify-content-center align-items-center'>
                <p>DEBUG: {audioprocessTest.current}, {audioPositionRef.current}</p>
            </Container>

            <Container className='waveformControlsRowFlexContainer mt-3 d-flex flex-row gap-2 justify-content-start align-items-start' style={{ maxWidth: '512px' }}>

                <Container className='switchControlsFlexContainer d-flex flex-column gap-2 justify-content-start align-items-start p-0'>
                    <Button
                        variant={waveformOptions.normalize ? 'success' : 'outline-danger'}
                        onClick={handleNormalizeButtonPress}
                    >Normalize</Button>
                </Container>

                <Container className='rangeControlsFlexContainer d-flex flex-column gap-2 justify-content-start align-items-start p-0'>
                    <div>Intensity: {waveformOptions.normalize ? 'Normalized' : waveformOptions.barHeight}</div>
                    <FormRange
                        id='barHeightRange'
                        min='0.1'
                        max='5'
                        defaultValue='1'
                        step='0.01'
                        disabled={waveformOptions.normalize}
                        onChange={event => handleBarHeightRangeChange(parseFloat(event.target.value))}
                    />
                    <div>Width: {waveformOptions.barWidth}</div>
                    <FormRange
                        id='barWidthRange'
                        min='1'
                        max='15'
                        defaultValue='1'
                        step='0.01'
                        onChange={event => handleBarWidthRangeChange(parseFloat(event.target.value))}
                    />
                    <div>Spacing: {waveformOptions.barGap}</div>
                    <FormRange
                        id='barGapRange'
                        min='1'
                        max='10'
                        defaultValue='1'
                        step='0.01'
                        onChange={event => handleBarGapRangeChange(parseFloat(event.target.value))}
                    />
                </Container>
            </Container>
        </Container>
    );
}

export default Designer;