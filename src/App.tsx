// Waveforme App.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Provider } from 'react-redux';
import store from './store';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DesignPage from './pages/DesignPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccount';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        //<React.StrictMode>
            <Provider store={store}>
                <Routes>
                    <Route path="/app" element={<HomePage />} />
                    <Route path="/app/about" element={<AboutPage />} />
                    <Route path="/app/design" element={<DesignPage />} />
                    <Route path="/app/login" element={<LoginPage />} />
                    <Route path="/app/create-account" element={<CreateAccountPage />} />
                </Routes>
            </Provider>
        //</React.StrictMode>
    )
}

export default App;