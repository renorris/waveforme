// Waveforme LoginPage index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { Suspense } from 'react';

import Layout from '../../components/Layout';
import { Container, Row } from 'react-bootstrap';
import LoginForm from '../../components/LoginForm';
import { Link } from 'react-router-dom';

function LoginPage() {
    return (
        <Layout>
            <Container style={{ maxWidth: '512px' }}>
                <Row>
                    <h2 className='text-center'>Log In</h2>
                </Row>
                <Row>
                    <LoginForm />
                </Row>
                <Row className='mt-3'>
                    <p className='text-center'>New to Waveforme? <Link to='/app/create-account'>Create Account</Link></p>
                </Row>
            </Container>
        </Layout>
    );
}

export default LoginPage;