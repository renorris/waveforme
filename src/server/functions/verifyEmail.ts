// Waveforme verifyEmail.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify account does not exist, then create a JWT & email to the email address for verification

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import * as jose from 'jose';
import { CreateAccountRequest, CreateAccountResponse } from 'src/interfaces/createAccountInterfaces';
import { VerifyEmailRequest, VerifyEmailResponse } from 'src/interfaces/verifyEmailInterfaces';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import config from '../../config';


const verifyEmail = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('verifyEmail is running');

        const reqObj: VerifyEmailRequest = JSON.parse(event.body!);

        // Check if account already exists
        const dynamoDbClient = new DynamoDBClient({ region: 'us-east-2' });
        const cmdParams = {
            TableName: 'waveforme_users',
            Limit: 1,
            Key: {
                'email': { 'S': reqObj.email }
            }
        }
        const command = new GetItemCommand(cmdParams);
        const dbRes = await dynamoDbClient.send(command);
        
        if (dbRes.Item) {
            // There's already a registered account.
            console.log('Already account exist');
            const resObj: VerifyEmailResponse = {
                error: true,
                msg: 'An account with this email already exists.'
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

        const claims = {email: reqObj.email};

        // Create & sign JWT
        const s3 = new S3({
            region: 'us-east-2'
        });
        const params = {
            Bucket: 'waveforme-jwt',
            Key: 'key'
        }
        const s3Res = await s3.getObject(params);
        if (s3Res.Body === undefined) throw new Error('Error with s3.getObject');
        const alg = 'RS256';
        const pkcs8 = await s3Res.Body!.transformToString('utf-8');
        const privateKey = await jose.importPKCS8(pkcs8, alg);
        const jwt = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('waveforme.net')
        .sign(privateKey);

        // Send the verification email
        const ses = new SESClient({ region: 'us-east-2' });
        const sesParams = {
            Destination: {
                ToAddresses: [reqObj.email]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `<p>Welcome to Waveforme! Please head <a href="${config.app.URL}/app/create-account?token=${encodeURIComponent(jwt)}&email=${encodeURIComponent(reqObj.email)}">here</a> to verify your email and continue the registration process.</p>`
                    }
                },
                Subject: {
                    Data: 'Waveforme Email Verification'
                }
            },
            Source: 'verification@waveforme.net'
        }
        const sendEmailCmd = new SendEmailCommand(sesParams);
        try {
            const sesRes = await ses.send(sendEmailCmd);
        }
        catch (err) {
            console.error(err);
            console.error('SES failed to send email');
        }

        // Send back an OK response to the client
        const resObj: VerifyEmailResponse = {
            error: false,
            msg: 'OK',
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
        console.error(`Exception thrown in verifyEmail:\n${e}`);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'Internal server error',
        }
    }
}

export default verifyEmail;