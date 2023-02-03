// Waveforme waveformUtil.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

export function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(min, val), max);
}