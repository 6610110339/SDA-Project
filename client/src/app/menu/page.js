"use client";
import { useRouter } from "next/navigation";

export default function Menu() {
  const router = useRouter();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1>Main Menu</h1>
      <button className="btn btn-primary mt-3" onClick={() => router.push("/game")}>
        Start Game
      </button>
    </div>
  );
}
