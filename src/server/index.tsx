// Waveforme index.tsx (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Index for SSR. Renders site based off ConfigContext and stats.json

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { APIGatewayEvent } from 'aws-lambda';
import { Stats } from '../types';

// Import main App
import App from '../App';

// Import config context component & assoc. config object
import ConfigContext from '../components/ConfigContext';
import config from '../config';

// Import HTML template
import html from './html';

async function render(event: APIGatewayEvent): Promise<string> {
    
    const stats = (await import("../../dist/stats.json")) as unknown as Stats;

    const content = renderToString(
        <ConfigContext.Provider value={config}>
            <App /> 
        </ConfigContext.Provider>
    );

    return html(content, stats);
    
}

export default render;