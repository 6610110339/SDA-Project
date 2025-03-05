"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import {Navbar,Nav,Container,Button,Modal,ListGroup,} from "react-bootstrap";
import { Collapse, Tag, Avatar, Card, notification, Space,Row, Col } from "antd";

export default function SelectClass() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userCharacters, setUserCharacters] = useState(null);
  const [userUpgrades, setUserUpgrades] = useState(null);

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
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("NULL");
    }
  };

  const handleClasses = async (userData, token) => {
    try {
      if (isCreating) return;
      setClasses(true);
      const userDocumentId = String(userData.documentId);

      const response = await fetch(
        `http://localhost:1337/api/characters?populate=*=*&filters[owner][documentId][$eq]=${userDocumentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!data.data || data.data.length > 1) {
        throw new Error("Error!");
      }
    } catch (error) {}

    const handleSelectClass = async (classId) => {
      setSelectedClass(classId);

      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:1337/api/users/${userId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ class: classId }),
          }
        );

        if (!response.ok) throw new Error("Failed to update class");

        router.push("/menu");
      } catch (error) {
        console.error("Error updating class:", error);
      }
    };
  };

  return (
    <div className="container mt-5">
      <h1>Select Your Class</h1>
      <Row gutter={[16, 16]} justify="center">
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
                  height: "200px", 
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
              onClick={() => handleSelectClass("Swordman")}
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
                  height: "200px",
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
              onClick={() => handleSelectClass("Wizard")}
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
                  height: "200px",
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
              onClick={() => handleSelectClass("Archer")}
              style={{ width: "80%", marginTop: "16px" }}
            >
              Select
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}