// Waveforme authResponse.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { APIGatewayProxyResult } from "aws-lambda";

// Define auth api responses

interface AuthResponseSchema {
    msg: string,
    data: AuthResponseData;
}

export interface EmptyResponseData {}

export interface VerifyEmailResponseData {
    email: string,
    token: string;
}

export interface LoginResponseData {
    token: string;
}

export interface CreateAccountResponseData {
    token: string;
}

export type AuthResponseData = EmptyResponseData | VerifyEmailResponseData | LoginResponseData | CreateAccountResponseData;

export class AuthResponse {
    private resObj: AuthResponseSchema;
    private statusCode: number;

    constructor(statusCode: number, msg: string, data: AuthResponseData) {
        this.resObj = {
            msg: msg,
            data: data,
        }
        this.statusCode = statusCode;
    }

    public serialize(): APIGatewayProxyResult {
        return {
            statusCode: this.statusCode,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.resObj),
        }
    }
}