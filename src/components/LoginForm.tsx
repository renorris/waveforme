// Waveforme LoginForm.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React, { useEffect, useState, useRef } from 'react';
import * as jose from 'jose';

import { useAppSelector, useAppDispatch } from '../storeHooks';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useConfig from './useConfig';
import { LoginInfo, login, logout } from './authSlice';
import { AuthResponse, LoginResponseData } from 'src/server/functions/auth/authResponse';

export default function LoginForm() {

    const config = useConfig();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const loggedIn = useAppSelector(state => state.auth.loggedIn);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const rememberMeRef = useRef<HTMLInputElement>(null);

    const submitLogin = async () => {
        dispatch(logout());
        const email = emailRef.current!.value;
        const password = passwordRef.current!.value;
        const rememberMe = rememberMeRef.current!.checked;

        const requestBody = {
            'email': email,
            'password': password,
            'rememberMe': rememberMe
        };

        const url = `${config.app.URL}/rest/auth/login`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (res.status !== 200) {
            const text = await res.text();
            alert(`Request error: ${text}`);
            return;
        }

        const resObj = await res.json();

        const decodedToken = jose.decodeJwt(resObj.data!.token!);
        const tokenEmail = decodedToken.email as string;
        const tokenFirstName = decodedToken.firstName as string;
        const tokenLastName = decodedToken.lastName as string;

        const loginInfo: LoginInfo = {
            email: tokenEmail,
            token: resObj.token!,
            firstName: tokenFirstName,
            lastName: tokenLastName
        }

        // Dispatch login
        dispatch(login(loginInfo));
    }

    useEffect(() => {
        if (loggedIn) navigate('/app/dashboard');
    }, [loggedIn])

    return (
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control ref={emailRef} type="email" placeholder="Enter email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control ref={passwordRef} type="password" placeholder="Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check ref={rememberMeRef} type="checkbox" label="Remember me" />
            </Form.Group>

            <Button variant="primary" onClick={submitLogin}>
                Log In
            </Button>
        </Form>
    );
}