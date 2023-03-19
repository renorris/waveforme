// Waveforme verifyJWT.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Helper to verify a JWT

import { S3 } from "@aws-sdk/client-s3";
import * as jose from 'jose';

export const verifyJWT = async (jwt: string): Promise<boolean> => {
    console.log('Verifying JWT');

    const s3 = new S3({
        region: 'us-east-2'
    });
    const params = {
        Bucket: 'waveforme-jwt',
        Key: 'key'
    }

    const s3Res = await s3.getObject(params);
    if (s3Res.Body === undefined) throw new Error('verifyJWT S3 error');

    const alg = 'RS256';
    const pkcs8 = await s3Res.Body!.transformToString('utf-8');
    const privateKey = await jose.importPKCS8(pkcs8, alg);

    let verifyResult: jose.JWTVerifyResult;
    try {
        verifyResult = await jose.jwtVerify(jwt, privateKey);
    }
    catch (err) {
        // Thrown error, assume it's an invalid token
        console.log('jwt verification failed.');
        return false;
    }

    // Check for expiry
    const now = new Date();
    const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);

    if (verifyResult.payload.exp) {
        if (verifyResult.payload.exp! < utcSecondsSinceEpoch) {
            return false;
        }
    }

    return true;
}
