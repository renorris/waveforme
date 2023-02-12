// Waveforme Export.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';

import { Container, Row, Col, Stack, Button } from 'react-bootstrap';
import FileSaver from 'file-saver';
import { Download } from 'react-bootstrap-icons';
import audioBufferToWav from 'audiobuffer-to-wav';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { switchPage } from './designerSlice';
import { mp3UrlToAudioBuffer } from './designerUtil';

export default function Export() {

    const dispatch = useAppDispatch();

    // Hold states in refs for random access
    const localWaveformImageURL = useAppSelector(state => state.designer.localWaveformImageURL);
    const localWaveformImageURLRef = useRef<string>();
    useEffect(() => {
        localWaveformImageURLRef.current = localWaveformImageURL?.slice(0);
    }, [localWaveformImageURL]);

    const localOriginalMP3URL = useAppSelector(state => state.designer.localOriginalMP3URL);
    const localOriginalMP3URLRef = useRef<string>();
    useEffect(() => {
        localOriginalMP3URLRef.current = localOriginalMP3URL?.slice(0);
    }, [localOriginalMP3URL]);

    const activeTrimmedRegion = useAppSelector(state => state.waveform.activeTrimmedRegion);
    const activeTrimmedRegionRef = useRef<[number, number]>([0, 0]);
    useEffect(() => {
        activeTrimmedRegionRef.current = [...activeTrimmedRegion];
    }, [activeTrimmedRegion]);



    const saveWaveformImageURL = () => {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];
        const date = new Date(Date.now());

        const filename = `waveforme_export_${date.getDate().toString().padStart(2, '0')}${monthNames[date.getMonth()]}${date.getFullYear().toString()}-${date.getUTCHours().toString().padStart(2, '0')}${date.getUTCMinutes().toString().padStart(2, '0')}`;

        FileSaver.saveAs(localWaveformImageURLRef.current!, filename);
    }

    const saveTrimmedAudioAsMP3 = async () => {
        const audioBuf = await mp3UrlToAudioBuffer(localOriginalMP3URLRef.current!, activeTrimmedRegionRef.current[0], activeTrimmedRegionRef.current[1]);
        const wav = audioBufferToWav(audioBuf);
        const wavBlob = new Blob([wav], { type: 'audio/wav' });

        // Hacky fix for now to let React update DOM before we
        // sync the crap out of the browser with FFmpeg
        await new Promise(r => setTimeout(r, 100));

        // Dynamic load ffmpeg
        const ffmpeg = await import('ffmpeg.js/ffmpeg-mp4');

        // Perform ffmpeg encoding
        let error = false;
        const result = ffmpeg.default({
            MEMFS: [{
                name: 'trimmed_audio.wav',
                data: new Uint8Array(wav),
            }],
            arguments: ['-i', 'trimmed_audio.wav', '-vn', '-ac', '1', '-b:a', '128k', 'waveforme_output.mp3'],
        });

        if (error) {
            alert('Error encoding MP3!');
            return;
        }

        // Should be all good, extract the resulting file
        const resultFile = new File(
            [result.MEMFS[0].data],
            result.MEMFS[0].name,
            { type: 'audio/mp3' },
        );

        FileSaver.saveAs(resultFile, resultFile.name);
    }

    return (
        <Container style={{ maxWidth: '512px' }}>
            <Row className='mt-4'>
                <Col xs='9' className='d-flex justify-content-center align-items-center'>
                    <img
                        style={{ width: '95%' }}
                        src={localWaveformImageURL as string}
                        key={localWaveformImageURL as string}
                        alt='Exported waveform image'
                    />
                </Col>
                <Col xs='3' className='d-flex justify-content-center align-items-center'>
                    <Button variant='success' onClick={saveWaveformImageURL}>
                        <Download size={25} />
                    </Button>
                </Col>
            </Row>
            <Row className='mt-4'>
                <Col xs='auto' className='d-flex justify-content-center align-items-center'>
                    <Button variant='success' onClick={saveTrimmedAudioAsMP3}>
                        Encode Trimmed Audio & Download
                    </Button>
                </Col>
            </Row>
            <Row className='mt-4'>
                <Col className='d-flex justify-content-start align-items-center'>
                    <Button
                        variant='outline-danger'
                        onClick={() => dispatch(switchPage('main'))}
                    >
                        Back
                    </Button>
                </Col>
            </Row>
        </Container>
    );

}