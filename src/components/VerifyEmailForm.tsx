// Waveforme VerifyEmailForm.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import * as jose from 'jose';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { Button, Form } from 'react-bootstrap';
import useConfig from './useConfig';
import { LoginResponse } from 'src/interfaces/loginInterfaces';
import { LoginInfo, login } from './authSlice';
import { VerifyEmailRequest, VerifyEmailResponse } from '../interfaces/verifyEmailInterfaces';

export default function VerifyEmailForm() {

    const config = useConfig();
    const dispatch = useAppDispatch();

    const emailRef = useRef<HTMLInputElement>(null);

    const submitEmailVerify = async () => {
        const email = emailRef.current!.value;

        const requestBody: VerifyEmailRequest = {
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

        if (res.status !== 200) {
            alert('Request error!');
            return;
        }

        const resObj: VerifyEmailResponse = await res.json();

        if (resObj.error) {
            alert(resObj.msg);
            return;
        }

        alert('Verification email sent!');
    }

    return (
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control ref={emailRef} type="email" placeholder="Enter email" />
            </Form.Group>

            <Button variant="primary" onClick={submitEmailVerify}>
                Verify Email
            </Button>
        </Form>
    );
}