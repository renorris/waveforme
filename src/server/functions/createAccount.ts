// Waveforme createAccount.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify account does not exist, then create a JWT & email to the email address for verification

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import * as jose from 'jose';
import { createHash } from 'node:crypto';
import { CreateAccountRequest, CreateAccountResponse } from 'src/interfaces/createAccountInterfaces';
import { verifyJWT } from './util/verifyJWT';
import { doesAccountExist } from './util/doesAccountExist';
import { signClaims } from './util/signClaims';
import { validateCreateAccountRequest } from './util/validators';
import { LoginResponse } from 'src/interfaces/loginInterfaces';

const createAccount = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('createAccount is running');

        const reqObj: CreateAccountRequest = JSON.parse(event.body!);
        if (!validateCreateAccountRequest(reqObj)) {
            const resObj: LoginResponse = {
                error: true,
                msg: 'Bad request',
                token: undefined
            }
    
            return {statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
        }

        // Verify that JWT is valid
        const isJWTValid = verifyJWT(reqObj.token);
        if (!isJWTValid) {
            const resObj: CreateAccountResponse = {
                error: true,
                msg: 'Invalid request',
                token: undefined
            }

            return {statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
        }

        // Extract email from token
        const decodedToken = jose.decodeJwt(reqObj.token);
        const tokenEmail = decodedToken.email as string;

        // Check if account already exists
        const alreadyExists = await doesAccountExist('waveforme_users', 'us-east-2', tokenEmail);

        if (alreadyExists) {
            const resObj: CreateAccountResponse = {
                error: true,
                msg: 'Account already exists',
                token: undefined
            }

            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resObj),
            }
        }

        // Create and sign a new session JWT so the user logs in
        const claims = {
            email: tokenEmail,
            firstName: reqObj.firstName,
            lastName: reqObj.lastName,
        }
        const jwt = await signClaims(claims, '24h');
        
        // Hash password & write account to database
        const pwdHash = createHash('sha256').update(reqObj.password, 'utf-8').digest('hex');
        const putItemCmdParams = {
            TableName: 'waveforme_users',
            Item: {
                'email': { 'S': tokenEmail },
                'password': { 'S': pwdHash },
                'firstName': { 'S': reqObj.firstName },
                'lastName': { 'S': reqObj.lastName },
            }
        }
        const putItemCmd = new PutItemCommand(putItemCmdParams);
        const dynamoDbClient = new DynamoDBClient({ region: 'us-east-2' });
        try {
            await dynamoDbClient.send(putItemCmd);
        }
        catch (err) {
            console.error('Error writing account into DB');
            console.error(err);
            return {statusCode: 500, headers: {'Content-Type': 'text/plain'}, body: 'Internal server error'}
        }
        
        // Gen response
        const resObj: CreateAccountResponse = {
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
        console.error(`Exception thrown in createAccount:\n${e}`);
        const resObj: CreateAccountResponse = {
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

export default createAccount;