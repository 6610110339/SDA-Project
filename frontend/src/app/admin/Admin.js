"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, ListGroup, Spinner } from "react-bootstrap";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [servers, setServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);

  const serverList = [
    { id: 1, name: "COE 1", ip: "http://localhost:3001" },
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
        if (userData.role.name !== "Admin") {
          router.push("/menu");
          return;
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
        router.push("/menu");
        return;
      }
    };

    fetchUserRole();

    const checkServerStatus = async () => {
      setLoadingServers(true);
      const results = serverList.map((server) => ({ ...server, status: "Offline" }));

      for (let i = 0; i < serverList.length; i++) {
        try {
          const response = await fetch(`${serverList[i].ip}/status`, { method: "GET" });
          if (response.ok) {
            const data = await response.json();
            if (data.online) {
              results[i].status = "Online";
            }
          }
        } catch (error) {
          console.warn(`Server ${serverList[i].name} is offline.`);
        }
      }

      setServers(results);
      setLoadingServers(false);
    };

    checkServerStatus();
  }, []);

  const handleStartServer = async () => {
    try {
      const response = await fetch("http://localhost:3001/start", { method: "POST" });
      if (response.ok) {
        setServers((prev) =>
          prev.map((server) => ({ ...server, status: "Online" }))
        );
      }
    } catch (error) {
      console.error("Failed to start server:", error);
    }
  };

  const handleStopServer = async () => {
    try {
      const response = await fetch("http://localhost:3001/stop", { method: "POST" });
      if (response.ok) {
        setServers((prev) =>
          prev.map((server) => ({ ...server, status: "Offline" }))
        );
      }
    } catch (error) {
      console.error("Failed to stop server:", error);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>RPG Online - Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/menu">Back</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ListGroup className="m-3" style={{ maxWidth: "800px", margin: "auto" }}>
        <ListGroup.Item style={{ backgroundColor: "grey", color: "white" }}>Manage Servers</ListGroup.Item>
        {loadingServers ? (
          <div className="text-center my-3">
            <Spinner animation="border" />
          </div>
        ) : (
          <ListGroup>
            {servers.map((server) => (
              <ListGroup.Item key={server.id} className="d-flex justify-content-between align-items-center">
                <div>
                  {server.name}{" "}
                  <span className={`badge rounded-pill ${server.status === "Online" ? "text-bg-success" : "text-bg-danger"}`}>
                    {server.status}
                  </span>
                </div>
                {server.status === "Offline" ? (
                  <Button variant="success" onClick={() => handleStartServer()}>Start</Button>
                ) : (
                  <Button variant="danger" onClick={() => handleStopServer()}>Stop</Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <ListGroup.Item style={{ backgroundColor: "grey", color: "white" }}>Manage Players</ListGroup.Item>
      </ListGroup>
    </>
  );
}
