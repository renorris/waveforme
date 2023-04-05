// Waveforme VerifyEmailForm.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import * as jose from 'jose';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import useConfig from './useConfig';

export default function VerifyEmailForm() {

    const config = useConfig();
    const dispatch = useAppDispatch();

    const emailRef = useRef<HTMLInputElement>(null);
    
    const [spinnerVisible, setSpinnerVisibility] = useState<boolean>(false);

    const [alertVariant, setAlertVariant] = useState<string>('secondary');
    const [alertText, setAlertText] = useState<string>('');
    const [alertVisible, setAlertVisibility] = useState<boolean>(false);

    const submitEmailVerify = async () => {
        setSpinnerVisibility(true);
        setAlertVisibility(false);
        const email = emailRef.current!.value;

        const requestBody = {
            'email': email,
        };

        const url = `${config.app.URL}/rest/verifyEmail`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        const resObj = await res.json();

        if (res.status !== 200 || resObj.error) {
            setAlertVariant('danger');
            setAlertText(`Error: ${resObj.msg}`);
            setAlertVisibility(true);
            setSpinnerVisibility(false);
            return;
        }

        setAlertVariant('success');
        setAlertText('Verification email sent!');
        setAlertVisibility(true);
        setSpinnerVisibility(false);
    }

    return (
        <>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control ref={emailRef} type="email" placeholder="Enter email" />
                </Form.Group>

                <Alert style={{display: alertVisible ? '' : 'none'}} variant={alertVariant}>
                    {alertText}
                </Alert>

                <Button variant="primary" onClick={submitEmailVerify}>
                    Verify Email
                    <Spinner size={'sm'} className='ms-2' style={{display: spinnerVisible ? '' : 'none'}} animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Button>
            </Form>
        </>
    );
}