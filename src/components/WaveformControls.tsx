// Waveforme WaveformControls.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useRef } from 'react';
import {
    Container,
    Row,
    Col,
    Modal,
    Button,
    Stack,
    DropdownButton,
    Dropdown,
    ButtonGroup
} from 'react-bootstrap';
import FormRange from 'react-bootstrap/esm/FormRange';
import {
    ArrowCounterclockwise,
    Scissors,
    Pause,
    PlayFill,
    Dash,
    Plus,
    Play,
    Stop,
    Soundwave,
    Flower1,
    BarChart,
    StopFill,
    PauseFill,
    VolumeUp,
    VolumeOff
} from 'react-bootstrap-icons';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { switchPage } from './designerSlice';
import {
    playPause,
    stop,
    setBarGap,
    incrementBarGap,
    setBarHeight,
    incrementBarHeight,
    setBarWidth,
    incrementBarWidth,
    toggleAudioNormalization,
    revertTrimmedSelectionToOriginal,
    swapMode,
    setMode
} from './waveformSlice';

export default function WaveformControls() {

    const dispatch = useAppDispatch();
    const playbackDirective = useAppSelector(state => state.waveform.playbackDirective);
    const waveformRenderOptions = useAppSelector(state => state.waveform.waveformRenderOptions);

    const [showRevertModal, setShowRevertModal] = useState<boolean>(false);

    const handleModalRevertButtonClick = () => {
        setShowRevertModal(false);
        dispatch(revertTrimmedSelectionToOriginal())
    }


    // Repeat callback helper
    const repeaterRef = useRef<NodeJS.Timer>();
    const startHoldDown = (callback: () => any) => {
        clearInterval(repeaterRef.current);
        repeaterRef.current = setInterval(callback, 50);
    }
    const stopHoldDown = () => {
        clearInterval(repeaterRef.current);
    }


    return (
        <Container style={{ maxWidth: '640px' }}>

            <Row className='justify-content-center align-items-center mt-2'>
                <Col xs='3' className='p-0' />

                <Col xs='4' className='px-2'>
                    <ButtonGroup style={{ width: '100%' }}>
                        <Button style={{ width: '100%' }} variant='outline-danger' onClick={() => dispatch(stop())}>
                            <StopFill size={25} />
                        </Button>
                        <Button style={{ width: '100%' }} variant='success' onClick={() => dispatch(playPause())}>
                            {playbackDirective === 'play' ? <PauseFill size={25} /> : <PlayFill size={25} />}
                        </Button>
                    </ButtonGroup>
                </Col>

                <Col xs='3' className='p-0' />
            </Row>

            <Row className='justify-content-center align-items-center border-bottom mt-3 pb-3 px-2'>
                <Col xs='4' className='d-flex justify-content-center p-0 pe-1'>
                    <Button style={{ width: '100%' }} onClick={() => setShowRevertModal(true)} variant='warning'>
                        <ArrowCounterclockwise size={25} /> Revert
                    </Button>
                </Col>

                <Col xs='4' className='d-flex justify-content-center px-1'>
                    <Dropdown style={{ width: '100%' }} align='start'>
                        <Dropdown.Toggle style={{ width: '100%' }} variant='outline-dark'>
                            <Soundwave size={25} />&nbsp;Style
                        </Dropdown.Toggle>

                        <Dropdown.Menu variant='outline-dark'>
                            <Dropdown.Item active={waveformRenderOptions.mode === 'bar'} onClick={() => dispatch(setMode('bar'))}><BarChart />&nbsp;Bars</Dropdown.Item>
                            <Dropdown.Item active={waveformRenderOptions.mode === 'wave'} onClick={() => dispatch(setMode('wave'))}><Flower1 />&nbsp;Organic</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>

                <Col xs='4' className='d-flex justify-content-center p-0 ps-1'>
                    <Button style={{ width: '100%' }} onClick={() => dispatch(switchPage('trimmer'))} variant='primary'>
                        <Scissors size={25} style={{ transform: 'rotate(90deg)' }} /> Trim
                    </Button>
                </Col>
            </Row>

            {waveformRenderOptions.mode === 'bar' &&
                <>
                    <Row className='justify-content-center align-items-top mt-3 px-2'>
                        <Col xs='3' className='d-flex justify-content-center p-0 pe-2'>
                            <ButtonGroup style={{ width: '100%' }} vertical>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarWidth(0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarWidth(0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                >
                                    <Plus size={25} />
                                </Button>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarWidth(-0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarWidth(-0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                >
                                    <Dash size={25} />
                                </Button>
                            </ButtonGroup>
                        </Col>

                        <Col xs='6' className='d-flex justify-content-center px-1'>
                            <ButtonGroup style={{ width: '100%' }}>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarHeight(-0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarHeight(-0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                    disabled={waveformRenderOptions.audioNormalization}
                                >
                                    <Dash size={25} />
                                </Button>
                                <Button variant={waveformRenderOptions.audioNormalization ? 'success' : 'outline-dark'}
                                    onClick={() => dispatch(toggleAudioNormalization())}
                                >
                                    {waveformRenderOptions.audioNormalization ? <VolumeUp size={25} /> : <VolumeOff size={25} />}
                                </Button>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarHeight(0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarHeight(0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                    disabled={waveformRenderOptions.audioNormalization}
                                >
                                    <Plus size={25} />
                                </Button>
                            </ButtonGroup>
                        </Col>

                        <Col xs='3' className='d-flex justify-content-center p-0 ps-2'>
                            <ButtonGroup style={{ width: '100%' }} vertical>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarGap(0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarGap(0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                >
                                    <Plus size={25} />
                                </Button>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarGap(-0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarGap(-0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                >
                                    <Dash size={25} />
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>

                    <Row className='justify-content-center align-items-center text-center mt-0'>
                        <Col xs='3' className='fw-normal p-0 ps-1'>
                            Width
                        </Col>
                        <Col xs='6' className='fw-normal px-1'>
                            { waveformRenderOptions.audioNormalization ? 'Auto' : 'Intensity' }
                        </Col>
                        <Col xs='3' className='fw-normal p-0 pe-1'>
                            Spacing
                        </Col>
                    </Row>
                </>
            }

            {waveformRenderOptions.mode === 'wave' &&
                <>
                    <Row className='justify-content-center align-items-center mt-3 px-2'>
                        <Col xs='3' />
                        <Col xs='6' className='d-flex justify-content-center px-1'>
                            <ButtonGroup style={{ width: '100%' }}>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarHeight(-0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarHeight(-0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                    disabled={waveformRenderOptions.audioNormalization}
                                >
                                    <Dash size={25} />
                                </Button>
                                <Button variant={waveformRenderOptions.audioNormalization ? 'success' : 'outline-dark'}
                                    onClick={() => dispatch(toggleAudioNormalization())}
                                >
                                    {waveformRenderOptions.audioNormalization ? <VolumeUp size={25} /> : <VolumeOff size={25} />}
                                </Button>
                                <Button variant='outline-dark'
                                    onMouseDown={() => startHoldDown(() => dispatch(incrementBarHeight(0.05)))}
                                    onTouchStart={() => startHoldDown(() => dispatch(incrementBarHeight(0.05)))}
                                    onMouseUp={stopHoldDown}
                                    onTouchEnd={stopHoldDown}
                                    disabled={waveformRenderOptions.audioNormalization}
                                >
                                    <Plus size={25} />
                                </Button>
                            </ButtonGroup>
                        </Col>

                        <Col xs='3' />
                    </Row>

                    <Row className='justify-content-center align-items-center text-center mt-0'>
                        <Col xs='4' />
                        <Col xs='4' className='fw-normal'>
                            {waveformRenderOptions.audioNormalization ? 'Auto' : 'Intensity'}
                        </Col>
                        <Col xs='4' />
                    </Row>
                </>
            }

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