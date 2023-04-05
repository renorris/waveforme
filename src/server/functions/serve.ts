// Waveforme serve.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Main Lambda handler serving SSR 

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';

const serve = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        // Redirect to /app if calling /
        if (event.rawPath === '/') {
            return {
                statusCode: 308,
                headers: {
                    'Content-Type': 'text/html',
                    'Location': '/app',
                },
                body: '<html><body></body></html>',
            }
        }

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
        console.error(err);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/html',
            },
            body: `<html><body>Internal server error</body></html>`,
        }
    }
}

export default serve;