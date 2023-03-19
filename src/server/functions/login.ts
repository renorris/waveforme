// Waveforme login.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify & sign JWTs for session auth

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3'
import * as jose from 'jose';
import { LoginRequest, LoginResponse } from 'src/interfaces/loginInterfaces';

const login = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('login is running');

        // Verify login info is valid
        const reqObj: LoginRequest = JSON.parse(event.body!);
        
        const claims = {
            email: 'foo@bar.net',
            firstName: 'Foo',
            lastName: 'Bar',
        }


        // Create & sign JWT
        const s3 = new S3({
            region: 'us-east-2'
        });

        const params = {
            Bucket: 'waveforme-jwt',
            Key: 'key'
        }

        const s3Res = await s3.getObject(params);
        if (s3Res.Body === undefined) {
            console.error('Error with s3.getObject');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: 'Internal server error',
            }
        }

        const alg = 'RS256';
        const pkcs8 = await s3Res.Body!.transformToString('utf-8');
        const privateKey = await jose.importPKCS8(pkcs8, alg);
        const jwt = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('waveforme.net')
        .setExpirationTime('2h')
        .sign(privateKey);
        
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