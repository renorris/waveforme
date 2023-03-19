// Waveforme Header index.tsx
// Copyright (C) 2023 Reese Norris - All Rights Reserved

import React from "react";
import Container from "react-bootstrap/esm/Container";
import Dropdown from "react-bootstrap/esm/Dropdown";
import Nav from "react-bootstrap/esm/Nav";
import NavItem from "react-bootstrap/esm/NavItem";
import NavLink from "react-bootstrap/esm/NavLink";
import Navbar from "react-bootstrap/esm/Navbar";
import { Link } from "react-router-dom";

import useConfig from "./useConfig";
import logo from "../assets/logo.svg";
import { useAppSelector } from "../storeHooks";
import { House, Person } from "react-bootstrap-icons";

function Header() {

    // project config
    const config = useConfig();

    const loggedIn = useAppSelector(state => state.auth.loggedIn);
    const firstName = useAppSelector(state => state.auth.firstName);
    const lastName = useAppSelector(state => state.auth.lastName);

    return (
        <Navbar bg="grey" className="border-bottom px-0 mx-0 py-0 mt-0 mb-2">
            <Container fluid className="justify-content-start">
                <Nav.Link as={Link} to="/app">
                    <Navbar.Brand>
                        <img
                            alt="Waveforme Logo"
                            src={logo}
                            width="50"
                            height="50"
                        />
                        <span className="ms-2 fs-2 align-middle">Waveforme</span>
                    </Navbar.Brand>
                </Nav.Link>

                <Nav className="d-none d-sm-flex">
                    <Nav.Link as={Link} to="/app">Home</Nav.Link>
                    <Nav.Link as={Link} to="/app/about">About</Nav.Link>
                    <Nav.Link as={Link} to="/app/design">Design Yours</Nav.Link>
                    {!loggedIn &&
                        <Nav.Link as={Link} to="/app/login">Login</Nav.Link>
                    }
                    {loggedIn &&
                        <Nav.Link as={Link} to="/app/dashboard"><Person /> {firstName}</Nav.Link>
                    }
                </Nav>

                <Container fluid className="d-flex d-sm-none justify-content-end">
                    <Nav>
                        <Dropdown as={NavItem} align="end">
                            <Dropdown.Toggle as={NavLink}><House size={20} /></Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>
                                    {!loggedIn &&
                                        <Nav.Link as={Link} to="/app/login">Login</Nav.Link>
                                    }
                                    {loggedIn &&
                                        <Nav.Link as={Link} to="/app/dashboard"><Person /> {firstName}</Nav.Link>
                                    }
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Nav.Link as={Link} to="/app">Home</Nav.Link>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Nav.Link as={Link} to="/app/about">About</Nav.Link>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Nav.Link as={Link} to="/app/design">Design Yours</Nav.Link>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Container>
            </Container>
        </Navbar>
    );
}

export default Header;