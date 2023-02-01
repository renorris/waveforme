// Waveforme Designer.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React from 'react';

import { useAppSelector, useAppDispatch } from '../storeHooks';

import Uploader from './Uploader';

export default function Designer() {
    const dispatch = useAppDispatch();
    const activePage = useAppSelector(state => state.designer.activePage);
    const mp3URL = useAppSelector(state => state.designer.localOriginalMP3URL);

    return (
        <>
            <p>Active page: {activePage}</p>
            { activePage === 'uploader' && 
                <Uploader />
            }
            { activePage === 'main' &&
                <p>Main - URL: {mp3URL}</p>
            }
        </>
    );
}