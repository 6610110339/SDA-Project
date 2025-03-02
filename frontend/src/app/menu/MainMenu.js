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
