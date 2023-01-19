// Waveforme App.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DesignPage from './pages/DesignPage';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <React.StrictMode>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/design" element={<DesignPage />} />
            </Routes>
        </React.StrictMode>
    )
}

export default App;