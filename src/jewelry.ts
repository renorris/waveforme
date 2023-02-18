// Waveforme jewelry.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Hold data for jewelry pieces

interface PieceInfo {
    imgPath: string,
    imgPreviewPath: string,

    prettyName: string,

    // All values are in percent: relative to the image in imgPath
    waveformLeftOffset: number,
    waveformTopOffset: number,
    waveformRelativeWidth: number,
    waveformRelativeHeight: number,
    rotationDeg: number,

    waveformTargetResolution: {
        width: number,
        height: number,
    },
}

type PieceName = 'dogTag' | 'keychain' | 'heart1' | 'heart2';

const pieces: Record<PieceName, PieceInfo> = {
    'dogTag': {
        imgPath: '/jewelry/dog_tag-1024-469.jpg',
        imgPreviewPath: '/jewelry/dog_tag_preview.jpg',
        prettyName: 'Dog Tag',
        waveformLeftOffset: 0.45779,
        waveformTopOffset: 0.15444,
        waveformRelativeWidth: 0.47619,
        waveformRelativeHeight: 0.69413,
        rotationDeg: 0,
        waveformTargetResolution: {
            width: 1200,
            height: 800,
        },
    },
    'keychain': {
        imgPath: '/jewelry/keychain-2000-1000.jpg',
        imgPreviewPath: '/jewelry/keychain_preview.jpg',
        prettyName: 'Keychain',
        waveformLeftOffset: 0.5495,
        waveformTopOffset: 0.287,
        waveformRelativeWidth: 0.4245,
        waveformRelativeHeight: 0.426,
        rotationDeg: 0,
        waveformTargetResolution: {
            width: 1280,
            height: 640,
        },
    },
    'heart1': {
        imgPath: '/jewelry/heart.jpg',
        imgPreviewPath: '/jewelry/heart1_preview.jpg',
        prettyName: 'Heart - Variant One',
        waveformLeftOffset: 0.677272,
        waveformTopOffset: 0.067272,
        waveformRelativeWidth: 0.375455,
        waveformRelativeHeight: 0.375455,
        rotationDeg: 53,
        waveformTargetResolution: {
            width: 1280,
            height: 640,
        },
    },
    'heart2': {
        imgPath: '/jewelry/heart.jpg',
        imgPreviewPath: '/jewelry/heart2_preview.jpg',
        prettyName: 'Heart - Variant Two',
        waveformLeftOffset: 0.524545,
        waveformTopOffset: 0.745454,
        waveformRelativeWidth: 0.375455,
        waveformRelativeHeight: 0.375455,
        rotationDeg: -53,
        waveformTargetResolution: {
            width: 1280,
            height: 640,
        },
    },
}

const percentify = (decimal: number): string => {
    return `${decimal * 100}%`;
}

export { pieces, percentify, PieceName, PieceInfo };