// Waveforme verifyEmailInterfaces.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Define interfaces for login REST API

export interface VerifyEmailRequest {
    email: string,
}

export interface VerifyEmailResponse {
    error: boolean,
    msg: string,
}