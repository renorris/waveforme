// Waveforme handler.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Export lambda function definitions for serverless.yml

import serve from './src/server/functions/serve';
import authHandler from './src/server/functions/auth/authHandler';

export { serve, authHandler };