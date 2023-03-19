// Waveforme AboutPage index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/esm/Container';

const AboutPage = () => {
    return (
        <Layout>
            <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh', gap: '10px' }}>
                <h1>About Waveforme</h1>
                <p>Waveforme lets you design soundwave art.</p>
                <p><Link to='/app'>Home</Link></p>
            </Container>
        </Layout>
    );
}

export default AboutPage;