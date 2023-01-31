// Waveforme WaveformControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import { Container, Row, Col } from 'react-bootstrap';
import Modal from 'react-bootstrap/esm/Modal';
import { Pause, PlayFill, Scissors, ArrowCounterclockwise, Check2Square, CheckCircleFill, ArrowRight } from 'react-bootstrap-icons';
import Stack from 'react-bootstrap/esm/Stack';

import { useAppSelector, useAppDispatch } from '../../../state/hooks';
import { seekTo, pause, play, playPause, AudioBufferData, setAudioBufferData, setOrigMp3File, switchActiveTool, DesignerTool, toggleNormalize, setBarHeight, setBarWidth, setBarGap } from '../designerSlice';
import { useSelector } from 'react-redux';

function WaveformControls() {

    const [showRevertModal, setShowRevertModal] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const playing = useAppSelector(state => state.designer.playing);
    const normalize = useAppSelector(state => state.designer.normalize);
    const barHeight = useAppSelector(state => state.designer.barHeight);
    const barWidth = useAppSelector(state => state.designer.barWidth);
    const barGap = useAppSelector(state => state.designer.barGap);
    const origMp3File = useAppSelector(state => state.designer.origMp3File);

    // Revert button handler
    const revertButtonHandler = async () => {
        setShowRevertModal(false);

        console.log('Encoding complete... setting state');

        // Decode mp3 into AudioBuffer & re-set to redux state
        const audioContext = new OfflineAudioContext(1, 128, 44100);
        const audioBuffer = await audioContext.decodeAudioData(origMp3File.buffer.slice(0));
        const channelData = audioBuffer.getChannelData(0);

        const audioBufferData: AudioBufferData = {
            channelData: channelData,
            frameCount: audioBuffer.length,
        }
        dispatch(setAudioBufferData(audioBufferData));
    }

    return (
        <Container fluid>
            <Row className='justify-content-center align-items-center mt-1'>
                <Col xs='4' className='d-flex justify-content-center ps-0 pe-1'>
                    <Button style={{ width: '100%' }} onClick={() => setShowRevertModal(true)} variant='warning'>
                        <ArrowCounterclockwise size={25} />
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center px-1'>
                    <Button style={{ width: '100%' }} onClick={() => dispatch(switchActiveTool(DesignerTool.TRIMMER))} variant='primary'>
                        <Scissors size={25} style={{ transform: 'rotate(90deg)' }} />
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center pe-0 ps-1'>
                    <Button style={{ width: '100%' }} onClick={() => dispatch(playPause())} variant={playing ? 'danger' : 'success'}>
                        {playing ? <Pause size={25} /> : <PlayFill size={25} />}
                    </Button>
                </Col>
            </Row>

            <Row className='justify-content-center align-items-center mt-4'>
                <Col xs='4' className='gap-1 p-0'>
                    <Button
                        variant={normalize ? 'primary' : 'outline-danger'}
                        onClick={() => dispatch(toggleNormalize())}
                    >
                        Normalize
                    </Button>
                </Col>

                <Col xs='8' className='gap-1 p-0'>
                    <div className={normalize ? 'fw-lighter' : ''}>
                        {normalize ? 'Normalized' : 'Intensity'}
                    </div>
                    <FormRange
                        id='barHeightRange'
                        min='0.1'
                        max='5'
                        defaultValue={barHeight}
                        step='0.01'
                        disabled={normalize}
                        onChange={event => dispatch(setBarHeight(parseFloat(event.target.value)))}
                    />
                    <div>Width</div>
                    <FormRange
                        id='barWidthRange'
                        min='1'
                        max='15'
                        defaultValue={barWidth}
                        step='0.01'
                        onChange={event => dispatch(setBarWidth(parseFloat(event.target.value)))}
                    />
                    <div>Spacing</div>
                    <FormRange
                        id='barGapRange'
                        min='1'
                        max='10'
                        defaultValue={barGap}
                        step='0.01'
                        onChange={event => dispatch(setBarGap(parseFloat(event.target.value)))}
                    />
                </Col>
            </Row>

            <Row className='justify-content-end align-items-center mt-3'>
                <Col xs='4' className='d-flex justify-content-center align-items-center p-0'>
                    <Button
                        style={{ width: '100%' }}
                        variant={'outline-success'}
                    >
                        <CheckCircleFill size={25} /> <ArrowRight size={25} />
                    </Button>
                </Col>
            </Row>

            <Modal
                show={showRevertModal}
                onHide={() => setShowRevertModal(false)}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className='text-center'>Revert Audio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Stack className='text-center'>
                        <div>Are you sure?</div>
                        <div>This will revert your audio to its original state.</div>
                    </Stack>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='success' onClick={() => setShowRevertModal(false)}>
                        Cancel
                    </Button>
                    <Button variant='warning' onClick={() => revertButtonHandler()}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    )
}

export default WaveformControls;