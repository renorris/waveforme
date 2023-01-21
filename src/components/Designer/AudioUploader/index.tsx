// Waveforme AudioUploader index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from 'react-bootstrap';
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

    return (
        <>
            {!audioReady &&
                <div>
                    <input
                        id='formFile'
                        className='form-control'
                        type='file'
                        accept='audio/*,video/*'
                        onClick={event => { touchFfmpeg(); touchWavesurfer(); }}
                        onChange={(event) => handleFileUpload(event)}
                    />
                </div>
            }

            {isAudioExtracting &&
                <Container
                    className='d-flex flex-column justify-content-center align-items-center gap-2 mt-3'
                >
                    <h3>Extracting Audio...</h3>
                    <Container className='fw-light d-flex flex-row justify-content-start align-items-center p-0 gap-2'>
                        <InfoCircle size={15} />
                        This might take a while depending on your file size and network speed
                    </Container>
                </Container>
            }
        </>
    );
}

export { AudioUploaderCallbacks };
export default AudioUploader;