// Waveforme ConfigContext.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createContext } from 'react';
import { Config } from '../config';

const ConfigContext = createContext<Config | null>(null);

export default ConfigContext;