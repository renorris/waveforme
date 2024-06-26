// Waveforme serve.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Main Lambda handler serving SSR 

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';

const serve = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        const render = (await import('../index')).default;
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
            },
            body: await render(event),
        }
    }
    catch(err) {
        // TODO: Make errors return more nicely
        console.error(err);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/html',
            },
            body: `<html><body>${err.toString()}</body></html>`,
        }
    }
}

export default serve;