// Waveforme TrimmerControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import { ArrowReturnLeft, Check2Square, InfoCircle, Pause, PlayFill, Scissors, StopFill } from 'react-bootstrap-icons';
import { Col, Row } from 'react-bootstrap';

import { WaveformOptions } from '../Waveform';

interface TrimmerControlsCallbacks {
    trimButtonCallback: () => void,
    playButtonCallback: () => void,
    backButtonCallback: () => void,
}

interface TrimmerControlsProps {
    waveformOptions: WaveformOptions,
}

function TrimmerControls(props: TrimmerControlsCallbacks & TrimmerControlsProps) {
    return (
        <Container
            className='mt-2'
        >
            <Row className='text-center'>
                <h3>Drag selection to trim</h3>
            </Row>

            <Row className='mt-1'>
                <Col xs='4' className='d-flex justify-content-center align-items-center ps-0 pe-1'>
                    <Button
                        style={{ width: '100%' }}
                        variant='danger'
                        onClick={() => props.backButtonCallback()}
                    >
                    <ArrowReturnLeft size={25} />
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center align-items-center px-1'>
                    <Button
                        style={{ width: '100%' }}
                        variant={props.waveformOptions.playing ? 'danger' : 'outline-success'}
                        onClick={() => props.playButtonCallback()}
                    >
                    {props.waveformOptions.playing ? <StopFill size={25} /> : <PlayFill size={25} />}
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center align-items-center ps-1 pe-0'>
                    <Button
                        style={{ width: '100%' }}
                        variant='success'
                        onClick={() => props.trimButtonCallback()}
                    >
                    <Check2Square size={25} />
                    </Button>
                </Col>
            </Row>

            <Row className='justify-content-start align-items-center p-0 mt-2'>
                <Col xs='auto' className='p-0'>
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
