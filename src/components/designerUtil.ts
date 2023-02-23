// Waveforme designerUtil.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

/**
 * Convert audio/webm URL to AudioBuffer with start and end positions.
 * 
 * @param {string} url URL containing audio/webm
 * @param {number} start Normalized (0-1) start position to trim (optional)
 * @param {number} end Normalized (0-1) end position to trim (optional)
 * 
 * @return {AudioBuffer} Newly built AudioBuffer
 */

const opusWebmUrlToAudioBuffer = async (url: string, start: number = 0, end: number = 1): Promise<AudioBuffer> => {

    // Fetch audio from URL
    const res = await fetch(url);
    const blob = await res.blob();

    // Throw error if type is not mp3
    if (blob.type !== 'audio/webm') {
        throw new Error('File type not audio/webm!');
    }

    // Decode audiobuffer from mp3
    let audioBuf: AudioBuffer;
    try {
        const audioCtx = new OfflineAudioContext(1, 128, 44100);
        audioBuf = await audioCtx.decodeAudioData(
            await blob.arrayBuffer()
        );
    }
    catch (err) {
        // Decode audio data threw an error
        throw new Error('Audio decoding failure');
    }

    // If we don't need to trim, return the buffer.
    if (start === 0 && end === 1) {
        return audioBuf;
    }

    // Trim the audiobuffer
    const duration = audioBuf.duration;
    const channels = audioBuf.numberOfChannels;
    const sampleRate = audioBuf.sampleRate;

    if (start < 0 || start > 1 || end < 0 || end > 1) {
        throw new Error('Start and stop values must be between 0 and 1!');
    }

    if (start > end) {
        throw new Error('Start value must be less than end value!');
    }

    const startOffset = sampleRate * (duration * start);
    const endOffset = sampleRate * (duration * end);
    const sampleCount = endOffset - startOffset;

    let newAudioBuf: AudioBuffer;
    try {
        const audioCtx = new OfflineAudioContext(1, 128, 44100);
        newAudioBuf = audioCtx.createBuffer(channels, sampleCount, sampleRate);
        const tempArray = new Float32Array(sampleCount);

        for (let channel = 0; channel < channels; channel++) {
            audioBuf.copyFromChannel(tempArray, channel, startOffset);
            newAudioBuf.copyToChannel(tempArray, channel, 0);
        }
    }
    catch (err) {
        throw new Error('Audio buffer trimming failed: ' + err);
    }

    return newAudioBuf;
}


export { opusWebmUrlToAudioBuffer as mp3UrlToAudioBuffer };