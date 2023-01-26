// Waveforme TrimmerControls index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import { InfoCircle } from 'react-bootstrap-icons';

interface TrimmerControlsCallbacks {
    trimButtonCallback: () => void,
}

function TrimmerControls(props: TrimmerControlsCallbacks) {
    return (
        <Container
            fluid
            className='d-flex flex-column justify-content-center align-items-center gap-2 p-0'
        >
            <h3>Select a portion to trim</h3>
            <Container className='fw-light d-flex flex-row justify-content-start align-items-center p-0 gap-2'>
                <InfoCircle size={15} />
                You can always trim again.
            </Container>
            <Button
                variant='primary'
                size='lg'
                onClick={() => props.trimButtonCallback() }
            >
                Trim
            </Button>
        </Container>
    )
}

export { TrimmerControlsCallbacks };
export default TrimmerControls;
