// Waveforme Waveform.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useRef, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { useAppSelector, useAppDispatch } from '../storeHooks';

export default function Waveform() {

    // Config redux
    const dispatch = useAppDispatch();
    const activePage = useAppSelector(state => state.designer.activePage);
    const localOriginalMP3URL = useAppSelector(state => state.designer.localOriginalMP3URL);
    const waveformRenderOptions = useAppSelector(state => state.waveform.waveformRenderOptions);

    // Define wavesurfer & assoc. container refs
    const waveformParentContainerRef = useRef<HTMLDivElement>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer>(null);

    // Define helper functions to mutate wavesurfer
    // ---

    // Full wavesurfer renderer. Will re-set wavesurfer params and call a drawBuffer.
    // 
    // Everything else that can be mutated directly on an existing wavesurfer object 
    // will have its own useEffect.
    useEffect(() => {
        const render = async () => {
            const WaveSurfer = (await import('wavesurfer.js')).default;
            const RegionsPlugin = (await import('wavesurfer.js/src/plugin/regions')).default;
        }
    }, [waveformRenderOptions]);

    return (
        <Container 
            fluid
            style={{ maxWidth: '640px', width: '100%' }}
        >
            <Row className='justify-content-center align-items-center'>
                <Col>
                    <div
                        id='waveformParent'
                        ref={waveformParentContainerRef}
                    >
                        <div
                            id='waveform'
                            ref={waveformContainerRef}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}