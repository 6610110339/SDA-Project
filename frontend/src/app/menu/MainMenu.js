"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup } from "react-bootstrap";
import "./menu.css";
import ProfileMenu from "../ProfileMenu";

export default function MainMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showModalLogout, setShowModalLogout] = useState(false);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserData(userData || "NULL")
        setUserRole(userData.role.name || "NULL");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
      }
    };

    fetchUserRole();

  }, []);

  const buttonLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <div className="main-menu-container">

      {/* ✅ Add the ProfileMenu at the top */}
      <ProfileMenu />

      <div className="menu-card">
        <h1 className="menu-title">Welcome to RPG Online</h1>
        <div className="menu-buttons">
          <Button
            variant="success"
            size="lg"
            onClick={() => router.push("/stagelist")}
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
