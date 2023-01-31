// Waveforme AudioUploader index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Modal, Row, Stack } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';

import { useAppDispatch } from '../../../state/hooks';
import { DesignerTool, switchActiveTool, setAudioBufferData, setOrigMp3File, AudioBufferData } from '../designerSlice';

function AudioUploader() {

    const [file, setFile] = useState<File | null>(null);
    const [isAudioExtracting, setIsAudioExtracting] = useState<boolean>(false);
    const [audioReady, setAudioReady] = useState<boolean>(false);
    const [showAudioTrimHelp, setShowAudioTrimHelp] = useState<boolean>(false);

    const dispatch = useAppDispatch();

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
                arguments: ["-i", file!.name, "-threads", "1", "-vn", "-ac", "1", "-b:a", "128k", "audio.mp3"],
                onExit: function (code) {
                    console.log("Process exited with code " + code);
                },
            });

            setAudioReady(true);
            setIsAudioExtracting(false);

            const resultFile = new File([result.MEMFS[0].data], result.MEMFS[0].name, { type: 'audio/mp3' });

            console.log('Encoding complete... setting state');
            // Decode mp3 into AudioBuffer
            const audioContext = new OfflineAudioContext(1, 128, 44100);
            const audioBuffer = await audioContext.decodeAudioData(await resultFile.arrayBuffer());
            const channelData = audioBuffer.getChannelData(0);

            const audioBufferData: AudioBufferData = {
                channelData: channelData,
                frameCount: audioBuffer.length,
            }
            dispatch(setAudioBufferData(audioBufferData));
            
            // Store original mp3 blob for a revert feature
            const rawFileArray = new Uint8Array(await resultFile.arrayBuffer());
            dispatch(setOrigMp3File(rawFileArray));

            // Switch to main designer tool
            dispatch(switchActiveTool(DesignerTool.MAIN));
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
                <Container className='justify-content-center align-items-center'>
                    <Col>
                        <Row className='text-center mt-2'>
                            <h2>Design your Waveforme</h2>
                        </Row>

                        <Row className='text-center mt-2'>
                            <h5>Choose an audio or video file</h5>
                        </Row>

                        <Row className='justify-content-center text-center'>
                            <input
                                id='formFile'
                                className='form-control mt-3'
                                //style={{ maxWidth: '384px' }}
                                type='file'
                                accept='audio/*,video/*'
                                onClick={event => { touchFfmpeg(); touchWavesurfer(); }}
                                onChange={(event) => handleFileUpload(event)}
                            />
                        </Row>

                        <Row className='justify-content-start fw-lighter'>
                            Supported files: .mp4, .mov, .mp3, .m4a, .ogg, .wav
                        </Row>

                        <Row className='mt-3'>
                            <Col className='d-flex justify-content-center align-items-center text-wrap fw-light p-0'>
                                <InfoCircle height={'auto'} />
                                <Col className='ms-2'>
                                    For the best experience possible, a <span className='fw-semibold'>one minute</span> upload limit is enforced.&nbsp;
                                    <span style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} onClick={() => setShowAudioTrimHelp(true)}>Need help?</span>
                                </Col>
                            </Col>
                        </Row>

                        <Row className='mt-1'>
                            <Col className='d-flex justify-content-center align-items-center text-wrap fw-light p-0'>
                                <InfoCircle height={'auto'} />
                                <Col className='ms-2'>Shorter files produce a higher Waveforme resolution.</Col>
                            </Col>
                        </Row>
                    </Col>

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
                            <Button variant='success' onClick={() => setShowAudioTrimHelp(false)}>
                                Okay
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </Container>
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

export default AudioUploader;