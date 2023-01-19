// Waveforme index.tsx (Browser)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import * as React from 'react';
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';

import App from '../App';
import { Config } from '../config';
import ConfigContext from '../components/ConfigContext';
import SSRProvider from 'react-bootstrap/esm/SSRProvider';

const config = (window as any).__CONFIG__ as Config;
//const basename = config.app.URL.match(/^(?:https?:\/\/)?[^\/]+(\/?.+)?$/i)?.[1];

const container = document.getElementById('root');
hydrateRoot(container!,
    <SSRProvider>
        <ConfigContext.Provider value={config}>
            <BrowserRouter basename='/'>
                <App />
            </BrowserRouter>
        </ConfigContext.Provider>
    </SSRProvider>
);