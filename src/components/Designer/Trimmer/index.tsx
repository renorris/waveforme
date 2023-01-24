// Waveforme Trimmer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';

import TrimmerControls, { TrimmerControlsCallbacks } from '../TrimmerControls';
import { WaveformOptions } from '../Waveform';

interface TrimmerOptions {
    file: File,
    duration: number,
    waveformOptions: WaveformOptions,
}

interface TrimmerCallbacks {
    // On trim complete
    trimCompleteCallback: (file: File) => void,

    // Should close trimmer
    trimCloseCallback: () => void,

    // Should play/pause audio
    trimPlayPauseCallback: () => void,
}

function Trimmer(props: React.PropsWithChildren & TrimmerOptions & TrimmerCallbacks) {

    const [shouldTrimAudio, setShouldTrimAudio] = useState<boolean>(false);
    const lowEndRef = useRef<number>(0);
    const highEndRef = useRef<number>(1);

    const trimmerControlsCallbacks: TrimmerControlsCallbacks = {
        trimButtonCallback: () => {
            let val1 = 0.3;
            let val2 = 0.7;
            console.log(`val1 = ${val1}`);
            console.log(`val2 = ${val2}`);
            if (val1 > val2) {
                highEndRef.current = val1;
                lowEndRef.current = val2;
            }
            else {
                lowEndRef.current = val1;
                highEndRef.current = val2;
            }
            console.log(`lowEndRef = ${lowEndRef.current}`);
            console.log(`highEndRef = ${highEndRef.current}`);
            setShouldTrimAudio(true);
        },

        playPauseButtonCallback: () => {
            // Forward along to parent component
            props.trimPlayPauseCallback();
        },

        backButtonCallback: () => {
            // Forward along to parent component
            props.trimCloseCallback();
        },
    }

    // FFmpeg trim on signal
    useEffect(() => {

        // Async ffmpeg runner to be called later
        const runFfmpeg = async () => {
            console.log('Running FFmpeg');

            // Sleeping to let DOM update
            await new Promise(r => setTimeout(r, 100));

            const ffmpeg = await import('ffmpeg.js/ffmpeg-mp4');

            //let audio = document.createElement('audio');
            //audio.preload = 'metadata';
            //console.log(`file = ${props.file.name}`);
            //audio.src = URL.createObjectURL(props.file);
            //await new Promise(resolve => audio.onloadedmetadata = () => resolve(true));
            //let duration = audio.duration;

            console.log(`duration = ${props.duration}`);
            console.log(`lowEndRef string = ${(lowEndRef.current * props.duration).toFixed(4).toString()}`);
            console.log(`highEndRef string = ${(highEndRef.current * props.duration).toFixed(4).toString()}`);

            let result = ffmpeg.default({
                MEMFS: [{ name: props.file.name, data: new Uint8Array(await props.file.arrayBuffer()) }],
                print: function (data) { console.log(data + "\n"); },
                printErr: function (data) { console.log(data + "\n"); },
                arguments: [
                    "-y",
                    "-ss",
                    (lowEndRef.current * props.duration).toFixed(6).toString(),
                    "-to",
                    (highEndRef.current * props.duration).toFixed(6).toString(),
                    "-accurate_seek",
                    "-i",
                    props.file.name,
                    "-threads",
                    "1",
                    "-c:a",
                    "copy",
                    "out.mp3"
                ],
                onExit: function (code) {
                    console.log("Process exited with code " + code);
                },
            });

            setShouldTrimAudio(false);
            props.trimCompleteCallback(new File([result.MEMFS[0].data], 'audio.mp3'));
        }

        if (shouldTrimAudio) {
            runFfmpeg();
        }

    }, [shouldTrimAudio]);

    return (
        <>
            {props.children}

            {!shouldTrimAudio &&
                <TrimmerControls
                    {...trimmerControlsCallbacks}
                    waveformOptions={props.waveformOptions}
                />
            }

            {shouldTrimAudio &&
                <>
                    <h3>Trimming your audio...</h3>
                </>
            }
        </>
    )
}

export { TrimmerCallbacks };
export default Trimmer;