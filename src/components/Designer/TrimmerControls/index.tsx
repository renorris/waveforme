// Waveforme TrimmerControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import FormRange from 'react-bootstrap/esm/FormRange'
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';

interface TrimmerControlsCallbacks {
    trimButtonCallback: (val1: number, val2: number) => void,
}

function TrimmerControls(props: TrimmerControlsCallbacks) {

    const range1 = useRef<HTMLInputElement>(null);
    const range2 = useRef<HTMLInputElement>(null);

    return (
        <Container
            fluid
            className='d-flex flex-column justify-content-center align-items-center'
        >
            <h3>Select a portion to trim</h3>
            <FormRange
                id='range-1'
                ref={range1}
                min='0'
                max='1'
                defaultValue='0.3'
                step='0.001'
            />
            <FormRange
                id='range-2'
                ref={range2}
                min='0'
                max='1'
                defaultValue='0.7'
                step='0.001'
            />
            <Button
                variant='primary'
                onClick={event => props.trimButtonCallback(parseFloat(range1.current!.value), parseFloat(range2.current!.value))}
            >
                Trim
            </Button>
        </Container>
    )
}

export { TrimmerControlsCallbacks };
export default TrimmerControls;
