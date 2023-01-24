// Waveforme TrimmerControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import { InfoCircle, Check2Square, PlayFill, PauseFill, ArrowReturnLeft } from 'react-bootstrap-icons';

import { Row, Col } from 'react-bootstrap';
import { WaveformOptions } from '../Waveform';

interface TrimmerControlsProps {
    waveformOptions: WaveformOptions,
}

interface TrimmerControlsCallbacks {
    trimButtonCallback: () => void,

    // On play/pause button click
    playPauseButtonCallback: () => void,

    // On back button click
    backButtonCallback: () => void,
}

function TrimmerControls(props: TrimmerControlsCallbacks & TrimmerControlsProps) {

    return (
        <Container fluid>
            <Row className='justify-content-center align-items-center text-center mt-3'>
                <h5 className='m-0'>Drag the highlighted selection to trim</h5>
            </Row>

            <Row className='justify-content-center align-items-center mt-3'>
                <Col xs='4' sm='2' className='justify-content-start align-items-center pe-2 p-0'>
                    <Button
                        variant='danger'
                        onClick={() => props.backButtonCallback()}
                        style={{ width: '100%' }}
                    >
                        <ArrowReturnLeft size={25} />
                    </Button>
                </Col>

                <Col xs='4' sm='2' className='justify-content-center align-items-center p-0'>
                    <Button
                        variant={props.waveformOptions.playing ? 'danger' : 'outline-success'}
                        onClick={() => props.playPauseButtonCallback()}
                        style={{ width: '100%' }}
                    >
                        {props.waveformOptions.playing ? <PauseFill size={25} /> : <PlayFill size={25} />}
                    </Button>
                </Col>

                <Col xs='4' sm='2' className='justify-content-center align-items-center ps-2 p-0'>
                    <Button
                        variant='success'
                        style={{ width: '100%' }}
                        onClick={() => props.trimButtonCallback}
                    >
                        <Check2Square size={25} />
                    </Button>
                </Col>
            </Row>

            <Row className='justify-content-start align-items-center mt-3'>
                <Col xs='auto' className='d-flex align-items-center p-0'>
                    <InfoCircle size={15} />
                </Col>
                <Col xs='auto' className='fw-light ps-2'>
                    You can always trim again.
                </Col>
            </Row>
        </Container>
    )
}

export { TrimmerControlsCallbacks };
export default TrimmerControls;
