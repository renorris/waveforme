// Waveforme WaveformControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import { Container, Row, Col } from 'react-bootstrap';
import Modal from 'react-bootstrap/esm/Modal';
import { Pause, PlayFill, Scissors, ArrowCounterclockwise } from 'react-bootstrap-icons';

import { WaveformOptions } from '../Waveform';
import Stack from 'react-bootstrap/esm/Stack';

interface WaveformControlsCallbacks {
    playButtonClickCallback: () => void,
    normalizeButtonClickCallback: () => void,
    barHeightRangeChangeCallback: (value: number) => void,
    barWidthRangeChangeCallback: (value: number) => void,
    barGapRangeChangeCallback: (value: number) => void,
    trimCallback: () => void,
    revertButtonCallback: () => void,
}

function WaveformControls(props: WaveformControlsCallbacks & { waveformOptions: WaveformOptions }) {

    const [showRevertModal, setShowRevertModal] = useState<boolean>(false);

    // Revert button handler
    const revertButtonHandler = () => {
        setShowRevertModal(false);
        props.revertButtonCallback();
    }

    return (
        <Container fluid className='justify-content-center align-items-center'>
            <Row className='justify-content-center mt-1'>
                <Col xs='4' sm='3' className='d-flex justify-content-center ps-0 pe-1'>
                    <Button style={{ width: '100%' }} onClick={() => setShowRevertModal(true)} variant='warning'>
                        <ArrowCounterclockwise size={25} />
                    </Button>
                </Col>

                <Col xs='4' sm='3' className='d-flex justify-content-center px-1'>
                    <Button style={{ width: '100%' }} onClick={props.trimCallback} variant='primary'>
                        <Scissors size={25} style={{ transform: 'rotate(90deg)' }} />
                    </Button>
                </Col>

                <Col xs='4' sm='3' className='d-flex justify-content-center pe-0 ps-1'>
                    <Button style={{ width: '100%' }} onClick={props.playButtonClickCallback} variant={props.waveformOptions.playing ? 'danger' : 'success'}>
                        {props.waveformOptions.playing ? <Pause size={25} /> : <PlayFill size={25} />}
                    </Button>
                </Col>
            </Row>

            <Row className='mt-4'>
                <Col xs='4' className='gap-1 p-0'>
                    <Button
                        variant={props.waveformOptions.normalize ? 'primary' : 'outline-danger'}
                        onClick={props.normalizeButtonClickCallback}
                    >
                        Normalize
                    </Button>
                </Col>

                <Col xs='8' className='gap-1 p-0'>
                    <div className={props.waveformOptions.normalize ? 'fw-lighter' : ''}>
                        {props.waveformOptions.normalize ? 'Normalized' : 'Intensity'}
                    </div>
                    <FormRange
                        id='barHeightRange'
                        min='0.1'
                        max='5'
                        defaultValue={props.waveformOptions.barHeight}
                        step='0.01'
                        disabled={props.waveformOptions.normalize}
                        onChange={event => props.barHeightRangeChangeCallback(parseFloat(event.target.value))}
                    />
                    <div>Width</div>
                    <FormRange
                        id='barWidthRange'
                        min='1'
                        max='15'
                        defaultValue={props.waveformOptions.barWidth}
                        step='0.01'
                        onChange={event => props.barWidthRangeChangeCallback(parseFloat(event.target.value))}
                    />
                    <div>Spacing</div>
                    <FormRange
                        id='barGapRange'
                        min='1'
                        max='10'
                        defaultValue={props.waveformOptions.barGap}
                        step='0.01'
                        onChange={event => props.barGapRangeChangeCallback(parseFloat(event.target.value))}
                    />
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

export { WaveformControlsCallbacks };
export default WaveformControls;