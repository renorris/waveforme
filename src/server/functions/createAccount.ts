// Waveforme createAccount.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify account does not exist, then create a JWT & email to the email address for verification

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3'
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import * as jose from 'jose';
import * as argon2 from 'argon2';
import { CreateAccountRequest, CreateAccountResponse } from 'src/interfaces/createAccountInterfaces';

const createAccount = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('createAccount is running');

        const reqObj: CreateAccountRequest = JSON.parse(event.body!);
        const decodedToken = jose.decodeJwt(reqObj.token);
        const tokenEmail = decodedToken.email as string;

        // Check if account already exists
        const dynamoDbClient = new DynamoDBClient({ region: 'us-east-2' });
        const getItemCmdParams = {
            TableName: 'waveforme_users',
            Limit: 1,
            Key: {
                'email': { 'S': tokenEmail }
            }
        }
        const getItemCmd = new GetItemCommand(getItemCmdParams);
        const getItemDbRes = await dynamoDbClient.send(getItemCmd);
        
        if (getItemDbRes.Item) {
            // There's already a registered account. Silently just send back an OK for obfuscation.
            console.log('Already account exists. Deny account creation');
            const resObj: CreateAccountResponse = {
                error: true,
                msg: 'Account already exists',
                token: undefined
            }

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resObj),
            }
        }

        console.log('Creating verification JWT...');

        const claims = {
            email: tokenEmail,
            firstName: reqObj.firstName,
            lastName: reqObj.lastName,
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

        // Hash password
        const hash = await argon2.hash(reqObj.password);

        // Write new account to database
        const putItemCmdParams = {
            TableName: 'waveforme_users',
            Item: {
                'email': { 'S': tokenEmail },
                'password': { 'S': hash },
                'firstName': { 'S': reqObj.firstName },
                'lastName': { 'S': reqObj.lastName },
            }
        }
        const putItemCmd = new PutItemCommand(putItemCmdParams);
        const putItemDbRes = await dynamoDbClient.send(putItemCmd);

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
            body: JSON.stringify({foo: 'bar'}),
        }
    }
    
    catch (e) {
        console.error(`Exception thrown in createAccount:\n${e}`);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'Internal server error',
        }
    }
}

export default createAccount;