// Waveforme handler.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Export lambda function definitions for serverless.yml

import serve from './src/server/functions/serve';
import stashResult from './src/server/functions/stashResult';
import login from './src/server/functions/login';
import createAccount from './src/server/functions/createAccount';
import verifyEmail from './src/server/functions/verifyEmail';

export { serve, stashResult, login, createAccount, verifyEmail };