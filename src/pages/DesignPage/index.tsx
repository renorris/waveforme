// Waveforme DesignPage index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { Suspense } from 'react';

import Designer from '../../components/Designer'
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/esm/Container';

function DesignPage() {
    return (
        <Layout>
            <Container className="mt-2 d-flex flex-column justify-content-center align-items-center">
                <h3>Design your Waveforme</h3>
            </Container>
            <Designer />
        </Layout>
    );
}

export default DesignPage;