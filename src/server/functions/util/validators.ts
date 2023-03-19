// Waveforme validators.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { CreateAccountRequest } from "src/interfaces/createAccountInterfaces";
import { VerifyEmailRequest } from "../../../interfaces/verifyEmailInterfaces";

// Validate REST api fields

export const validateVerifyEmailRequest = (req: VerifyEmailRequest): boolean => {
    if (!req.email) {
        return false;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.email)) {
        return false;
    }

    return true;
}
