// Waveforme WaveformControls.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState } from 'react';
import { Container, Row, Col, Modal, Button, Stack } from 'react-bootstrap';
import FormRange from 'react-bootstrap/esm/FormRange';
import { ArrowCounterclockwise, Scissors, Pause, PlayFill } from 'react-bootstrap-icons';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { switchPage } from './designerSlice';
import { playPause, setBarGap, setBarHeight, setBarWidth, toggleAudioNormalization, revertTrimmedSelectionToOriginal } from './waveformSlice';

export default function WaveformControls() {

    const dispatch = useAppDispatch();
    const playbackDirective = useAppSelector(state => state.waveform.playbackDirective);
    const waveformRenderOptions = useAppSelector(state => state.waveform.waveformRenderOptions);

    const [showRevertModal, setShowRevertModal] = useState<boolean>(false);

    const handleModalRevertButtonClick = () => {
        setShowRevertModal(false);
        dispatch(revertTrimmedSelectionToOriginal())
    }

    

    return (
        <Container className='justify-content-center align-items-center'>
            <Row className='justify-content-center mt-1'>
                <Col xs='4' sm='3' className='d-flex justify-content-center ps-2 pe-1'>
                    <Button style={{ width: '100%' }} onClick={() => setShowRevertModal(true)} variant='warning'>
                        <ArrowCounterclockwise size={25} />
                    </Button>
                </Col>

                <Col xs='4' sm='3' className='d-flex justify-content-center px-1'>
                    <Button style={{ width: '100%' }} onClick={() => dispatch(switchPage('trimmer'))} variant='primary'>
                        <Scissors size={25} style={{ transform: 'rotate(90deg)' }} />
                    </Button>
                </Col>

                <Col xs='4' sm='3' className='d-flex justify-content-center ps-1 pe-2'>
                    <Button style={{ width: '100%' }} onClick={() => dispatch(playPause())} variant={playbackDirective === 'play' ? 'danger' : 'success'}>
                        {playbackDirective === 'play' ? <Pause size={25} /> : <PlayFill size={25} />}
                    </Button>
                </Col>
            </Row>

            <Row className='mt-4'>
                <Col xs='4' className='gap-1'>
                    <Button
                        variant={waveformRenderOptions.audioNormalization ? 'primary' : 'outline-danger'}
                        onClick={() => dispatch(toggleAudioNormalization())}
                    >
                        Normalize
                    </Button>
                </Col>

                <Col xs='8' className='gap-1'>
                    <div className={waveformRenderOptions.audioNormalization ? 'fw-lighter' : ''}>
                        {waveformRenderOptions.audioNormalization ? 'Normalized' : 'Intensity'}
                    </div>
                    <FormRange
                        id='barHeightRange'
                        min='0.1'
                        max='5'
                        defaultValue={waveformRenderOptions.barHeight}
                        step='0.01'
                        disabled={waveformRenderOptions.audioNormalization}
                        onChange={event => dispatch(setBarHeight(parseFloat(event.target.value)))}
                    />
                    <div>Width</div>
                    <FormRange
                        id='barWidthRange'
                        min='1'
                        max='15'
                        defaultValue={waveformRenderOptions.barWidth}
                        step='0.01'
                        onChange={event => dispatch(setBarWidth(parseFloat(event.target.value)))}
                    />
                    <div>Spacing</div>
                    <FormRange
                        id='barGapRange'
                        min='1'
                        max='10'
                        defaultValue={waveformRenderOptions.barGap}
                        step='0.01'
                        onChange={event => dispatch(setBarGap(parseFloat(event.target.value)))}
                    />
                </Col>
            </Row>

            <Row className='mt-4'>
                <Col className='d-flex justify-content-end'>
                    <Button onClick={() => dispatch(switchPage('exporter'))}>
                        Export
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
                    <Button variant='warning' onClick={() => handleModalRevertButtonClick()}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    )

}