// Waveforme authSlice.ts
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    loggedIn: boolean,
    token: string,
    email: string,
    firstName: string,
    lastName: string,
}

const initialState: AuthState = {
    loggedIn: false,
    token: '',
    email: '',
    firstName: '',
    lastName: '',
}

export interface LoginInfo {
    email: string,
    token: string,
    firstName: string,
    lastName: string,
}

export const authState = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<LoginInfo>) => {
            state.loggedIn = true;
            state.token = action.payload.token;
            state.email = action.payload.email;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
        },
        logout: state => {
            state.loggedIn = false;
            state.token = '';
            state.email = '';
            state.firstName = '';
            state.lastName = '';
        },
    }
});

export const {
    login,
    logout,
} = authState.actions;
export default authState.reducer;