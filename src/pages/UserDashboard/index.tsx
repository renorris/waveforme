// Waveforme UserDashboard index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/esm/Container';
import VerifyEmailForm from '../../components/VerifyEmailForm';
import CreateAccountForm from '../../components/CreateAccountForm';
import { Button, Col, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../storeHooks';
import { logout } from '../../components/authSlice';

const UserDashboardPage = () => {
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const loggedIn = useAppSelector(state => state.auth.loggedIn);
    const email = useAppSelector(state => state.auth.email);
    const firstName = useAppSelector(state => state.auth.firstName);
    const lastName = useAppSelector(state => state.auth.lastName);

    useEffect(() => {
        if (!loggedIn) navigate('/app/login');
    }, [loggedIn]);

    return (
        <Layout>
            <Container style={{ maxWidth: '1024px' }}>
                <Row>
                    <h2 className='text-center'>Dashboard</h2>
                </Row>
                <Row>
                    <h4>Welcome, {firstName}</h4>
                </Row>
                <Row>
                    <p>Email: {email}</p>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={() => dispatch(logout())}>Logout</Button>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}

export default UserDashboardPage;