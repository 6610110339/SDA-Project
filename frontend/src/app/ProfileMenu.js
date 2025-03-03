"use client";

import { useEffect, useState } from "react";
import { Popover, Avatar, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (token) {
            fetchUserInfo(token);
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

            const fullResponse = await fetch(`http://localhost:1337/api/users/${meData.id}?populate=role`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!fullResponse.ok) throw new Error("Failed to fetch full user info");

            const fullData = await fullResponse.json();
            setUser(fullData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        router.push("/");
    };

    const content = (
        <div style={{ minWidth: "200px" }}>
            {user ? (
                <>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role?.name || "N/A"}</p>
                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        block
                    >
                        Logout
                    </Button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );

    return (
        <div>
            <Popover
                content={content}
                title="Profile"
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
        </div>
    );
}

