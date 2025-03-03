"use client";

import { useEffect, useState } from "react";
import { Popover, Avatar, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userCharacters, setUserCharacters] = useState(null);
    const [showModalLogout, setShowModalLogout] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            fetchUserInfo(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserInfo = async (token) => {
        try {
            const meResponse = await fetch("http://localhost:1337/api/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!meResponse.ok) throw new Error("Failed to fetch user info");

            const meData = await meResponse.json();

            const fullResponse = await fetch(`http://localhost:1337/api/users/${meData.id}?populate=*`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!fullResponse.ok) throw new Error("Failed to fetch full user info");

            const fullData = await fullResponse.json();
            setUser(fullData);
            setUserCharacters(fullData.character)
        } catch (err) {
            console.error("Error loading user:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/");
    };

    const content = (
        <div style={{ minWidth: "200px" }}>
            {loading ? (
                <p>Loading...</p>
            ) : user ? (
                <>
                    {userCharacters == null ? (
                        <>
                            <p><strong>=== Game Profile ===</strong></p>
                            <p>Select the Class First!</p>
                        </>
                    ) : (
                        <>
                            <p><strong>=== Game Profile ===</strong></p>
                            <p><strong>Level:</strong> {userCharacters.Value_Level}</p>
                            <p><strong>XP:</strong> {userCharacters.Value_XP}/{(userCharacters.Value_Level * 25)}</p>
                            <p><strong>Class:</strong> {userCharacters.Class_Name}</p>
                        </>
                    )}
                    <p><strong>=== User Profile ===</strong></p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role?.name || "N/A"}</p>
                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => { setShowModalLogout(true) }}
                        block
                    >
                        Logout
                    </Button>
                </>
            ) : (
                <p>User not found</p>
            )}
        </div>
    );

    return (
        <div>
            <Popover
                content={content}
                title=""
                trigger="click"
                placement="bottomRight"
            >
                <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: "rgb(105, 105, 105)",
                        cursor: "pointer",
                    }}
                />
            </Popover>
            {/* Logout Modal */}
            <Modal show={showModalLogout} onHide={() => setShowModalLogout(false)} centered>
                <Modal.Header>
                    <Modal.Title>Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex gap-2">
                        <Button className="w-50" variant="secondary" onClick={() => setShowModalLogout(false)}>Cancel</Button>
                        <Button className="w-50" danger type="primary" onClick={() => handleLogout()}>Logout</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
