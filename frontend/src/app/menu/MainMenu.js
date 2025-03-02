"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup } from "react-bootstrap";
import "./menu.css"; // Import the CSS file here

export default function MainMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showModalServer, setShowModalServer] = useState(false);
  const [showModalLogout, setShowModalLogout] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [loadingServers, setLoadingServers] = useState(true);
  const [servers, setServers] = useState([]);

  const serverList = [
    { id: 1, name: "COE 1", ip: "http://localhost:3001" },
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
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
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
    <div className="main-menu-container">
      <div className="menu-card">
        <h1 className="menu-title">Welcome to RPG Online</h1>
        <div className="menu-buttons">
          <Button
            variant="success"
            size="lg"
            onClick={() => setShowModalServer(true)}
            className="mb-3 fw-bold"
          >
            Start Game
          </Button>
          {userRole === "Admin" && (
            <Button
              variant="warning"
              size="lg"
              onClick={() => router.push("/admin")}
              className="mb-3 fw-bold"
            >
              Admin Panel
            </Button>
          )}
          <Button
            variant="danger"
            size="lg"
            onClick={() => setShowModalLogout(true)}
            className="mb-3 fw-bold"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Server Modal */}
      <Modal show={showModalServer} onHide={() => setShowModalServer(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Select a Server</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {servers.map((server) => (
              <ListGroup.Item
                key={server.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="fw-bold">
                  {server.name}{" "}
                  <span
                    className={`badge rounded-pill fw-bold ${server.status === "Online"
                        ? "text-bg-success"
                        : "text-bg-danger"
                      }`}
                  >
                    {server.status}
                  </span>
                </div>
                <Button
                  className="fw-bold"
                  variant="success"
                  disabled={server.status !== "Online"}
                  onClick={() => handleJoinServer(server)}
                >
                  Join
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Logout Modal */}
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
    </div>
  );
}
