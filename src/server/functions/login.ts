// Waveforme login.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify & sign JWTs for session auth

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHash } from 'node:crypto';
import { LoginRequest, LoginResponse } from 'src/interfaces/loginInterfaces';
import { getAccount } from './util/getAccount';
import { signClaims } from './util/signClaims';
import { validateLoginRequest } from './util/validators';

const login = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('login is running');

        // Verify login info is valid
        const reqObj: LoginRequest = JSON.parse(event.body!);
        if (!validateLoginRequest(reqObj)) {
            const resObj: LoginResponse = {
                error: true,
                msg: 'Bad request',
                token: undefined
            }
    
            return {statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
        }

        const acc = await getAccount('waveforme_users', 'us-east-2', reqObj.email);
        if (acc.length === 0 || !(createHash('sha256').update(reqObj.password, 'utf-8').digest('hex') === acc[0].password)) {
            const resObj: LoginResponse = {
                error: true,
                msg: 'Invalid login info',
                token: undefined
            }
    
            return {statusCode: 401, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
        }
        
        const claims = {
            email: acc[0].email,
            firstName: acc[0].firstName,
            lastName: acc[0].lastName
        }
        const jwt = await signClaims(claims, reqObj.rememberMe ? '30d' : '24h');

        const resObj: LoginResponse = {
            error: false,
            msg: 'OK',
            token: jwt
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resObj),
        }
    }
    
    catch (e) {
        console.error(`Exception thrown in login:\n${e}`);
        const resObj: LoginResponse = {
            error: true,
            msg: 'Internal server error',
            token: undefined
        }
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resObj),
        }
    }
}

export default login;