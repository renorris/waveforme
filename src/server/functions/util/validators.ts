// Waveforme validators.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { LoginRequest } from "src/interfaces/loginInterfaces";
import { CreateAccountRequest } from "../../../interfaces/createAccountInterfaces";
import { VerifyEmailRequest } from "../../../interfaces/verifyEmailInterfaces";

// Validate REST api fields

export const validateVerifyEmailRequest = (req: VerifyEmailRequest): boolean => {
    if (!req.email || req.email.length < 1 || req.email.length > 320) {
        return false;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.email) || req.email.length > 320) {
        return false;
    }

    return true;
}

export const validateCreateAccountRequest = (req: CreateAccountRequest): boolean => {
    // Check non-null
    if (!req.firstName || !req.lastName || !req.password || !req.token) {
        return false;
    }

    // Check lengths
    if (req.password.length < 8 ||
        req.password.length > 64 ||
        req.firstName.length < 1 ||
        req.lastName.length < 1 ||
        req.firstName.length > 32 ||
        req.firstName.length > 32 ||
        req.token.length < 1) {
        return false;
    }

    return true;
}

export const validateLoginRequest = (req: LoginRequest): boolean => {
    // Check non-null
    if (!req.email || !req.password || typeof req.rememberMe !== 'boolean') {
        return false;
    }

    // Check lengths
    if (req.email.length < 1 ||
        req.password.length < 1) {
        return false;
    }

    return true;
}
