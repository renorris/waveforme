// Waveforme AudioUploader index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

    // FFmpeg decode on file change, call audioReadyCallback for parent
    useEffect(() => {

        // Async ffmpeg runner to be called later
        const runFfmpeg = async () => {
            console.log('Running FFmpeg');
            const ffmpeg = await import('ffmpeg.js/ffmpeg-mp4');
            
            let stderr: string;
            let stdout: string;
            let result = ffmpeg.default({
                MEMFS: [{ name: file!.name, data: new Uint8Array(await file!.arrayBuffer()) }],
                print: function (data) { stdout += data + "\n"; },
                printErr: function (data) { stderr += data + "\n"; },
                arguments: ["-i", file!.name, "-threads", "1", "-vn", "-ac", "1", "-b:a", "96k", "audio.mp3"],
                onExit: function (code) {
                    console.log("Process exited with code " + code);
                    console.log(stdout);
                    console.log(stderr);
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
                        onClick={ touchFfmpeg }
                        onChange={ (event) => handleFileUpload(event) }
                    />
                </div>
            }

            {isAudioExtracting &&
                <div
                    id='audioUploadingStatus'
                    className='mt-3'
                    style={{ maxWidth: '512px' }}
                >
                    <h3>Extracting Audio...</h3>
                    <p>This might take a while depending on your file size and network speed</p>
                </div>
            }
        </>
    );
}

export { AudioUploaderCallbacks };
export default AudioUploader;