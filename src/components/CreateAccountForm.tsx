// Waveforme CreateAccountForm.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import * as jose from 'jose';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { Button, Form } from 'react-bootstrap';
import useConfig from './useConfig';
import { LoginInfo, login } from './authSlice';
import { CreateAccountRequest, CreateAccountResponse } from '../interfaces/createAccountInterfaces';

export default function CreateAccountForm() {

    const config = useConfig();
    const dispatch = useAppDispatch();

    const [email, setEmail] = useState<string>('');
    useEffect(() => {
        setEmail(new URLSearchParams(window.location.search).get('email')!);
    });

    const passwordRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);

    const submitCreateAccount = async () => {
        const token = new URLSearchParams(window.location.search).get('token')!;
        const password = passwordRef.current!.value;
        const firstName = firstNameRef.current!.value;
        const lastName = lastNameRef.current!.value;

        const requestBody: CreateAccountRequest = {
            token: token,
            firstName: firstName,
            lastName: lastName,
            password: password
        };

        const url = `${config.app.URL}/rest/createAccount`;

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

        const resObj: CreateAccountResponse = await res.json();

        if (resObj.error) {
            alert(resObj.msg);
            return;
        }

        alert('Created new account!');
    }

    return (
        <Form>
            <p>Creating a new account for {email}</p>
            
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>First Name</Form.Label>
                <Form.Control ref={firstNameRef} type="text" placeholder="Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Last Name</Form.Label>
                <Form.Control ref={lastNameRef} type="text" placeholder="Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Password</Form.Label>
                <Form.Control ref={passwordRef} type="password" placeholder="Password" />
            </Form.Group>

            <Button variant="primary" onClick={submitCreateAccount}>
                Create Account
            </Button>
        </Form>
    );
}