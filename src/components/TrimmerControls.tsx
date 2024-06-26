// Waveforme TrimmerControls.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState } from 'react';
import { Container, Row, Col, Modal, Button, Stack } from 'react-bootstrap';
import { ArrowReturnLeft, Check2Square, InfoCircle, PlayFill, StopFill } from 'react-bootstrap-icons';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { playPause, transferSelectedRegionToTrimmedRegion } from './waveformSlice';
import { switchPage } from './designerSlice';

export default function TrimmerControls() {

    const dispatch = useAppDispatch();
    const playbackDirective = useAppSelector(state => state.waveform.playbackDirective);

    const handleTrimButtonClick = () => {
        dispatch(switchPage('main'));
        dispatch(transferSelectedRegionToTrimmedRegion());
    }

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

                <Col xs='4' className='d-flex justify-content-center align-items-center ps-1 pe-0'>
                    <Button
                        style={{ width: '100%' }}
                        variant='success'
                        onClick={() => handleTrimButtonClick()}
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
    );

}