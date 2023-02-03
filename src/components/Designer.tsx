// Waveforme Designer.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React from 'react';

import { useAppSelector, useAppDispatch } from '../storeHooks';

import Uploader from './Uploader';
import Waveform from './Waveform';
import WaveformControls from './WaveformControls';

export default function Designer() {
    const dispatch = useAppDispatch();
    const activePage = useAppSelector(state => state.designer.activePage);
    const mp3URL = useAppSelector(state => state.designer.localOriginalMP3URL);

    return (
        <>
            <p>Active page - <span className='font-monospace'>{activePage}</span></p>
            { activePage === 'uploader' && 
                <Uploader />
            }
            { activePage === 'main' &&
                <>
                    <p>mp3 - <a href={mp3URL as string} target='_blank' className='font-monospace'>{mp3URL}</a></p>
                    <Waveform />
                    <WaveformControls />
                </>
            }
        </>
    );
}