// Waveforme WaveformControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';

import { WaveformOptions } from '../Waveform';

interface WaveformControlsCallbacks {
    playButtonClickCallback: () => void,
    normalizeButtonClickCallback: () => void,
    barHeightRangeChangeCallback: (value: number) => void,
    barWidthRangeChangeCallback: (value: number) => void,
    barGapRangeChangeCallback: (value: number) => void,
}

function WaveformControls(props: WaveformControlsCallbacks & { waveformOptions: WaveformOptions }) {
    return (
        <Container
            id='mainControlsContainer'
            className='d-flex flex-column justify-content-center align-items-center'
        >

            <Container
                id='playPauseRowContainer'
                className='d-flex flex-row gap-2 justify-content-center align-items-center mt-2'>
                <Button
                    onClick={props.playButtonClickCallback}
                    variant={props.waveformOptions.playing ? 'danger' : 'success'}
                >
                    {props.waveformOptions.playing ? 'Pause' : 'Play'}
                </Button>
            </Container>

            <Container
                id='waveformControlsContainer'
                className='d-flex flex-row justify-content-center align-items-center mt-2'
            >

                <Container
                    id='leftButtonsContainer'
                    className='d-flex flex-column gap-2 justify-content-start align-items-start p-0'>
                    <Button variant='outline-secondary'>Button 1</Button>
                    <Button variant='outline-secondary'>Button 2</Button>
                    <Button variant='outline-secondary'>Button 3</Button>
                </Container>

                <Container
                    id='rangeSelectorContainer'
                    className='d-flex flex-column gap-2 justify-content-start align-items-start p-0'
                >
                    <div>
                        Intensity
                        <Button
                            className='ms-2 btn-sm'
                            variant={props.waveformOptions.normalize ? 'info' : 'outline-secondary'}
                            onClick={props.normalizeButtonClickCallback}
                        >
                            {props.waveformOptions.normalize ? 'Normalized' : 'Normalize'}
                        </Button>
                    </div>
                    <FormRange
                        id='barHeightRange'
                        min='0.1'
                        max='5'
                        defaultValue='1'
                        step='0.01'
                        disabled={props.waveformOptions.normalize}
                        onChange={event => props.barHeightRangeChangeCallback(parseFloat(event.target.value))}
                    />
                    <div>Width</div>
                    <FormRange
                        id='barWidthRange'
                        min='1'
                        max='15'
                        defaultValue='1'
                        step='0.01'
                        onChange={event => props.barWidthRangeChangeCallback(parseFloat(event.target.value))}
                    />
                    <div>Spacing</div>
                    <FormRange
                        id='barGapRange'
                        min='1'
                        max='10'
                        defaultValue='1'
                        step='0.01'
                        onChange={event => props.barGapRangeChangeCallback(parseFloat(event.target.value))}
                    />
                </Container>
            </Container>
        </Container>
    )
}

export { WaveformControlsCallbacks };
export default WaveformControls;