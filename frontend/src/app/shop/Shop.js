"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup } from "react-bootstrap";
import { Collapse, Tag, Avatar, Card } from 'antd';
import ProfileMenu from "../ProfileMenu";

export default function Shop() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [userCharacters, setUserCharacters] = useState(null);
  const [userUpgrades, setUserUpgrades] = useState(null);
  const [showClassPopup, setShowClassPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cardStyle = {
    width: "250px",
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  const upgadeCost = {
    Upgrade_Health: 15,
    Upgrade_Damage: 25,
    Upgrade_Defense: 15,
    Upgrade_Skill: 25
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
        const response = await fetch("http://localhost:1337/api/users/me?populate=*", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserData(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUserCharacters(userData.character);
        setUserUpgrades(userData.upgrade);
        setUserRole(userData.role.name);

        if (!userData.character) {
          setShowClassPopup(true);
          return;
        };

        setIsLoading(false);

      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
      }
    };

    fetchUserRole();
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm" fixed="top">
        <Container>
          <Navbar.Brand className="fw-bold">
            ⚔️ RPG Online - Upgrade Shop
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link
                style={{ color: "gold" }}
              >Coins: {userData?.character.Value_Coins ?? "Loading..."}
              </Nav.Link>
              <Nav.Link onClick={() => router.push("/menu")}>Back to Menu</Nav.Link>
              {token && (
                <ProfileMenu />
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ display: "flex", justifyContent: "center", padding: "80px 20px", minHeight: "100vh", backgroundImage: "url('/bg_shop.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed" }}>
        {isLoading ? ("") : (
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", width: "100%", maxWidth: "1200px",
            backgroundColor: "rgba(255, 255, 255, 0)", padding: "20px",
            borderRadius: "1rem"
          }}>
            <Card
              title="❤️ Upgrade Health"
              variant="borderless"
              style={cardStyle}
            >
              <div style={{ flexGrow: 1 }}>
                <p style={{ height: "5px" }}><strong>Current Level: {userData?.upgrade.Upgrade_Health ?? "?"}</strong></p>
                <p style={{ height: "5px" }}><strong>Bonus Stats: +{(Number(userData?.upgrade.Upgrade_Health) * 5)} ❤️ Health</strong></p>
                <p style={{ height: "20px" }}><strong>Upgrade Cost: {upgadeCost.Upgrade_Health + (Number(userData?.upgrade.Upgrade_Health) * upgadeCost.Upgrade_Health)} Coins</strong></p>
                <button type="button" className="btn btn-outline-primary"
                  onClick={() => { console.log("WDWA") }}
                  style={{ width: "100%" }}
                >Upgrade
                </button>
              </div>
            </Card>
            <Card
              title="💥 Upgrade Damage"
              variant="borderless"
              style={cardStyle}
            >
            </Card>
            <Card
              title="🛡️ Upgrade Defense"
              variant="borderless"
              style={cardStyle}
            >
            </Card>
            <Card
              title="🌀 Upgrade Skill"
              variant="borderless"
              style={cardStyle}
            >
            </Card>
          </div>
        )}
      </div >

      <Modal show={showClassPopup} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Please select your class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You need to select a class before starting the game.</p>
          <Button variant="primary" onClick={() => router.push('/select-class')}>
            Select Class
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}
