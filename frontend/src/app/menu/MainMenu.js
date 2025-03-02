"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup } from "react-bootstrap";

export default function MainMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showModalServer, setShowModalServer] = useState(false);
  const [showModalLogout, setShowModalLogout] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const servers = [
    { id: 1, name: "Asia Server", ip: "ws://localhost:3001" },
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
    };

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
          <Navbar.Brand >RPG Online</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => setShowModalServer(true)} style={{ cursor: "pointer" }}>
                Start Game {selectedServer ? `` : ""}
              </Nav.Link>
              {userRole === "Admin" && (
                <Nav className="ms-auto">
                  <Nav.Link href="/admin">Admin Panel</Nav.Link>
                </Nav>
              )}
              {
                //<Nav.Link>Market</Nav.Link>
                //<Nav.Link>About</Nav.Link>
                //<Nav.Link>Settings</Nav.Link>
              }
            </Nav>
            <Button variant="danger" onClick={() => setShowModalLogout(true)}>Logout</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showModalServer} onHide={() => setShowModalServer(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select a Server</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {servers.map((server) => (
              <ListGroup.Item key={server.id} className="d-flex justify-content-between align-items-center">
                {server.name}
                <Button variant="success" onClick={() => handleJoinServer(server)}>Join</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Modal show={showModalLogout} onHide={() => setShowModalLogout(false)} centered>
        <Modal.Header >
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
