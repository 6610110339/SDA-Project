"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup } from "react-bootstrap";
import { UserOutlined } from '@ant-design/icons';
import { Collapse, Tag, Avatar, message } from 'antd';

export default function Admin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: 'loading',
      content: 'Loading instance game...',
      duration: 0,
    });
    setTimeout(messageApi.destroy, 1500);
  };

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
        setUserRole(userData.role.name || "NULL");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
      }
    };

    fetchUserRole();
  }, []);

  const stages = [
    { key: '1', name: "Stage 1", difficulty: "Easy", color: "#008000", level: 0 },
    { key: '2', name: "Stage 2", difficulty: "Easy", color: "#008000", level: 2 },
    { key: '3', name: "Stage 3", difficulty: "Normal", color: "#f5b041", level: 5 },
    { key: '4', name: "Stage 4", difficulty: "Normal", color: "#f5b041", level: 8 },
    { key: '5', name: "Stage 5", difficulty: "Hard", color: "#c0392b", level: 12 },
  ];

  const handleAttack = (selectedStage) => {
    const generateID = Math.floor(Math.random() * 1000000);
    localStorage.setItem("selectStage", selectedStage);
    localStorage.setItem("instanceID", generateID);
    router.push(`/game?stage=${selectedStage}&id=${generateID}`);
  };

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
              {token && <Avatar size={40} style={{ color: "white" }} icon={<UserOutlined />} />}
              <Nav.Link onClick={() => router.push("/menu")}>Back to Menu</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px", minHeight: "100vh", backgroundImage: "url('/bg_stagelist.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed" }}>
        <div style={{ width: "100%", maxWidth: "700px", backgroundColor: "rgba(255, 255, 255, 0.9)", padding: "20px", borderRadius: "1rem" }}>
          <ListGroup className="shadow-lg rounded-4 overflow-hidden">
            <ListGroup.Item className="bg-primary text-white fw-bold fs-5">🌳 Map 1 - Forest</ListGroup.Item>
            <Collapse items={stages.map(stage => ({
              key: stage.key,
              label: <div><p>{stage.name}</p><Tag color={stage.color}>{stage.difficulty}</Tag></div>,
              children: <>
                <p>Recommend Level: {stage.level}</p>
                <button type="button" className="btn btn-outline-danger" onClick={() => { setSelectedStage(stage); setModalOpen(true); }}>Attack</button>
              </>
            }))} />
          </ListGroup>
        </div>
      </div>

      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Attack {selectedStage?.name}?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Recommend Level: {selectedStage?.level}
          <div>
            <button type="button" className="btn btn-outline-danger" onClick={() => { handleAttack(selectedStage?.key) }}>Attack</button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
