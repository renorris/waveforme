// Waveforme HomePage index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React from 'react';
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/esm/Container';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <Layout>
            <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ height: '75vh', gap: '10px' }}>
                <h1>Waveforme Home</h1>
                <Link to="/design">
                    <Button size="lg" variant="outline-success" className="fw-bold">Design Yours</Button>
                </Link>
            </Container>
        </Layout>
    );
}

export default HomePage;