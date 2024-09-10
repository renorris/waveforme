// Waveforme config.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Provide app configuration for deployment

import manifest from '../public/manifest.json';

const isLocal = !!process.env.IS_OFFLINE;

const config = {
    app: {
        TITLE: manifest.short_name,
        THEME_COLOR: manifest.theme_color,
        URL: isLocal ? `http://localhost:3000` : `insert_cloudfront_url`,
        DIST_URL: isLocal ? `http://localhost:8080` : `insert_cloudfront_url`,
        PUBLIC_URL: isLocal ? `http://localhost:8080` : `insert_cloudfront_url`,
    },
}

export type Config = typeof config;
export default config;