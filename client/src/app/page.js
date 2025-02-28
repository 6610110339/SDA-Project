"use client";

import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setSuccess("Login successful!");
      console.log("Login successful:", data);
      // Store token if needed
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundImage: "url('/bg_login_day.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <main 
        className="card p-4 shadow-sm w-25" 
        style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(10px)" }}
      >
        <h2 className="text-center mb-3">Welcome!</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </main>
    </div>
  );
}