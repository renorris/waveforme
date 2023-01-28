// Waveforme ProductPreview index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React from 'react';

interface ProductPreviewProps {
    audioMp3: Blob,
    waveformImage: Blob,
}

function ProductPreview(props: ProductPreviewProps) {

    return (
        <>
            <h1>ProductPreview:</h1>
            <img src={URL.createObjectURL(props.waveformImage)} />
            <audio src={URL.createObjectURL(props.audioMp3)} />
        </>
    )

}