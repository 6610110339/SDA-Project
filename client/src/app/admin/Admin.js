"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup, Spinner } from "react-bootstrap";

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showModalServer, setShowModalServer] = useState(false);
  const [showModalLogout, setShowModalLogout] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [servers, setServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);

  const serverList = [
    { id: 1, name: "Asia Server", ip: "http://localhost:3001" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      localStorage.removeItem("authToken");
      localStorage.removeItem("selectedServer");
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
        if (userData.role.name == "Admin") {} else {
          router.push("/menu");
          return
        };
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
      }
    };

    fetchUserRole();

    const checkServerStatus = async () => {
      setLoadingServers(true);
      const results = [];

      for (const server of serverList) {
        try {
          const response = await fetch(`${server.ip}/status`, { method: "GET" });

          if (response.ok) {
            const data = await response.json();
            if (data.online) {
              results.push({ ...server, status: "Online" });
            }
          }
        } catch (error) {
          console.warn(`Server ${server.name} is offline.`);
        }
      }

      setServers(results);
      setLoadingServers(false);
    };

    checkServerStatus();

    const storedServer = JSON.parse(localStorage.getItem("selectedServer"));
    if (storedServer) setSelectedServer(storedServer);
  }, []);

  const handleJoinServer = (server) => {
    localStorage.setItem("selectedServer", JSON.stringify(server));
    setSelectedServer(server);
    setShowModalServer(false);
    router.push("/game");
  };

  const buttonLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("selectedServer");
    router.push("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>RPG Online - Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto"></Nav>
            <Button variant="danger" onClick={() => setShowModalLogout(true)}>Logout</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ListGroup className="m-3">
        <ListGroup.Item action onClick={() => setShowModalServer(true)}>
          Manage Servers
        </ListGroup.Item>
        <ListGroup.Item>
          Manage Players
        </ListGroup.Item>
      </ListGroup>

      <Modal show={showModalServer} onHide={() => setShowModalServer(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Online Servers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingServers ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <ListGroup>
              {servers.length > 0 ? (
                servers.map((server) => (
                  <ListGroup.Item key={server.id} className="d-flex justify-content-between align-items-center">
                    {server.name} ({server.status})
                    <Button variant="success" onClick={() => handleJoinServer(server)}>Join</Button>
                  </ListGroup.Item>
                ))
              ) : (
                <p className="text-center">No online servers available</p>
              )}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showModalLogout} onHide={() => setShowModalLogout(false)} centered>
        <Modal.Header>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-2">
            <Button className="w-50" variant="secondary" onClick={() => setShowModalLogout(false)}>Cancel</Button>
            <Button className="w-50" variant="danger" onClick={() => buttonLogout()}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
