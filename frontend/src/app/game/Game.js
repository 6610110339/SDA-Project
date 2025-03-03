"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal } from "react-bootstrap";
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';

export default function Game() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [showModalReturn, setShowModalReturn] = useState(false);
  const [showModalErrorInstance, setShowModalErrorInstance] = useState(false);
  const [stage, setStage] = useState(null);
  const [instanceID, setInstanceID] = useState(null);

  const [monsterList, setMonsterList] = useState([]);
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [monsterHP, setMonsterHP] = useState(100);
  const [isDefeated, setIsDefeated] = useState(false);

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

    const selectStage = localStorage.getItem("selectStage");
    setStage(`Stage ${selectStage}`);
    const instanceID = localStorage.getItem("instanceID");
    setInstanceID(instanceID);

    const fetchUserRole = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/users/me?populate=role", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserData(userData || "NULL");
        setUserRole(userData.role.name || "NULL");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("NULL");
      }
    };
    const fetchMonsterData = async () => {
      try {
        const selectStage = localStorage.getItem("selectStage");
        const response = await fetch(`http://localhost:1337/api/monster-lists?filters[Stage_ID][$eq]=${selectStage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch monster data");

        const data = await response.json();
        setMonsterList(data.data[0].MonsterData);
        console.log(data.data[0].MonsterData)
      } catch (error) {
        console.error("Error fetching monster data:", error);
      }
    };

    fetchMonsterData();
    fetchUserRole();

    if (!selectStage || !instanceID) {
      setShowModalErrorInstance(true);
    }

  }, []);

  const handleReturn = async (instanceID) => {
    try {
      const fetchResponse = await fetch("http://localhost:1337/api/active-stage-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!fetchResponse.ok) throw new Error("Failed to fetch existing data");

      const existingData = await fetchResponse.json();
      let updatedJSON = existingData.data.JSON || [];

      updatedJSON = updatedJSON.filter(stage => stage.instanceID != instanceID);

      const updateResponse = await fetch("http://localhost:1337/api/active-stage-list", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { JSON: updatedJSON } }),
      });

      if (!updateResponse.ok) throw new Error("Failed to update active-stage-list in Strapi");

      localStorage.removeItem("selectStage");
      localStorage.removeItem("instanceID");
      router.push("/stagelist");
    } catch (error) {
      console.error("Error removing active stage:", error);
    }
  };

  const handleAttack = () => {
    if (monsterHP >= 10) {
      setMonsterHP(monsterHP - 10);
      if ((monsterHP - 10) <= 0) {
        setIsDefeated(true);
        setTimeout(() => {
          if (currentMonsterIndex < monsterList.length - 1) {
            setIsDefeated(false);
            setCurrentMonsterIndex(currentMonsterIndex + 1);
            setMonsterHP(100);
          } else {
            console.log("All monsters defeated!");
          }
        }, 1000);
      }
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm" fixed="top">
        <Container>
          <Navbar.Brand className="fw-bold">
            {stage} - #{instanceID}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {token && <Avatar size={40} style={{ color: "white" }} icon={<UserOutlined />} />}
              <Nav.Link onClick={() => setShowModalReturn(true)}>Return to Menu</Nav.Link>
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
          backgroundImage: "url('/bg_forest.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}>
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            padding: "20px",
            borderRadius: "1rem",
          }}>
          <div>

            <div className="monster-list" style={{ color: "white", textAlign: "center" }}>
              {monsterList.length > 0 ? (
                <div style={{ marginBottom: "20px" }}>
                  <h3>{monsterList[currentMonsterIndex].name} (Level {monsterList[currentMonsterIndex].level})</h3>

                  <img
                    src={`/monster_${monsterList[currentMonsterIndex].id}.png`} 
                    style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "10px" }}
                  />

                  <div className="progress mt-3" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar bg-danger" style={{ width: `${monsterHP}%` }}>
                      {monsterHP}%
                    </div>
                  </div>

                  {isDefeated ? (
                    <p className="mt-3" style={{ color: "red", fontSize: "18px", fontWeight: "bold" }}></p>
                  ) : (
                    <button className="btn btn-danger mt-3" onClick={handleAttack}>🔥 Attack</button>
                  )}
                </div>
              ) : (
                <p>Loading monsters...</p>
              )}
            </div>

            {/* Turn Order */}
            <div className="turn-order" style={{ color: "white" }}>Turn Order</div>

            {/* Player Characters */}
            <div className="player-characters" style={{ color: "white" }}>
              <div className="character" style={{ color: "white" }}>Player 1</div>
              <div className="character" style={{ color: "white" }}>Player 2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Modal show={showModalErrorInstance} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Unknown Instance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button className="w-100" variant="primary" onClick={() => router.push("/stagelist")}>
            Return
          </Button>
        </Modal.Body>
      </Modal>

      {/* Return Modal */}
      <Modal show={showModalReturn} onHide={() => setShowModalReturn(false)} centered>
        <Modal.Header>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-2">
            <Button className="w-50" variant="secondary" onClick={() => setShowModalReturn(false)}>
              Cancel
            </Button>
            <Button className="w-50" variant="danger" onClick={() => handleReturn(instanceID)}>
              Return
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </>
  );
}
