// Waveforme loginInterfaces.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Define interfaces for login REST API

export interface LoginRequest {
    email: string,
    password: string,
    rememberMe: boolean
}

export interface LoginResponse {
    error: boolean,
    msg: string,
    token: string | undefined,
}