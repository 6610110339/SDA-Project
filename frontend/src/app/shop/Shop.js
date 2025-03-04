"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal, ListGroup } from "react-bootstrap";
import { Collapse, Tag, Avatar, Card, notification, Space } from 'antd';
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
  const [isPaying, setIsPaying] = useState(false);
  const [confirmUpgrade, setConfirmUpgrade] = useState({ show: false, type: "" });

  const cardStyle = {
    width: "250px",
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    className: "hover-effect",
    justifyContent: "space-between"
  };

  const upgadeCost = {
    Upgrade_Health: 15,
    Upgrade_Damage: 25,
    Upgrade_Defense: 25,
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

    fetchUserRole();
  }, []);

  const handleUpgradeConfirm = (type) => {
    setConfirmUpgrade({ show: true, type });
  };

  const handleUpgradeCancel = () => {
    setConfirmUpgrade({ show: false, type: "" });
  };

  const handleUpgradeProceed = async () => {
    if (confirmUpgrade.type) {
      await updateUpgradeData(confirmUpgrade.type);
      setConfirmUpgrade({ show: false, type: "" });
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("authToken");
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
  const updateUpgradeData = async (type) => {
    try {
      setIsPaying(true);
      const userDocumentId = String(userData.documentId);
      const upgragePrice = upgadeCost[type] + (Number(userData.upgrade[type]) * upgadeCost[type]);

      const response = await fetch(`http://localhost:1337/api/upgrades?populate=*&filters[owner][documentId][$eq]=${userDocumentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setIsPaying(false);
        throw new Error("Error!");
      };

      const character = data.data[0];
      const characterId = character.documentId;

      if (character.Value_Coins < upgragePrice) {
        setIsPaying(false);
        return;
      };

      let newData_Upgrade = {};
      handleCoinsCost(upgragePrice);

      if (type == "Upgrade_Health") {
        let upgrageValue = Number(userData.upgrade.Upgrade_Health + 1);
        newData_Upgrade = {
          Upgrade_Health: Number(upgrageValue),
          Upgrade_Damage: Number(userData.upgrade.Upgrade_Damage),
          Upgrade_Defense: Number(userData.upgrade.Upgrade_Defense),
          Upgrade_Skill: Number(userData.upgrade.Upgrade_Skill)
        };
      } else {
        if (type == "Upgrade_Damage") {
          let upgrageValue = Number(userData.upgrade.Upgrade_Damage + 1);
          newData_Upgrade = {
            Upgrade_Health: Number(userData.upgrade.Upgrade_Health),
            Upgrade_Damage: Number(upgrageValue),
            Upgrade_Defense: Number(userData.upgrade.Upgrade_Defense),
            Upgrade_Skill: Number(userData.upgrade.Upgrade_Skill)
          };
        } else {
          if (type == "Upgrade_Defense") {
            let upgrageValue = Number(userData.upgrade.Upgrade_Defense + 1);
            newData_Upgrade = {
              Upgrade_Health: Number(userData.upgrade.Upgrade_Health),
              Upgrade_Damage: Number(userData.upgrade.Upgrade_Damage),
              Upgrade_Defense: Number(upgrageValue),
              Upgrade_Skill: Number(userData.upgrade.Upgrade_Skill)
            };
          } else {
            if (type == "Upgrade_Skill") {
              let upgrageValue = Number(userData.upgrade.Upgrade_Skill + 1);
              newData_Upgrade = {
                Upgrade_Health: Number(userData.upgrade.Upgrade_Health),
                Upgrade_Damage: Number(userData.upgrade.Upgrade_Damage),
                Upgrade_Defense: Number(userData.upgrade.Upgrade_Defense),
                Upgrade_Skill: Number(upgrageValue)
              };
            } else {
              setIsPaying(false);
              return;
            }
          }
        }
      }

      const updateResponse = await fetch(`http://localhost:1337/api/upgrades/${characterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: newData_Upgrade }),
      });

      if (!updateResponse.ok) {
        setIsPaying(false);
        throw new Error("Error!");
      }

    } catch (error) {
      setIsPaying(false);
      console.error("Error claiming reward:", error);
    }
  };

  const handleCoinsCost = async (price) => {
    try {

      const userDocumentId = String(userData.documentId);

      const response = await fetch(`http://localhost:1337/api/characters?populate=*&filters[owner][documentId][$eq]=${userDocumentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setIsPaying(false);
        throw new Error("Error!");
      };

      const character = data.data[0];
      const characterId = character.documentId;

      let updatedXP = Number(character.Value_XP);
      let updatedCoins = Number(character.Value_Coins - price);
      let updatedLevel = Number(character.Value_Level)

      const newData = {
        Value_XP: updatedXP,
        Value_Coins: updatedCoins,
        Value_Level: updatedLevel
      };

      const updateResponse = await fetch(`http://localhost:1337/api/characters/${characterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: newData }),
      });

      if (!updateResponse.ok) {
        setIsPaying(false);
        throw new Error("Error!");
      }

      fetchUserRole();
      setIsPaying(false);

    } catch (error) {
      setIsPaying(false);
      console.error("Error claiming reward:", error);
    }
  };

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
                <p style={{ height: "5px" }}><strong>Bonus Stats: +{(Number(userData?.upgrade.Upgrade_Health) * 2)} ❤️ Health</strong></p>
                <p style={{ height: "20px" }}><strong>Upgrade Cost: {upgadeCost.Upgrade_Health + (Number(userData?.upgrade.Upgrade_Health) * upgadeCost.Upgrade_Health)} Coins</strong></p>
                <button type="button" className="btn btn-outline-primary"
                  onClick={() => handleUpgradeConfirm("Upgrade_Health")}
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
              <div style={{ flexGrow: 1 }}>
                <p style={{ height: "5px" }}><strong>Current Level: {userData?.upgrade.Upgrade_Damage ?? "?"}</strong></p>
                <p style={{ height: "5px" }}><strong>Bonus Stats: +{(Number(userData?.upgrade.Upgrade_Damage) * 1)} 💥 Damage</strong></p>
                <p style={{ height: "20px" }}><strong>Upgrade Cost: {upgadeCost.Upgrade_Damage + (Number(userData?.upgrade.Upgrade_Damage) * upgadeCost.Upgrade_Damage)} Coins</strong></p>
                <button type="button" className="btn btn-outline-primary"
                  onClick={() => handleUpgradeConfirm("Upgrade_Damage")}
                  style={{ width: "100%" }}
                >Upgrade
                </button>
              </div>
            </Card>
            <Card
              title="🛡️ Upgrade Defense"
              variant="borderless"
              style={cardStyle}
            >
              <div style={{ flexGrow: 1 }}>
                <p style={{ height: "5px" }}><strong>Current Level: {userData?.upgrade.Upgrade_Defense ?? "?"}</strong></p>
                <p style={{ height: "5px" }}><strong>Bonus Stats: +{(Number(userData?.upgrade.Upgrade_Defense) * 1)} 🛡️ Defense</strong></p>
                <p style={{ height: "20px" }}><strong>Upgrade Cost: {upgadeCost.Upgrade_Defense + (Number(userData?.upgrade.Upgrade_Defense) * upgadeCost.Upgrade_Defense)} Coins</strong></p>
                <button type="button" className="btn btn-outline-primary"
                  onClick={() => handleUpgradeConfirm("Upgrade_Defense")}
                  style={{ width: "100%" }}
                >Upgrade
                </button>
              </div>
            </Card>
            <Card
              title="🌀 Upgrade Skill Damage"
              variant="borderless"
              style={cardStyle}
            >
              <div style={{ flexGrow: 1 }}>
                <p style={{ height: "5px" }}><strong>Current Level: {userData?.upgrade.Upgrade_Skill ?? "?"}</strong></p>
                <p style={{ height: "5px" }}><strong>Bonus Stats: +{(Number(userData?.upgrade.Upgrade_Skill) * 1)} 🌀 Damage</strong></p>
                <p style={{ height: "20px" }}><strong>Upgrade Cost: {upgadeCost.Upgrade_Skill + (Number(userData?.upgrade.Upgrade_Skill) * upgadeCost.Upgrade_Skill)} Coins</strong></p>
                <button type="button" className="btn btn-outline-primary"
                  onClick={() => handleUpgradeConfirm("Upgrade_Skill")}
                  style={{ width: "100%" }}
                >Upgrade
                </button>
              </div>
            </Card>
          </div>
        )}
      </div >

      <Modal show={confirmUpgrade.show} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure to upgrade <strong>{confirmUpgrade.type.replace("Upgrade_", "")}</strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={isPaying} onClick={handleUpgradeCancel}>Cancel</Button>
          <Button variant="primary" disabled={isPaying} onClick={handleUpgradeProceed}>Upgrade</Button>
        </Modal.Footer>
      </Modal>

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
