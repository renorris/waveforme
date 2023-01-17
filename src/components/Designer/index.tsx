import React, { useState, useEffect, useRef, useCallback } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
import { Options } from 'ffmpeg.js/ffmpeg-mp4';
import { Result } from 'ffmpeg.js/ffmpeg-mp4';

function Designer() {

    // Config audio context
    const audioContextRef = useRef<AudioContext>();
    useEffect(() => {
        audioContextRef.current = new AudioContext({ sampleRate: 44100 });
    }, []);

    // Set stuff
    const audioBufferRef = useRef<AudioBuffer>();
    const [uploadedAudioReady, setUploadedAudioReady] = useState<boolean>(false);
    const audioUploadingStatusRef = useRef<HTMLDivElement | null>();
    const wavesurferRef = useRef<WaveSurfer>();
    const waveformContainerRef = useRef<HTMLDivElement | null>();
    const waveformParentContainerRef = useRef<HTMLDivElement | null>();
    const [playing, setPlaying] = useState<boolean>(false);
    const audioPositionRef = useRef<number>(0);
    const audioprocessTest = useRef<number>(0);

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
        barMinHeight: 3,
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

        if (uploadedAudioReady) {
            create();
        }

    }, [waveformOptions, uploadedAudioReady, playing]);

    // Handle component unmount equivalent
    useEffect(() => {
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.pause();
                wavesurferRef.current.destroy();
            }
        }
    }, []);

    // Touch ffmpeg spinning up the async load
    const touchFfmpeg = async () => {
        import('ffmpeg.js/ffmpeg-mp4');
    }

    // Touch wavesurfer spinning up the async load
    const touchWavesurfer = async () => {
        import('wavesurfer.js');
    }

    // Handle file upload events
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // Parse file
        let file = event.target.files?.item(0) as File;
        console.log(file.type);
        let fileUint8Array = new Uint8Array(await file.arrayBuffer());
        let fileName = file.name;

        let audioUploadingStatusElement = audioUploadingStatusRef.current as HTMLDivElement;
        audioUploadingStatusElement.style.display = 'block';

        // ffmpeg test
        const ffmpeg = await import('ffmpeg.js/ffmpeg-mp4');

        console.log("fired");

        let stderr: string;
        let stdout: string;
        let result = ffmpeg.default({
            MEMFS: [{ name: file.name, data: fileUint8Array }],
            print: function (data) { stdout += data + "\n"; },
            printErr: function (data) { stderr += data + "\n"; },
            // ffmpeg -i input.wav -vn -ar 44100 -ac 2 -b:a 192k output.mp3
            arguments: ["-i", file.name, "-threads", "1", "-vn", "-ac", "1", "-b:a", "256k", "out.mp3"],
            onExit: function (code) {
                console.log("Process exited with code " + code);
                console.log(stdout);
                console.log(stderr);
            },
        });

        audioBufferRef.current = await audioContextRef.current?.decodeAudioData(result.MEMFS[0].data.buffer);

        audioUploadingStatusElement.style.display = 'none';
        setUploadedAudioReady(true);
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
        <Container 
            fluid 
            className='designerContainer d-flex flex-column justify-content-center align-items-center mx-0 px-2'
            
        >
            <div
                className='audioUploadContainer mt-3'
                style={{ display: uploadedAudioReady ? 'none' : 'block', maxWidth: '512px' }}
            >
                <input
                    id='formFile'
                    className='form-control'
                    type='file'
                    onChange={event => handleFileUpload(event)}
                    onClick={() => {
                            touchFfmpeg();
                            touchWavesurfer();
                        }
                    }   
                />
            </div>

            <div
                id='audioUploadingStatus'
                className='mt-3'
                style={{ display: 'none', maxWidth: '512px' }}
                ref={audioUploadingStatusRef as React.MutableRefObject<HTMLDivElement | null>}
            >
                <h3>Extracting Audio...</h3>
                <p>This might take a while depending on your file size and network speed</p>
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

            <Container
                id='mainControlsContainer'
                className={`${uploadedAudioReady ? 'd-flex' : 'd-none'} flex-column justify-content-center align-items-center`}
                style={{ maxWidth: '512px' }}
            >

                <Container
                    id='playPauseRowContainer'
                    className='d-flex flex-row gap-2 justify-content-center align-items-center mt-2'>
                    <Button
                        onClick={handlePlayButtonClick}
                        variant={playing ? 'danger' : 'success'}
                    >
                        {playing ? 'Pause' : 'Play'}
                    </Button>
                </Container>

                <Container
                    id='waveformControlsContainer'
                    className='d-flex flex-row justify-content-center align-items-center mt-2'
                >

                    <Container
                        id='leftButtonsContainer'
                        className='d-flex flex-column gap-2 justify-content-start align-items-start p-0'>
                        <Button variant='outline-secondary'>Button 1</Button>
                        <Button variant='outline-secondary'>Button 2</Button>
                        <Button variant='outline-secondary'>Button 3</Button>
                    </Container>

                    <Container
                        id='rangeSelectorContainer'
                        className='d-flex flex-column gap-2 justify-content-start align-items-start p-0'
                    >
                        <div>
                            Intensity
                            <Button
                                className='ms-2 btn-sm'
                                variant={waveformOptions.normalize ? 'info' : 'outline-secondary'}
                                onClick={handleNormalizeButtonPress}
                            >
                                {waveformOptions.normalize ? 'Normalized' : 'Normalize'}
                            </Button>
                        </div>
                        <FormRange
                            id='barHeightRange'
                            min='0.1'
                            max='5'
                            defaultValue='1'
                            step='0.01'
                            disabled={waveformOptions.normalize}
                            onChange={event => handleBarHeightRangeChange(parseFloat(event.target.value))}
                        />
                        <div>Width</div>
                        <FormRange
                            id='barWidthRange'
                            min='1'
                            max='15'
                            defaultValue='1'
                            step='0.01'
                            onChange={event => handleBarWidthRangeChange(parseFloat(event.target.value))}
                        />
                        <div>Spacing</div>
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
        </Container>
    );
}

export default Designer;