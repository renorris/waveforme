// Waveforme DesignPage index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { Suspense } from 'react';

import Designer from '../../components/Designer'
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/esm/Container';

function DesignPage() {
    return (
        <Layout>
            <Designer />
        </Layout>
    );
}

export default DesignPage;