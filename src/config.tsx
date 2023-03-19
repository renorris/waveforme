// Waveforme config.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Provide app configuration for deployment

import manifest from '../public/manifest.json';

const isLocal = !!process.env.IS_OFFLINE;

const config = {
    app: {
        TITLE: manifest.short_name,
        THEME_COLOR: manifest.theme_color,
        URL: isLocal ? `http://localhost:3000` : `https://dev.waveforme.net`,
        DIST_URL: isLocal ? `http://localhost:8080` : `https://dev.waveforme.net`,
        PUBLIC_URL: isLocal ? `http://localhost:8080` : `https://dev.waveforme.net`,
    },
}

export type Config = typeof config;
export default config;