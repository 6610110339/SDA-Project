"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Alert } from 'antd';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            setSuccess("Login successful!");
            setIsLoggedIn(true);
            router.push("/menu");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("http://localhost:1337/api/auth/local", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error.message);
            }

            localStorage.setItem("authToken", data.jwt);

            setSuccess("Login successful!");
            setIsLoggedIn(true);

            setTimeout(() => {
                router.push("/menu");
            }, 1000);
        } catch (err) {
            setError("Login failed: " + err.message);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                backgroundImage: "url('/bg_login_day.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <main
                className="card shadow-lg border-0 p-4"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "20px",
                    color: "#fff",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                }}
            >
                <h2
                    className="text-center mb-4"
                    style={{
                        fontWeight: "bold",
                        fontSize: "32px",
                    }}
                >
                    🌅 Welcome!
                </h2>

                {error && (
                    <Alert message={error} type="error" showIcon />
                )}
                {success && (
                    <Alert message={success} type="success" showIcon />
                )}

                {!isLoggedIn && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                                Username:
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="form-control"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: "12px",
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">
                                Password:
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: "12px",
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            style={{
                                padding: "12px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                borderRadius: "12px",
                            }}
                        >
                            Login
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}

