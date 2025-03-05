"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Modal,
  ListGroup,
} from "react-bootstrap";
import {
  Collapse,
  Tag,
  Avatar,
  Card,
  notification,
  Space,
  Row,
  Col,
} from "antd";
import ProfileMenu from "../ProfileMenu";

export default function SelectClass() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userCharacters, setUserCharacters] = useState(null);
  const [userUpgrades, setUserUpgrades] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isConfirmClass, setIsConfirmClass] = useState(false);

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

    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:1337/api/users/me?populate=*",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setUserData(userData);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUserCharacters(userData.character);
      setUserUpgrades(userData.upgrade);
      setUserRole(userData.role.name);

      if (userData.character) {
        router.push("/menu");
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("NULL");
    }
  };

  const handleClasses = async (targetClass) => {
    try {
      if (isPaying) return;
      setIsPaying(true);
      const userDocumentId = String(userData.documentId);

      const response = await fetch(
        `http://localhost:1337/api/characters?populate=*&filters[owner][documentId][$eq]=${userDocumentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!data.data || data.data.length > 1) {
        throw new Error("Error!");
      }

      const newData = {
        Class_Name: String(targetClass),
        Value_Level: 0,
        Value_XP: 0,
        Value_Coins: 0,
        owner: userData.documentId,
      };

      const updateResponse = await fetch(
        `http://localhost:1337/api/characters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: newData }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Error!");
      }

      router.push("/menu");
      return;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="shadow-sm"
        fixed="top"
      >
        <Container>
          <Navbar.Brand className="fw-bold">
            ⚔️ RPG Online - Select Your Class
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => router.push("/menu")}>
                Back to Menu
              </Nav.Link>
              <Nav.Link className="fw-bold text-white">
                {userData?.username}
              </Nav.Link>
              {token && <ProfileMenu />}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "80px 20px",
          minHeight: "100vh",
          backgroundImage: "url('/bg_selectclass.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {isLoading ? (
          ""
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              maxWidth: "1200px",
              backgroundColor: "rgba(255, 255, 255, 0)",
              padding: "20px",
              borderRadius: "1rem",
            }}
          >
            <Row gutter={[16, 16]} justify="center" style={{ width: "100%" }}>
              <Col xs={24} sm={12} md={8}>
                <Card
                  title="Swordman"
                  variant="borderless"
                  cover={
                    <img
                      alt="Swordman"
                      src="/Characters/Swordman.png"
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                      }}
                    />
                  }
                  style={{
                    margin: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    backgroundColor: "#f8f8f8",
                    textAlign: "center",
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedClass("SwordMan");
                      setIsConfirmClass(true);
                    }}
                    style={{ width: "80%", marginTop: "16px" }}
                  >
                    Select
                  </Button>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card
                  title="Wizard"
                  variant="borderless"
                  cover={
                    <img
                      alt="Wizard"
                      src="/Characters/Wizard.png"
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                      }}
                    />
                  }
                  style={{
                    margin: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    backgroundColor: "#f8f8f8",
                    textAlign: "center",
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedClass("Wizard");
                      setIsConfirmClass(true);
                    }}
                    style={{ width: "80%", marginTop: "16px" }}
                  >
                    Select
                  </Button>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card
                  title="Archer"
                  variant="borderless"
                  cover={
                    <img
                      alt="Archer"
                      src="/Characters/Archer.png"
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                      }}
                    />
                  }
                  style={{
                    margin: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    backgroundColor: "#f8f8f8",
                    textAlign: "center",
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedClass("Archer");
                      setIsConfirmClass(true);
                    }}
                    style={{ width: "80%", marginTop: "16px" }}
                  >
                    Select
                  </Button>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </div>

      <Modal show={isConfirmClass} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure to select <strong>{selectedClass}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={isPaying}
            onClick={() => {
              setIsConfirmClass(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isPaying}
            onClick={() => {
              handleClasses(selectedClass);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
