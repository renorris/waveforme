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

    waveformTargetResolution: {
        width: number,
        height: number,
    },
}

type PieceName = 'dogTag' | 'keychain';

const pieces: Record<PieceName, PieceInfo> = {
    'dogTag': {
        imgPath: '/jewelry/dog_tag-1024-469.jpg',
        imgPreviewPath: '/jewelry/dog_tag-1024-469.jpg',
        prettyName: 'Dog Tag',
        waveformLeftOffset: 0.45779,
        waveformTopOffset: 0.15444,
        waveformRelativeWidth: 0.47619,
        waveformRelativeHeight: 0.69413,
        waveformTargetResolution: {
            width: 1200,
            height: 800,
        },
    },
    'keychain': {
        imgPath: '/jewelry/keychain-2000-1000.jpg',
        imgPreviewPath: '/jewelry/keychain-2000-1000.jpg',
        prettyName: 'Keychain',
        waveformLeftOffset: 0.5495,
        waveformTopOffset: 0.287,
        waveformRelativeWidth: 0.4245,
        waveformRelativeHeight: 0.426,
        waveformTargetResolution: {
            width: 1600,
            height: 800,
        },
    },
}

const percentify = (decimal: number): string => {
    return `${decimal * 100}%`;
}

export { pieces, percentify, PieceName, PieceInfo };