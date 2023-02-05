// Waveforme Export.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState } from 'react';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { switchPage } from './designerSlice';
import { Container, Row, Col, Stack, Button } from 'react-bootstrap';
import FileSaver from 'file-saver';
import { Download } from 'react-bootstrap-icons';

export default function Export() {

    const dispatch = useAppDispatch();
    const localWaveformImageURL = useAppSelector(state => state.designer.localWaveformImageURL);

    const saveWaveformImageURL = () => {
        FileSaver.saveAs(localWaveformImageURL!, 'waveforme-export.jpg');
    }

    return (
        <Container style={{maxWidth: '512px'}}>
            <Row className='mt-4'>
                <Col xs='9' className='d-flex justify-content-center align-items-center'>
                    <img
                        style={{ width: '95%' }}
                        src={localWaveformImageURL as string}
                        key={localWaveformImageURL as string}
                        alt='Exported waveform image'
                    />
                </Col>
                <Col xs='3' className='d-flex justify-content-center align-items-center'>
                    <Button variant='success' onClick={saveWaveformImageURL}>
                        <Download size={25}/>
                    </Button>
                </Col>
            </Row>
            <Row className='mt-4'>
                <Col className='d-flex justify-content-start align-items-center'>
                    <Button 
                        variant='outline-danger'
                        onClick={() => dispatch(switchPage('main'))}
                    >
                        Back
                    </Button>
                </Col>
            </Row>
        </Container>
    );

}