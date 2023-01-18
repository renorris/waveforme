// Waveforme index.tsx (Browser)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import main App
import App from '../App';

ReactDOM.hydrate(<App />, document.getElementById('root'));