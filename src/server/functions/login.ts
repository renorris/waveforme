// Waveforme login.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify & sign JWTs for session auth

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import * as argon2 from 'argon2';
import { LoginRequest, LoginResponse } from 'src/interfaces/loginInterfaces';
import { getAccount } from './util/getAccount';
import { signClaims } from './util/signClaims';

const login = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('login is running');

        // Verify login info is valid
        const reqObj: LoginRequest = JSON.parse(event.body!);

        const acc = await getAccount('waveforme_users', 'us-east-2', reqObj.email);
        if (acc.length === 0 || !(await argon2.verify(acc[0].password, reqObj.password))) {
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
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'Internal server error',
        }
    }
}

export default login;