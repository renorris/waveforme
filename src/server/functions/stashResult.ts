// Waveforme stashResult.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Stash a designed waveform in Google Drive

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { google } from 'googleapis';

const stashResult = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('stashResult is running');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({status: 'foobar'}),
        }
    }
    
    catch (e) {
        console.error(`Exception thrown in stashResult:\n${e}`);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'Internal server error',
        }
    }
}

export default stashResult;