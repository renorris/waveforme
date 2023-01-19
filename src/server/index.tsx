// Waveforme index.tsx (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Index for SSR. Renders site based off ConfigContext and stats.json

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { StaticRouter } from 'react-router-dom/server';
import SSRProvider from 'react-bootstrap/esm/SSRProvider';

import App from '../App';
import { Stats } from '../types';
import ConfigContext from '../components/ConfigContext';
import config from '../config';

// Import HTML template
import html from './html';

async function render(event: APIGatewayProxyEventV2): Promise<string> {

    const stats = (await import("../../dist/stats.json")) as unknown as Stats;
    //console.log(JSON.stringify(event));

    const content = renderToString(
        <SSRProvider>
            <ConfigContext.Provider value={config}>
                <StaticRouter basename='/' location={event.requestContext.http.path}>
                    <App />
                </StaticRouter>
            </ConfigContext.Provider>
        </SSRProvider>
    );

    return html(content, stats, config);
}

export default render;