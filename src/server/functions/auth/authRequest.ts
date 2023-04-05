// Waveforme authRequest.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Define auth api requests

import { APIGatewayProxyResult } from 'aws-lambda';
import * as yup from 'yup';
import * as jose from 'jose';
import { createHash } from 'node:crypto';

import { AuthResponse, CreateAccountResponseData, LoginResponseData } from './authResponse';
import { verifyJWT } from '../util/verifyJWT';
import { doesAccountExist } from '../util/doesAccountExist';
import { signClaims } from '../util/signClaims';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getAccount } from '../util/getAccount';

export type AuthRequestData = { [key: string]: string };

export interface CreateAccountRequestData extends AuthRequestData {
    token: string,
    password: string,
    firstName: string,
    lastName: string,
}

export interface LoginRequestData extends AuthRequestData {
    email: string,
    password: string,
    rememberMe: string,
}


export class BaseAuthRequest<T extends AuthRequestData> {
    private _data: T;
    private _schema: yup.ObjectSchema<any>; 

    constructor(data: T, schema: yup.ObjectSchema<any>) {
        this.data = data;
        this.schema = schema;
    }
    
    protected get data(): T {
        return this._data;
    } 
    private set data(value: T) {
        this._data = value;
    }

    private get schema(): yup.ObjectSchema<any> {
        return this._schema;
    }
    private set schema(value: yup.ObjectSchema<any>) {
        this._schema = value;
    }

    public async validate(): Promise<boolean> {
        try { await this.schema.validate(this.data); }
        catch (e) { return false; }
        return true;
    }

    // Default method. Override for each child class
    public async process(): Promise<APIGatewayProxyResult> {
        return new AuthResponse(500, 'Unimplemented', {}).serialize();
    }

}


export class CreateAccountRequest extends BaseAuthRequest<CreateAccountRequestData> {
    
    constructor(data: CreateAccountRequestData) {
        const schema = yup.object().shape({
            token: yup.string().required(),
            password: yup.string().min(8).required(),
            firstName: yup.string().max(64).required(),
            lastName: yup.string().max(64).required(),
        }); 

        super(data, schema);
    }

    public async process(): Promise<APIGatewayProxyResult> {
        if (!(await verifyJWT(this.data.token))) 
            return new AuthResponse(401, 'Unauthorized', {}).serialize();

        const decodedToken = jose.decodeJwt(this.data.token);
        const tokenEmail = decodedToken.email! as string;
        if (!(await doesAccountExist('waveforme_users', 'us-east-2', tokenEmail)))
            return new AuthResponse(400, 'Unable to create account. Please check the email.', {}).serialize();

        // Good to log in. Send back session claims token
        const newSessionClaims = {
            email: tokenEmail,
            firstName: this.data.firstName,
            lastName: this.data.lastName,
        }
        const jwt = await signClaims(newSessionClaims, '24h');

        // Hash password & write account to database
        const pwdHash = createHash('sha256').update(this.data.password, 'utf-8').digest('hex');
        const putItemCmdParams = {
            TableName: 'waveforme_users',
            Item: {
                'email': { 'S': tokenEmail },
                'password': { 'S': pwdHash },
                'firstName': { 'S': this.data.firstName },
                'lastName': { 'S': this.data.lastName },
            }
        }
        const putItemCmd = new PutItemCommand(putItemCmdParams);
        const dynamoDbClient = new DynamoDBClient({ region: 'us-east-2' });
        try { await dynamoDbClient.send(putItemCmd); }
        catch (e) { return new AuthResponse(500, 'Unable to create account. Please check the email.', {}).serialize(); }

        // Send back success
        const data: CreateAccountResponseData = { token: jwt }
        return new AuthResponse(200, 'OK', data).serialize();
    }
}


export class LoginRequest extends BaseAuthRequest<LoginRequestData> {
    
    constructor(data: LoginRequestData) {
        const schema = yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().min(8).required(),
            rememberMe: yup.boolean().required(),
        });

        super(data, schema);
    }

    public async process(): Promise<APIGatewayProxyResult> {
        const acc = await getAccount('waveforme_users', 'us-east-2', this.data.email);
        if (acc.length === 0 || (createHash('sha256').update(this.data.password, 'utf-8').digest('hex') !== acc[0].password)) {
            return new AuthResponse(401, 'Invalid login info', {}).serialize();
        }

        const workingAcc = acc.at(0)!;
        const claims = {
            email: workingAcc.email,
            firstName: workingAcc.firstName,
            lastName: workingAcc.lastName
        }
        const jwt = await signClaims(claims, this.data.rememberMe ? '30d' : '24h');

        const res: LoginResponseData = {
            token: jwt,
        }
        
        return new AuthResponse(200, 'OK', res).serialize();
    }
}
