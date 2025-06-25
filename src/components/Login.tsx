import React, { useState } from "react";
import "../styles/Login.css";

interface LoginProps {
  onLogin: (username: string, token: string) => void;
  onShowRegister: () => void;
}

export default function Login({ onLogin, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("username", data.username);
      localStorage.setItem("justLoggedIn", "true");
      onLogin(data.username, data.token);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 style={{ color: "#1976d2" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: "#2196f3", color: "#fff" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{ color: "#d32f2f", marginTop: 8 }}>{error}</div>}
      </form>
      <div style={{ marginTop: 16 }}>
        <span>Don't have an account? </span>
        <button
          type="button"
          onClick={onShowRegister}
          style={{
            color: "#1976d2",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}
