// Waveforme CreateAccount index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/esm/Container';
import VerifyEmailForm from '../../components/VerifyEmailForm';
import CreateAccountForm from '../../components/CreateAccountForm';
import { Row } from 'react-bootstrap';

const CreateAccountPage = () => {
    
    const [tokenPresent, setTokenPresent] = useState<boolean>(false);

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.has('token')) {
            setTokenPresent(true);
        }
    });
    
    return (
        <Layout>
            <Container style={{ maxWidth: '512px' }}>
                <Row>
                    <h2 className='text-center'>Create Account</h2>
                </Row>
                <Row>
                    { !tokenPresent &&
                        <VerifyEmailForm />
                    }
                    { tokenPresent &&
                        <CreateAccountForm />
                    }
                </Row>
            </Container>
        </Layout>
    );
}

export default CreateAccountPage;