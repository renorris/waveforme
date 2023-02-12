// Waveforme Uploader.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState } from 'react';

import { Button, Col, Container, Modal, Row, Stack } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { switchPage, setLocalOriginalMP3URL } from './designerSlice';
import { resetState, setPhase } from './uploaderSlice';
import { mp3UrlToAudioBuffer } from './designerUtil';

export default function Uploader() {
    const dispatch = useAppDispatch();
    const phase = useAppSelector(state => state.uploader.phase);

    // Hold local "having trouble?" modal visibility state
    const [showAudioTrimHelp, setShowAudioTrimHelp] = useState<boolean>(false);

    // Reset state on unmount
    useEffect(() => {
        return () => {
            dispatch(resetState());
        }
    }, []);

    // Touch wavesurfer and ffmpeg helper
    const touchLibraries = async () => {
        import('ffmpeg.js/ffmpeg-mp4');
        import('wavesurfer.js');
        import('wavesurfer.js/src/plugin/regions');
    }

    // Process input file, encode to audio/mp3, set window URL to store
    const processFile = async (file: File) => {
        console.log('[Uploader] Encoding audio...');

        // Set phase to processing since we're encoding the audio now
        dispatch(setPhase('processing'));

        // Hacky fix for now to let React update DOM before we
        // sync the crap out of the browser with FFmpeg
        await new Promise(r => setTimeout(r, 100));

        // Dynamic load ffmpeg
        const ffmpeg = await import('ffmpeg.js/ffmpeg-mp4');

        // Perform ffmpeg encoding
        let error = false;
        const result = ffmpeg.default({
            MEMFS: [{
                name: file.name,
                data: new Uint8Array(await file.arrayBuffer()),
            }],
            arguments: ['-i', file.name, '-vn', '-ac', '1', '-b:a', '128k', 'audio.mp3'],

            // For some reason stdout is going to stderr. Disable for now. TODO: WebWorkerify ffmpeg and make it awesome
            // print: (data) => { console.log(`FFmpeg STDOUT > ${data}`) },
            // printErr: (data) => {
            //     console.log(`FFmpeg STDERR > ${data}`);
            //     error = true;
            // },
        });

        // If an error was thrown in ffmpeg, set phase to error and return
        if (error) {
            dispatch(setPhase('error'));
            return;
        }

        // Should be all good, extract the resulting file
        const resultFile = new File(
            [result.MEMFS[0].data],
            result.MEMFS[0].name,
            { type: 'audio/mp3' },
        );

        // Create an object URL for our audiobuffer and original file and update our state to reflect them
        const localOriginalMP3URL = window.URL.createObjectURL(resultFile);
        dispatch(setLocalOriginalMP3URL(localOriginalMP3URL));

        // Switch active page to main
        dispatch(switchPage('main'));

        // DEBUG
        //const audioBufTest = await mp3UrlToAudioBuffer(localOriginalMP3URL, 0.3, 0.7);
        //console.log(`audioBufTest duration: ${audioBufTest.duration}`);
    }

    return (
        <>
            { phase === 'idle' &&
                <Container
                    className='justify-content-center align-items-center'
                    style={{ maxWidth: '640px' }}
                >
                    <Row className='text-center mt-2'><h2>Design your Waveforme</h2></Row>
                    <Row className='text-center mt-2'><h5>Choose an audio or video file</h5></Row>
                    <Row className='justify-content-center text-center px-2'>
                        <input
                            id='formFile'
                            className='form-control mt-3'
                            //style={{ maxWidth: '384px' }}
                            type='file'
                            accept='.mp4, .mov, .mp3, .m4a, .ogg, .wav'
                            onClick={touchLibraries}
                            onChange={(event) => processFile(event.target.files!.item(0)!)}
                        />
                    </Row>
                    <Row className='justify-content-start fw-lighter px-2'>Supported files: .mp4, .mov, .mp3, .m4a, .ogg, .wav</Row>
                    <Row className='mt-3'>
                        <Col className='d-flex justify-content-center align-items-center text-wrap fw-light'>
                            <InfoCircle height={'auto'} />
                            <Col className='ms-2'>
                                For the best experience possible, a <span className='fw-semibold'>five minute</span> upload limit is enforced.&nbsp;
                                <span
                                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                    onClick={() => setShowAudioTrimHelp(true)}
                                >
                                    Having trouble?
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row className='mt-1'>
                        <Col className='d-flex justify-content-center align-items-center text-wrap fw-light'>
                            <InfoCircle height={'auto'} />
                            <Col className='ms-2'>Shorter files produce a higher Waveforme resolution.</Col>
                        </Col>
                    </Row>

                    <Modal
                        show={showAudioTrimHelp}
                        onHide={() => setShowAudioTrimHelp(false)}
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className='text-center'>Trimming your file</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Stack className='text-center'>
                                <div>This pop-up will contain instructions on how to trim a file to meet the one minute upload limit.</div>
                            </Stack>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='success'
                            onClick={() => setShowAudioTrimHelp(false)}
                            >
                                Okay
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            }

            { phase === 'processing' &&
                <Container>
                    <Row className='justify-content-center align-items-center text-center mt-2'>
                        <h3>Extracting Audio...</h3>
                    </Row>
                    <Row className='justify-content-center align-items-center text-center text-wrap fw-light mt-2'>
                        <Col>
                            <InfoCircle height={25} className='me-1' viewBox='0 0 20 20' />
                            This might take a while depending on your file size and network speed
                        </Col>
                    </Row>
                </Container>
            }

            { phase === 'error' &&
                <h1>Uploader error!</h1>
            }
        </>
    );
}