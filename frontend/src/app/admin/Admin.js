"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Modal, ListGroup, Spinner } from "react-bootstrap";
import { UserOutlined } from '@ant-design/icons';
import { Collapse, Button, Tag, Avatar } from 'antd';

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setToken(token);
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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserData(userData || "NULL")
        setUserRole(userData.role.name || "NULL");
        if (userData.role.name !== "Admin") router.push("/menu");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
        router.push("/menu");
      }
    };

    fetchUserRole();
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">
            🛠️ RPG Online - Admin Panel
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {
                token ? (<Avatar
                  size={40}
                  style={{ color: "white" }}
                  icon={<UserOutlined />}></Avatar>) : ("")}
              <Nav.Link onClick={() => {
                router.push("/menu")
              }}>Back to Menu</Nav.Link>
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
              ⚙️ Manage Servers
            </ListGroup.Item>
            <ListGroup.Item className="bg-secondary text-white fw-bold fs-5">
              👥 Manage Players
            </ListGroup.Item>
          </ListGroup>
        </div>
      </div>

    </>
  );
}
