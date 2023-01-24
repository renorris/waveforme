// Waveforme AudioUploader index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Col, Row } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';

interface AudioUploaderCallbacks {
    audioReadyCallback: (file: File) => void,
}

function AudioUploader(props: AudioUploaderCallbacks) {

    const [file, setFile] = useState<File | null>(null);
    const [isAudioExtracting, setIsAudioExtracting] = useState<boolean>(false);
    const [audioReady, setAudioReady] = useState<boolean>(false);

    // Set file state and signal ffmpeg to decode
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files!.item(0)!;
        console.log(`Handling file upload: ${file.name} (${file.type})`);
        setIsAudioExtracting(true);
        setFile(file);
    }

    // Touch the ffmpeg dynamic import so it loads in the background
    const touchFfmpeg = async () => {
        import('ffmpeg.js/ffmpeg-mp4');
    }

    // Touch the wavesurfer dynamic import so it loads in the background
    const touchWavesurfer = async () => {
        import('wavesurfer.js');
        import('wavesurfer.js/src/plugin/regions');
    }

    // FFmpeg decode on file change, call audioReadyCallback for parent
    useEffect(() => {

        // Async ffmpeg runner to be called later
        const runFfmpeg = async () => {
            console.log('Running FFmpeg');

            // Sleeping to let DOM update
            await new Promise(r => setTimeout(r, 100));

            const ffmpeg = await import('ffmpeg.js/ffmpeg-mp4');

            let result = ffmpeg.default({
                MEMFS: [{ name: file!.name, data: new Uint8Array(await file!.arrayBuffer()) }],
                print: function (data) { console.log(data + "\n") },
                printErr: function (data) { console.log(data + "\n"); },
                arguments: ["-i", file!.name, "-threads", "1", "-vn", "-ac", "1", "-b:a", "96k", "audio.mp3"],
                onExit: function (code) {
                    console.log("Process exited with code " + code);
                },
            });

            setAudioReady(true);
            setIsAudioExtracting(false);
            props.audioReadyCallback(new File([result.MEMFS[0].data], result.MEMFS[0].name));
        }

        // Call async ffmpeg runner
        if (file) {
            runFfmpeg();
        }

    }, [file]);

    // DEV:
    useEffect(() => {
        //setIsAudioExtracting(true);
    }, []);

    return (
        <>
            {!audioReady && !isAudioExtracting &&
                <>
                    <Row className='mt-2'>
                        <h2>Design your Waveforme</h2>
                    </Row>
                    <Row className='mt-2'>
                        <h5>Choose an audio or video file</h5>
                    </Row>
                    <input
                        id='formFile'
                        className='form-control mt-3'
                        style={{ maxWidth: '384px' }}
                        type='file'
                        accept='audio/*,video/*'
                        onClick={() => { touchFfmpeg(); touchWavesurfer(); }}
                        onChange={(event) => handleFileUpload(event)}
                    />
                </>
            }

            {isAudioExtracting &&
                <>
                    <Row className='mt-2'>
                        <h3>Extracting Audio...</h3>
                    </Row>
                    <Row className='mt-2'>
                        <Col className='d-flex align-items-center gap-2 text-wrap fw-light'>
                            <InfoCircle height={'auto'} />
                            <Col>This might take a while depending on your file size and network speed</Col>
                        </Col>
                    </Row>

                </>
            }
        </>
    );
}

export { AudioUploaderCallbacks };
export default AudioUploader;