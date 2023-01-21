// Waveforme TrimmerControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import { InfoCircle } from 'react-bootstrap-icons';

interface TrimmerControlsCallbacks {
    trimButtonCallback: (val1: number, val2: number) => void,
    
    // On selection. Once the mouse has been released. For playing audio preview snippet.
    selectionChangeCallback: (primaryVal: number, comparatorVal: number, isStart: boolean) => void,

    // On any change. For updating the region visualizer during selection.
    selectingCallback: (val1: number, val2: number) => void,
}

function TrimmerControls(props: TrimmerControlsCallbacks) {

    const range1 = useRef<HTMLInputElement>(null);
    const range2 = useRef<HTMLInputElement>(null);

    // Signal initial region to be drawn
    useEffect(() => {
        console.log('Signaling initial region draw');
        props.selectingCallback(parseFloat(range1.current!.value), parseFloat(range2.current!.value));
    }, []);

    const handleSelectionChange = (originIsRangeOne: boolean) => {
        let isStart = false;
        let primaryVal = range1.current!.value;
        let comparatorVal = range2.current!.value;
        if (originIsRangeOne) {
            if (range1.current!.value < range2.current!.value) {
                isStart = true;
            }
        }
        else {
            if (range1.current!.value > range2.current!.value) {
                isStart = true;
            }
            primaryVal = range2.current!.value;
            comparatorVal = range1.current!.value;
        }
        props.selectionChangeCallback(parseFloat(primaryVal), parseFloat(comparatorVal), isStart);
    }

    const handleSelecting = () => {
        props.selectingCallback(parseFloat(range1.current!.value), parseFloat(range2.current!.value));
    }

    return (
        <Container
            fluid
            className='d-flex flex-column justify-content-center align-items-center gap-2 p-0'
        >
            <h3>Select a portion to trim</h3>
            <FormRange
                id='range-1'
                ref={range1}
                min='0'
                max='1'
                defaultValue='0.3'
                step='0.001'
                onChange={handleSelecting}
                onMouseUp={() => handleSelectionChange(true)}
            />
            <FormRange
                id='range-2'
                ref={range2}
                min='0'
                max='1'
                defaultValue='0.7'
                step='0.001'
                onChange={handleSelecting}
                onMouseUp={() => handleSelectionChange(false)}
            />
            <Container className='fw-light d-flex flex-row justify-content-start align-items-center p-0 gap-2'>
                <InfoCircle size={15} />
                You can trim your audio again later.
            </Container>
            <Button
                variant='primary'
                size='lg'
                onClick={event => props.trimButtonCallback(parseFloat(range1.current!.value), parseFloat(range2.current!.value))}
            >
                Trim
            </Button>
        </Container>
    )
}

export { TrimmerControlsCallbacks };
export default TrimmerControls;
