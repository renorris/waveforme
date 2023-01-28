// Waveforme Designer index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Container from 'react-bootstrap/esm/Container';
import { RegionParams } from 'wavesurfer.js/src/plugin/regions';

import Waveform from './Waveform';
import AudioUploader from './AudioUploader';
import WaveformControls from './WaveformControls';
import Trimmer from './Trimmer';
import TrimmerControls from './TrimmerControls';
import { Clamp } from './util';
import { useAppSelector, useAppDispatch } from '../../state/hooks';
import { DesignerTool, switchActiveTool, setAudioBufferData, setOrigMp3File, AudioBufferData } from './designerSlice';



function Designer() {

    /*
        REDUX
    */

    const activeTool = useAppSelector((state) => state.designer.activeTool);
    const dispatch = useAppDispatch();


    
    /*
        AUDIO INITIALIZATION
    */

    useEffect(() => {
        // Set an empty audioBuffer to the store
        const audioBuffer = new AudioBuffer({ length: 1, sampleRate: 44100 });

        const audioBufferData: AudioBufferData = {
            channelData: audioBuffer.getChannelData(0),
            frameCount: audioBuffer.length,
        }

        dispatch(setAudioBufferData(audioBufferData));
    }, []);



    /*
        AUDIO UPLOADER (Moved to redux, logic moved to AudioUploader)
    */



    /*
        WAVEFORM reduxified
    */



    /*
        TRIMMER WAVEFORM INTERACTION CALLBACKS
    */



    /*
        TRIMMER CONTROLS
        Moved to redux directly in trim controls
    */



    /*
        DEV
    */

    useEffect(() => {
        //setShouldDisplayWaveform(true);
        //setIsTrimmerEnabled(true);
    }, []);

    return (
        <Container
            className='d-flex flex-column justify-content-center align-items-center mt-2'
            style={{ maxWidth: '640px' }}
        >
            {activeTool === DesignerTool.UPLOADER &&
                <AudioUploader />
            }
            {activeTool === DesignerTool.MAIN &&
                <>
                    <Waveform />
                    <WaveformControls />
                </>
            }
            {activeTool === DesignerTool.TRIMMER &&
                <>
                    <Trimmer />
                    <Waveform />
                    <TrimmerControls />
                </>
            }
        </Container>
    );
}

export default Designer;