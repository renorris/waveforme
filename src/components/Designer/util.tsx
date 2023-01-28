import { RegionParams } from "wavesurfer.js/src/plugin/regions";

const clamp = (num: number, min: number, max: number) => {
    return num <= min
        ? min
        : num >= max
            ? max
            : num
}

// Trimmer region generator helper
const generateTrimmerRegion = (start: number, end: number): RegionParams => {
    return {
        start: start,
        end: end,
        loop: false,
        drag: false,
        resize: false,
        color: '#30C5FF80',
        preventContextMenu: true,
        showTooltip: false,
    }
}

export { clamp as Clamp };
export { generateTrimmerRegion };