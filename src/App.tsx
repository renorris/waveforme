import "./App.css";

import * as React from "react";
import { Route, Routes } from "react-router-dom";

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DesignPage from './pages/DesignPage';

import useConfig from "./components/useConfig";

import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Waveforme Web Application
 */

export default function App() {
  const config = useConfig();
  return (
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/design" element={<DesignPage />} />
      </Routes>
    </React.StrictMode>
  );
}
