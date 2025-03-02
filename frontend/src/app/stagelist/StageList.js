"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup, Spinner } from "react-bootstrap";
import { Collapse } from 'antd';

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const StageLists_Town = [
    {
      key: '1',
      label: 'This is panelwow icon',
      children: <p>Skidibi</p>,
    },
    {
      key: '2',
      label: 'Thd',
      children: <p>Skidibi</p>,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      localStorage.removeItem("authToken");
      return;
    } else {
      setIsLoggedIn(true);
    }

    const fetchUserRole = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/users/me?populate=role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserRole(userData.role.name || "NULL");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
      }
    };

    fetchUserRole();
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">
            ⚔️ RPG Online - Stage List
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button
                href="/menu"
                className="fw-bold"
                style={{ backgroundColor: "red", borderColor: "red" }}
              >
                Back to Menu
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px",
          minHeight: "100vh",
          backgroundImage: "url('/admin_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "1rem",
          }}
        >
          <ListGroup className="shadow-lg rounded-4 overflow-hidden">
            <ListGroup.Item className="bg-primary text-white fw-bold fs-5">
              🏢 Map 1 - Town
            </ListGroup.Item>
            <Collapse defaultActiveKey={['1']} items={StageLists_Town} />
            <ListGroup.Item className="bg-secondary text-white fw-bold fs-5">
              -
            </ListGroup.Item>
          </ListGroup>
        </div>
      </div>
    </>
  );
}
