"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup, Spinner } from "react-bootstrap";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [servers, setServers] = useState([]);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
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

  const [selectedServer, setSelectedServer] = useState(null);

  const handleShowModalConfirm = (server) => {
    setSelectedServer(server);
    setShowModalConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedServer) return;

    try {
      const action = selectedServer.status === "Online" ? "stop" : "start";
      const response = await fetch(`http://localhost:3001/${action}`, { method: "POST" });

      if (response.ok) {
        setServers((prev) =>
          prev.map((server) =>
            server.id === selectedServer.id
              ? { ...server, status: action === "start" ? "Online" : "Offline" }
              : server
          )
        );
      }
    } catch (error) {
      console.error(`Failed to ${selectedServer.status === "Online" ? "stop" : "start"} server:`, error);
    } finally {
      setShowModalConfirm(false);
      setSelectedServer(null);
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

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "top",
        minHeight: "100vh",
        padding: "20px"
      }}>
        <ListGroup className="m-3" style={{ maxWidth: "600px", width: "100%" }}>
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
                    <Button variant="success" onClick={() => handleShowModalConfirm(server)}>Start</Button>
                  ) : (
                    <Button variant="danger" onClick={() => handleShowModalConfirm(server)}>Stop</Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          <ListGroup.Item style={{ backgroundColor: "grey", color: "white" }}>Manage Players</ListGroup.Item>
        </ListGroup>
      </div>

      <Modal show={showModalConfirm} onHide={() => setShowModalConfirm(false)} centered>
        <Modal.Header>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedServer ? (
            <p>Are you sure you want to {selectedServer.status === "Online" ? "stop" : "start"} <b>{selectedServer.name}</b>?</p>
          ) : (
            <p>Loading...</p>
          )}
          <div className="d-flex gap-2">
            <Button className="w-50" variant="secondary" onClick={() => setShowModalConfirm(false)}>Cancel</Button>
            <Button className="w-50" variant={selectedServer?.status === "Online" ? "danger" : "success"} onClick={handleConfirmAction}>
              {selectedServer?.status === "Online" ? "Stop" : "Start"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>


    </>
  );
}
