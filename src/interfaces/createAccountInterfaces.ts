// Waveforme createAccountInterfaces.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Define interfaces for createAccount REST API

export interface CreateAccountRequest {
    token: string,
    firstName: string,
    lastName: string,
    password: string,
}

export interface CreateAccountResponse {
    error: boolean,
    msg: string,
    token: string | undefined,
}