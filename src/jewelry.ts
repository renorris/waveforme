// Waveforme jewelry.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Hold data for jewelry pieces

interface PieceInfo {
    imgPath: string,

    // All values are in percent: relative to the image in imgPath
    waveformLeftOffset: number,
    waveformTopOffset: number,
    waveformWidth: number,
    waveformHeight: number,
}

type PieceName = 'dogTag';

const pieces: Record<PieceName, PieceInfo> = {
    'dogTag': {
        imgPath: '/jewelry/dog_tag-1024-469.jpg',
        waveformLeftOffset: 45.779,
        waveformTopOffset: 15.444,
        waveformWidth: 47.619,
        waveformHeight: 69.413,
    },
}

const percentify = (num: number): string => {
    return `${num}%`;
}

export { pieces, percentify, PieceName, PieceInfo };