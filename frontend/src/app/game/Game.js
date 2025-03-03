"use client";

import { useEffect, useState, } from "react";
import { useRouter, usePathname } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Button, Modal } from "react-bootstrap";
import { Flex } from 'antd';
import "../globals.css";

export default function Game() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [userCharacters, setUserCharacters] = useState(null);
  const [showModalReturn, setShowModalReturn] = useState(false);
  const [showModalErrorInstance, setShowModalErrorInstance] = useState(false);
  const [stage, setStage] = useState(null);
  const [instanceID, setInstanceID] = useState(null);

  const [currentTurn, setCurrentTurn] = useState("👤 Player");
  const [charactersDamage, setCharactersDamage] = useState(20);
  const [charactersHP, setCharactersHP] = useState(20);
  const [charactersMaxHP, setCharactersMaxHP] = useState(20);
  const [isCharactersDefeated, setIsCharactersDefeated] = useState(false);
  const [monsterList, setMonsterList] = useState([]);
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [monsterHP, setMonsterHP] = useState(100);
  const [isMonsterDefeated, setIsMonsterDefeated] = useState(false);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [isCharacterHit, setIsCharacterHit] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const baseStyle = {
    width: '100%',
    height: 54,
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

    const selectStage = localStorage.getItem("selectStage");
    setStage(`Stage ${selectStage}`);
    const instanceID = localStorage.getItem("instanceID");
    setInstanceID(instanceID);

    const fetchUserRole = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/users/me?populate=*", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setUserData(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUserCharacters(userData.character);
        setUserRole(userData.role.name);

        /////////////
        setCharactersDamage((Number(userData.character.Value_Level) * 2) + 1);
        setCharactersMaxHP((Number(userData.character.Value_Level) * 10) + 5);
        setCharactersHP((Number(userData.character.Value_Level) * 10) + 5);
        setIsCharactersDefeated(false);
        /////////////
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
        const monsters = data.data[0].MonsterData;

        setMonsterList(monsters);
        if (monsters.length > 0) {
          setMonsterHP(monsters[0].health);
        }
      } catch (error) {
        console.error("Error fetching monster data:", error);
      }
    };

    fetchMonsterData();
    fetchUserRole();

    if (!selectStage || !instanceID) {
      setShowModalErrorInstance(true);
      return;
    };

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
      localStorage.removeItem("userData");
      router.push("/stagelist");
    } catch (error) {
      console.error("Error removing active stage:", error);
    }
  };

  const handlePlayerAttack = () => {
    const monster_hurt = new Audio("/sounds/monster_hurt.mp3");
    if (monsterHP >= 0) {
      setMonsterHP(monsterHP - charactersDamage);
      setIsMonsterHit(true);
      setTimeout(() => {
        setIsMonsterHit(false);
      }, 300);
      monster_hurt.volume = 0.25
      monster_hurt.play()
      setCurrentTurn("☠️ Monster")
      if ((monsterHP - charactersDamage) <= 0) {
        setIsMonsterDefeated(true);
        if (currentMonsterIndex < monsterList.length - 1) {
          setTimeout(() => {
            setIsMonsterDefeated(false);
            setCurrentMonsterIndex(currentMonsterIndex + 1);
            setMonsterHP(monsterList[currentMonsterIndex + 1].health);
          }, 1000);
        } else {
          setIsEnded(true);
          setTimeout(() => {
            const instanceID = localStorage.getItem("instanceID");
            handleReturn(instanceID);
          }, 3000);
          return;
        }
      }
      setTimeout(() => {
        handleMonsterAttack();
      }, 1000)
    }
  };

  const handleMonsterAttack = () => {
    const player_hurt = new Audio("/sounds/player_hurt.mp3");
    if (charactersHP >= 0) {
      setCharactersHP(charactersHP - monsterList[currentMonsterIndex].damage);
      setIsCharacterHit(true);
      setTimeout(() => {
        setIsCharacterHit(false);
      }, 300);
      player_hurt.volume = 0.25
      player_hurt.play()
      setCurrentTurn("👤 Player")
      if ((charactersHP - monsterList[currentMonsterIndex].damage) <= 0) {
        setIsCharactersDefeated(true);
        setIsEnded(true);
        setTimeout(() => {
          const instanceID = localStorage.getItem("instanceID");
          handleReturn(instanceID);
        }, 3000);
      }
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm" fixed="top">
        <Container>
          <Navbar.Brand className="fw-bold">
            {stage} (#{instanceID}) - Wave: {currentMonsterIndex + 1}/{monsterList.length}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
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
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            padding: "20px",
            borderRadius: "1rem",
          }}>

          <Flex gap="middle" vertical>
            <Flex direction="row">
              {Array.from({
                length: 4,
              }).map((_, i) => (
                <div
                  key={i}
                  data-index={i}
                  style={{
                    ...baseStyle,
                    backgroundColor: i % 2 ? 'rgb(255, 255, 255, 0.0)' : 'rgba(0, 0, 0, 0.0)',
                  }}
                >
                  {i === 0 ? (
                    <div>
                      <h2 style={{ fontSize: "16px", color: "black" }}>🔹 Current Turn: {currentTurn}</h2>
                    </div>
                  ) : i === 1 ? (
                    <div>
                      <div>
                        <div className="battle-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "100vh", color: "white", textAlign: "center", padding: "20px" }}>
                          {charactersHP >= 0 ? (
                            <div style={{ textAlign: "center" }}>
                              {isCharactersDefeated ? (
                                <h3 style={{ fontSize: "24px", color: "black" }}>Character Defeated!</h3>
                              ) : (
                                <>
                                  <h2 style={{ fontSize: "24px", color: "black" }}>Your Character (Lv. {userData?.character.Value_Level ?? "???"})</h2>
                                  <img
                                    className={isCharacterHit ? "monster-hit" : ""}
                                    src={`/Characters/SwordMan.png`}
                                    style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }}
                                  />
                                  <div className="progress" style={{ width: "300px", height: "18px", backgroundColor: "#333", borderRadius: "5px", margin: "10px auto", position: "relative" }}>
                                    <div className="progress-bar bg-danger"
                                      style={{
                                        width: `${(charactersHP / charactersMaxHP) * 100}%`,
                                        height: "100%",
                                        borderRadius: "5px"
                                      }}>
                                      <span style={{ fontSize: "14px", position: "absolute", width: "100%", textAlign: "center", fontWeight: "bold" }}>
                                        {charactersHP} / {charactersMaxHP}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <h3 style={{ fontSize: "24px", color: "black" }}>You Lost!</h3>
                          )}
                          {currentTurn === "👤 Player" && !isEnded ? (
                            <div style={{ position: "absolute", bottom: "20px", display: "flex", gap: "15px" }}>
                              <button className="btn btn-danger" onClick={() => { handlePlayerAttack() }} style={{ padding: "10px 20px", fontSize: "18px", borderRadius: "10px" }}>⚔️ Attack</button>
                              <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "18px", borderRadius: "10px" }}>🌀 Skill</button>
                            </div>
                          ) : ("")}
                        </div>
                      </div>
                    </div>
                  ) : i === 3 ? (
                    <div>
                      <div>
                        <div className="battle-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "100vh", color: "white", textAlign: "center", padding: "20px" }}>
                          {monsterList.length > 0 && (!isEnded || charactersHP <= 0) ? (
                            <div style={{ textAlign: "center" }}>
                              {isMonsterDefeated ? (
                                <h3 style={{ fontSize: "24px", color: "black" }}>Monster Defeated! Prepare for next wave!</h3>
                              ) : (
                                <>
                                  <h2 style={{ fontSize: "24px", color: "black" }}>{monsterList[currentMonsterIndex].name} (Lv. {monsterList[currentMonsterIndex].level})</h2>
                                  <img
                                    className={isMonsterHit ? "monster-hit" : ""}
                                    src={`/Monster/${monsterList[currentMonsterIndex].id}.png`}
                                    style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px", }}
                                  />
                                  <div className="progress" style={{ width: "300px", height: "18px", backgroundColor: "#333", borderRadius: "5px", margin: "10px auto", position: "relative" }}>
                                    <div className="progress-bar bg-danger"
                                      style={{
                                        width: `${(monsterHP / monsterList[currentMonsterIndex]?.health) * 100}%`,
                                        height: "100%",
                                        borderRadius: "5px"
                                      }}>
                                      <span style={{ fontSize: "14px", position: "absolute", width: "100%", textAlign: "center", fontWeight: "bold" }}>
                                        {monsterHP} / {monsterList[currentMonsterIndex]?.health}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <h3 style={{ fontSize: "24px", color: "black" }}>You Won!</h3>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </Flex>
          </Flex>

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
