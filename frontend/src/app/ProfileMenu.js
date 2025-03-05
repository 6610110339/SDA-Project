"use client";

import { useEffect, useState } from "react";
import { Popover, Avatar, Button, Input, message } from "antd";
import { UserOutlined, LogoutOutlined, EditOutlined } from "@ant-design/icons";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userCharacters, setUserCharacters] = useState(null);
    const [showModalLogout, setShowModalLogout] = useState(false); // State to show logout confirmation
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // File is only set here, not uploaded yet
    const [previewImage, setPreviewImage] = useState(null); // Holds image preview but not the actual update
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
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!meResponse.ok) throw new Error("Failed to fetch user info");
            const meData = await meResponse.json();

            const fullResponse = await fetch(`http://localhost:1337/api/users/${meData.id}?populate=*`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!fullResponse.ok) throw new Error("Failed to fetch full user info");
            const fullData = await fullResponse.json();

            setUser(fullData);
            setUserCharacters(fullData.character);
            setNewUsername(fullData.username);
            setNewEmail(fullData.email);
        } catch (err) {
            console.error("Error loading user:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/"); // Redirect to the home page after logout
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        // Only show the preview, not update the user yet
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setPreviewImage(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEditProfile = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return message.error("No auth token found!");

        try {
            let uploadedImageId = null;

            // Step 1: Upload New Profile Picture (if selected)
            if (selectedFile) {
                const imageFormData = new FormData();
                imageFormData.append("files", selectedFile);

                const imageResponse = await fetch("http://localhost:1337/api/upload", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: imageFormData,
                });

                if (!imageResponse.ok) throw new Error("Failed to upload profile picture");

                const imageData = await imageResponse.json();
                uploadedImageId = imageData[0]?.id;
            }

            // Step 2: Update User Profile
            const profileData = {
                username: newUsername,
                email: newEmail,
                ...(uploadedImageId && { Profilepicture: uploadedImageId }),
            };

            const response = await fetch(`http://localhost:1337/api/users/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            const updatedUser = await response.json();
            setUser(updatedUser);
            setShowModalEdit(false);
            message.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            message.error(err.message);
        }
    };

    const profilePictureUrl = user?.Profilepicture?.url;

    const content = (
        <div style={{ minWidth: "200px", fontFamily: "Arial, sans-serif" }}>
            {loading ? (
                <p>Loading...</p>
            ) : user ? (
                <>
                    {userCharacters == null ? (
                        <>
                            <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                                <span role="img" aria-label="game">🎮</span> <strong>=== Game Profile ===</strong>
                            </p>
                            <p>Select the Class First! <span role="img" aria-label="selection">⚔️</span></p>
                        </>
                    ) : (
                        <>
                            <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                                <span role="img" aria-label="game">🎮</span> <strong>=== Game Profile ===</strong>
                            </p>
                            <p><strong>Class:</strong> {userCharacters.Class_Name} <span role="img" aria-label="class">🛡️</span></p>
                            <p><strong>Level:</strong> {userCharacters.Value_Level} <span role="img" aria-label="level">📈</span></p>
                            <p><strong>Coins:</strong> {userCharacters.Value_Coins} <span role="img" aria-label="coins">💰</span></p>
                            <p><strong>XP:</strong> {userCharacters.Value_XP}/{(userCharacters.Value_Level * 15)} <span role="img" aria-label="xp">💪</span></p>
                        </>
                    )}
                    <p style={{ fontWeight: "bold", fontSize: "16px" }}>
                        <span role="img" aria-label="user">👤</span> <strong>=== User Profile ===</strong>
                    </p>
                    <p><strong>Username:</strong> {user.username} <span role="img" aria-label="username">👨‍💻</span></p>
                    <p><strong>Email:</strong> {user.email} <span role="img" aria-label="email">📧</span></p>
                    <p><strong>Role:</strong> {user.role?.name || "N/A"} <span role="img" aria-label="role">💼</span></p>

                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        style={{ backgroundColor: "#1890ff", color: "white", marginBottom: "10px", fontWeight: "bold" }}
                        onClick={() => setShowModalEdit(true)}
                        block
                    >
                        <span role="img" aria-label="edit">✏️</span> Edit Profile
                    </Button>

                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => setShowModalLogout(true)} // Show logout confirmation modal
                        block
                        style={{ backgroundColor: "#ff4d4f", color: "white", fontWeight: "bold" }}
                    >
                        <span role="img" aria-label="logout">🚪</span> Logout
                    </Button>
                </>
            ) : (
                <p>User not found <span role="img" aria-label="error">⚠️</span></p>
            )}
        </div>
    );

    return (
        <div>
            <Popover content={content} title="" trigger="click" placement="bottomRight">
                <Avatar
                    size="large"
                    src={previewImage || (profilePictureUrl ? `http://localhost:1337${profilePictureUrl}` : undefined)}
                    icon={!profilePictureUrl && <UserOutlined />}
                    style={{ backgroundColor: "rgb(105, 105, 105)", cursor: "pointer" }}
                />
            </Popover>

            {/* Edit Profile Modal */}
            <Modal show={showModalEdit} onHide={() => setShowModalEdit(false)} centered>
                <Modal.Header
                    style={{
                        borderBottom: "2px solid #f0f0f0",
                        backgroundColor: "#1890ff",
                        color: "white",
                        textAlign: "center",
                    }}
                >
                    <Modal.Title>
                        <i className="fas fa-edit" style={{ marginRight: "8px", color: "#fff" }}></i>
                        Edit Your Profile
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        fontSize: "16px",
                        color: "#333",
                        padding: "30px",
                        borderTop: "1px solid #f0f0f0",
                    }}
                >
                    {/* Username Input Section */}
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            htmlFor="username"
                            style={{
                                fontSize: "14px",
                                color: "#333",
                                fontWeight: "bold",
                                marginBottom: "8px",
                                display: "block",
                            }}
                        >
                            Username
                        </label>
                        <Input
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            style={{
                                borderRadius: "20px",
                                fontSize: "14px",
                                padding: "10px",
                            }}
                        />
                    </div>

                    {/* Email Input Section */}
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            htmlFor="email"
                            style={{
                                fontSize: "14px",
                                color: "#333",
                                fontWeight: "bold",
                                marginBottom: "8px",
                                display: "block",
                            }}
                        >
                            User Email
                        </label>
                        <Input
                            id="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                            style={{
                                borderRadius: "20px",
                                fontSize: "14px",
                                padding: "10px",
                            }}
                        />
                    </div>

                    {/* Upload Profile Picture Section */}
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            htmlFor="profilePicture"
                            style={{
                                fontSize: "14px",
                                color: "#333",
                                fontWeight: "bold",
                                marginBottom: "8px",
                                display: "block",
                            }}
                        >
                            Profile Picture
                        </label>
                        <input
                            id="profilePicture"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{
                                borderRadius: "10px",
                                padding: "5px",
                                fontSize: "14px",
                            }}
                        />

                        {/* Show Image Preview (only shows selected image, not actual update) */}
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                    marginTop: "10px",
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid #f0f0f0",
                                }}
                            />
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        borderTop: "1px solid #f0f0f0",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => setShowModalEdit(false)}
                        style={{
                            backgroundColor: "#f0f0f0",
                            color: "#1890ff",
                            borderRadius: "20px",
                            padding: "8px 20px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setShowConfirmation(true)} // Show confirmation modal
                        style={{
                            backgroundColor: "#1890ff",
                            color: "#fff",
                            borderRadius: "20px",
                            padding: "8px 20px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirmation Modal */}
            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
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
                    <p>Are you sure you want to save the changes?</p>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        borderTop: "1px solid #f0f0f0",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => setShowConfirmation(false)}
                        style={{
                            backgroundColor: "#f0f0f0",
                            color: "#1890ff",
                            borderRadius: "20px",
                            padding: "8px 20px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleEditProfile();  // Save the profile changes
                            setShowConfirmation(false);  // Close the confirmation modal
                        }}
                        style={{
                            backgroundColor: "#1890ff",
                            color: "#fff",
                            borderRadius: "20px",
                            padding: "8px 20px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal show={showModalLogout} onHide={() => setShowModalLogout(false)} centered>
                <Modal.Header
                    style={{
                        backgroundColor: "#ff4d4f",  // Red background color
                        color: "white",
                        textAlign: "center",
                    }}
                >
                    <Modal.Title>
                        <i className="fas fa-sign-out-alt" style={{ marginRight: "8px", color: "#fff" }}></i>
                        Confirm Logout
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        fontSize: "16px",
                        color: "#333",
                        padding: "30px",
                        borderTop: "1px solid #f0f0f0",
                    }}
                >
                    <p style={{ color: "#ff4d4f" }}>Are you sure you want to log out?</p>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        borderTop: "1px solid #f0f0f0",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => setShowModalLogout(false)}
                        style={{
                            backgroundColor: "#f0f0f0",
                            color: "#1890ff",
                            borderRadius: "20px",
                            padding: "8px 20px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"  // Red color for the logout button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: "#ff4d4f",  // Red background color
                            color: "#fff",
                            borderRadius: "20px",
                            padding: "8px 20px",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
