// Waveforme authHandler.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Handle all server auth REST calls

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { AuthResponse } from './authResponse';
import { AuthRequestData, BaseAuthRequest, CreateAccountRequest, CreateAccountRequestData, LoginRequest, LoginRequestData } from './authRequest';

const authHandler = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        let authRequest: BaseAuthRequest<AuthRequestData>;
        const bodyObj = JSON.parse(event.body!);

        switch (event.rawPath) {
            case '/rest/auth/login':
                authRequest = new LoginRequest(bodyObj as LoginRequestData);
                break;
            case '/rest/auth/createaccount':
                authRequest = new CreateAccountRequest(bodyObj as CreateAccountRequestData);
                break;
            default:
                return new AuthResponse(404, 'Not found', {}).serialize();
                break;
        }

        // Validate it validate it validate it
        if (!(await authRequest.validate())) {
            return new AuthResponse(400, 'Bad request', {}).serialize();
        }

        return authRequest.process();
    }

    catch (e) {
        console.error(`Exception thrown in authHandler:\n${e}`);
        return new AuthResponse(500, 'Request error', {}).serialize();
    }
}

export default authHandler;