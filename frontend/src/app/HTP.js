"use client";

import { useEffect, useState } from "react";
import { Popover, Avatar, Button, Input, message, Card } from "antd";
import { UserOutlined, LogoutOutlined, EditOutlined } from "@ant-design/icons";
import { Modal } from "react-bootstrap";

export default function HTP() {
    const [showHTP, setShowHTP] = useState(false);

    return (
        <div>
            <Modal show={true} onHide={() => setShowHTP(false)} centered>
                <Modal.Header
                    style={{
                        borderBottom: "2px solid #f0f0f0",
                        backgroundColor: "#1890ff",
                        color: "white",
                        textAlign: "center",
                    }}
                >
                    <Modal.Title>
                        <i className="fas fa-check-circle" style={{ marginRight: "8px", color: "#fff" }}></i>
                        Confirm Changes
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        fontSize: "16px",
                        color: "#333",
                        textAlign: "center",
                        padding: "30px",
                        borderTop: "1px solid #f0f0f0",
                    }}
                >
                    <Card
                        title="d"
                        variant="borderless"
                        style={{
                            width: "100%",
                            backgroundColor: "rgba(255, 255, 255, 0.5)"
                        }}
                    >
                        <p style={{ height: "5px" }}><strong style={{ color: "darkred" }}>💥 Damage: 0</strong></p>
                    </Card>
                </Modal.Body>
            </Modal>
        </div>
    );
}
