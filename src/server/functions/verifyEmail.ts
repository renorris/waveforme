// Waveforme verifyEmail.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Verify account does not exist, then create a JWT & email to the email address for verification

import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { VerifyEmailRequest, VerifyEmailResponse } from 'src/interfaces/verifyEmailInterfaces';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import config from '../../config';
import { doesAccountExist } from './util/doesAccountExist';
import { validateVerifyEmailRequest } from './util/validators';
import { signClaims } from './util/signClaims';


const verifyEmail = async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log('verifyEmail is running');

        // Obtain request object from event body
        const reqObj: VerifyEmailRequest = JSON.parse(event.body!);

        // Validate request
        if (!validateVerifyEmailRequest(reqObj)) {
            const resObj: VerifyEmailResponse = {
                error: true,
                msg: 'Invalid request'
            }

            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resObj),
            }
        }

        // Check if account already exists
        const alreadyExists = await doesAccountExist('waveforme_users', 'us-east-2', reqObj.email);
        if (alreadyExists) {
            // There's already a registered account.
            console.log('Account already exists');
            const resObj: VerifyEmailResponse = {
                error: true,
                msg: 'An account with this email already exists.'
            }

            return { statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
        }

        // Sign an account verification token that will be sent in the email
        console.log('Creating verification JWT...');
        const claims = {type: 'verifyEmail', email: reqObj.email};
        const jwt = await signClaims(claims, '1h');

        // Send the verification email
        const ses = new SESClient({ region: 'us-east-2' });
        const sesParams = {
            Destination: {
                ToAddresses: [reqObj.email]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `<p>Welcome to Waveforme! Please head <a href="${config.app.URL}/app/create-account?token=${encodeURIComponent(jwt)}">here</a> to verify your email and continue the registration process.</p>`
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

            const resObj: VerifyEmailResponse = {
                error: true,
                msg: 'Failed to send email. Please check the address.'
            }

            return { statusCode: 400, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
        }

        // Send back an OK response to the client
        const resObj: VerifyEmailResponse = {
            error: false,
            msg: 'OK',
        }
        return { statusCode: 200, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(resObj)}
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