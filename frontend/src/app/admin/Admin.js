"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup, Spinner } from "react-bootstrap";

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [loadingServers, setLoadingServers] = useState(true);
  const [servers, setServers] = useState([]);

  const serverList = [{ id: 1, name: "COE 1", ip: "http://localhost:3001" }];
  const [selectedServer, setSelectedServer] = useState(null);

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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserRole(userData.role.name || "NULL");
        if (userData.role.name !== "Admin") router.push("/menu");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
        router.push("/menu");
      }
    };

    const checkServerStatus = async () => {
      setLoadingServers(true);
      const results = serverList.map((server) => ({ ...server, status: "Offline" }));

      for (let i = 0; i < serverList.length; i++) {
        try {
          const response = await fetch(`${serverList[i].ip}/status`);
          if (response.ok) {
            const data = await response.json();
            if (data.online) results[i].status = "Online";
          }
        } catch {
          console.warn(`Server ${serverList[i].name} is offline.`);
        }
      }

      setServers(results);
      setLoadingServers(false);
    };

    fetchUserRole();
    checkServerStatus();
  }, []);

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
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">
            🛠️ RPG Online - Admin Panel
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
              ⚙️ Manage Servers
            </ListGroup.Item>

            {loadingServers ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              servers.map((server) => (
                <ListGroup.Item
                  key={server.id}
                  className="d-flex justify-content-between align-items-center"
                  style={{ padding: "1rem" }}
                >
                  <div className="fw-bold fs-6">
                    {server.name}{" "}
                    <span
                      className={`badge rounded-pill fw-bold ${server.status === "Online"
                        ? "bg-success"
                        : "bg-danger"
                        }`}
                    >
                      {server.status}
                    </span>
                  </div>
                  <Button
                    className="fw-bold"
                    variant={
                      server.status === "Offline" ? "success" : "danger"
                    }
                    onClick={() => handleShowModalConfirm(server)}
                  >
                    {server.status === "Offline" ? "Start" : "Stop"}
                  </Button>
                </ListGroup.Item>
              ))
            )}

            <ListGroup.Item className="bg-secondary text-white fw-bold fs-5">
              👥 Manage Players
            </ListGroup.Item>
          </ListGroup>
        </div>
      </div>

      <Modal
        show={showModalConfirm}
        onHide={() => setShowModalConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedServer ? (
            <>
              <p className="fs-5 fw-normal mb-4 text-center">
                Are you sure you want to{" "}
                <span className="fw-bold">
                  {selectedServer.status === "Online" ? "stop" : "start"}
                </span>{" "}
                the server <span className="fw-bold">{selectedServer.name}</span>?
              </p>
              <div className="d-flex gap-3">
                <Button
                  className="w-50 py-2 fs-5 fw-bold"
                  variant="secondary"
                  onClick={() => setShowModalConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-50 py-2 fs-5 fw-bold"
                  variant={
                    selectedServer.status === "Online"
                      ? "danger"
                      : "success"
                  }
                  onClick={handleConfirmAction}
                >
                  {selectedServer.status === "Online" ? "Stop" : "Start"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
