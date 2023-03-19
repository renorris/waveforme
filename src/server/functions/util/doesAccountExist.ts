// Waveforme doesAccountExist.ts (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Helper to determine whether an account exists in a dynamoDB table

import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export const doesAccountExist = async (table: string, region: string, email: string): Promise<boolean> => {
    const dbClient = new DynamoDBClient({ region: region });
    
    const cmdParams = {
        TableName: table,
        Limit: 1,
        Key: {
            'email': { 'S': email }
        }
    }
    
    const command = new GetItemCommand(cmdParams);
    const res = await dbClient.send(command);
    
    return (res.Item !== undefined);
}