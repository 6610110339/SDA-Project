"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./menu.css";

export default function MainMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  const buttonLogout = async () => {
    setIsLoggedIn(false);
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Main Menu - RPG Online</title>
        <meta name="description" content="Welcome to the RPG Online Main Menu" />
      </Head>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">RPG Online</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#">Start Game</Nav.Link>
              <Nav.Link href="#">Settings</Nav.Link>
            </Nav>
            <Button variant="danger" onClick={buttonLogout}>Logout</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
