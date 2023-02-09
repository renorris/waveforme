// Waveforme TrimmerControls.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Stack } from 'react-bootstrap';
import { ArrowReturnLeft, Check, Check2Square, ExclamationCircle, InfoCircle, PlayFill, StopFill } from 'react-bootstrap-icons';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import waveformSlice, { playPause, transferSelectedRegionToTrimmedRegion } from './waveformSlice';
import designerSlice, { switchPage } from './designerSlice';

export default function TrimmerControls() {

    const dispatch = useAppDispatch();
    const playbackDirective = useAppSelector(state => state.waveform.playbackDirective);
    const activeTrimmedRegionDuration = useAppSelector(state => state.waveform.activeTrimmedRegionDuration);
    const selectedRegion = useAppSelector(state => state.waveform.selectedRegion);

    // Keep a local state for selected duration
    const [selectedDuration, setSelectedDuration] = useState<number>(0);
    useEffect(() => {
        setSelectedDuration((selectedRegion[1] - selectedRegion[0]) * activeTrimmedRegionDuration);
    }, [selectedRegion, activeTrimmedRegionDuration]);

    const handleTrimButtonClick = () => {

        dispatch(transferSelectedRegionToTrimmedRegion());
        dispatch(switchPage('main'));
    }

    return (
        <Container
            className='mt-2'
        >
            <Row className='text-center'>
                <h3>Drag selection to trim</h3>
            </Row>

            <Row className='text-center'>
                <p>
                    <span>
                        Selected duration: {selectedDuration.toFixed(1)} seconds
                    </span>
                    <span className='ms-2'>
                        { selectedDuration > 1 ? <Check /> : <ExclamationCircle /> }
                    </span>
                </p>
            </Row>

            <Row className='mt-1'>
                <Col xs='4' className='d-flex justify-content-center align-items-center pe-2'>
                    <Button
                        style={{ width: '100%' }}
                        variant='danger'
                        onClick={() => dispatch(switchPage('main'))}
                    >
                        <ArrowReturnLeft size={25} />
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center align-items-center px-1'>
                    <Button
                        style={{ width: '100%' }}
                        variant={playbackDirective === 'play' ? 'danger' : 'outline-success'}
                        onClick={() => dispatch(playPause())}
                    >
                        {playbackDirective === 'play' ? <StopFill size={25} /> : <PlayFill size={25} />}
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center align-items-center ps-2'>
                    <Button
                        style={{ width: '100%' }}
                        disabled={selectedDuration < 1}
                        variant='success'
                        onClick={() => handleTrimButtonClick()}
                    >
                        { selectedDuration > 1 ? <Check2Square size={25} /> : 'Too short!'}
                    </Button>
                </Col>
            </Row>

            <Row className='justify-content-start align-items-center mt-2'>
                <Col xs='auto' className='py-0 pe-0'>
                    <InfoCircle size={15} />
                </Col>
                <Col xs='auto' className='fw-light ps-2'>
                    You can always trim again.
                </Col>
            </Row>
        </Container>
    );

}