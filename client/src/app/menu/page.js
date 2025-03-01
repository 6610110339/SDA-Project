"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import "./menu.css";

export default function MainMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Main Menu - RPG Online</title>
        <meta name="description" content="Welcome to the RPG Online Main Menu" />
      </Head>
      <div className="main-menu-container">
        <div className="menu-card">
          <h1 className="menu-title">RPG Online</h1>
          <div className="menu-buttons">
            <button className="btn btn-primary">Start Game</button>
            <button className="btn btn-secondary">Settings</button>
            <button className="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>
    </>

  );
}
