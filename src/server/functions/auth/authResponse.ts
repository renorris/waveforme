// Waveforme authResponse.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { APIGatewayProxyResult } from "aws-lambda";

// Define auth api responses

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

export type AuthResponseData = VerifyEmailResponseData | LoginResponseData | CreateAccountResponseData;

export class AuthResponse<T extends AuthResponseData | {}> {
    private _msg: string;
    private _data: T;
    private _statusCode: number;

    constructor(statusCode: number, msg: string, data: T) {
        this.statusCode = statusCode;
        this.msg = msg;
        this.data = data;
    }

    public get statusCode(): number {
        return this._statusCode;
    }
    private set statusCode(value: number) {
        this._statusCode = value;
    }

    public get msg(): string {
        return this._msg;
    }
    private set msg(value: string) {
        this._msg = value;
    }

    public get data(): T {
        return this._data;
    }
    private set data(value: T) {
        this._data = value;
    }

    public serialize(): APIGatewayProxyResult {
        return {
            statusCode: this.statusCode,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                msg: this.msg,
                data: this.data
            }),
        }
    }
}