// Waveforme signClaims.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Helper to sign a claims object, returns a JWT

import { S3 } from "@aws-sdk/client-s3";
import * as jose from 'jose';

export const signClaims = async (claims: { [key: string]: string }, expirationTime: string): Promise<string> => {
    console.log('Signing claims object');
    
    const s3 = new S3({
        region: 'us-east-2'
    });
    const params = {
        Bucket: 'waveforme-jwt',
        Key: 'key'
    }

    const s3Res = await s3.getObject(params);
    if (s3Res.Body === undefined) throw new Error('signClaims S3 error');

    const alg = 'RS256';
    const pkcs8 = await s3Res.Body!.transformToString('utf-8');
    const privateKey = await jose.importPKCS8(pkcs8, alg);
    const jwt = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .setIssuer('waveforme.net')
        .sign(privateKey);
    
    return jwt;
}