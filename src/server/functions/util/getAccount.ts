// Waveforme getAccount.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Helper to get account from dynamoDB

import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export type WaveformeUserAccount = {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
}

export const getAccount = async (table: string, region: string, email: string): Promise<WaveformeUserAccount[]> => {
    const dbClient = new DynamoDBClient({ region: region });
    
    const cmdParams = {
        TableName: table,
        Key: {
            'email': { 'S': email }
        }
    }
    
    const command = new GetItemCommand(cmdParams);
    const res = await dbClient.send(command);
    
    if (!res.Item) {
        return [];
    }

    const item = res.Item!;

    const acc: WaveformeUserAccount = {
        email: item['email'].S!,
        password: item['password'].S!,
        firstName: item['firstName'].S!,
        lastName: item['lastName'].S!
    }

    return [acc];
}