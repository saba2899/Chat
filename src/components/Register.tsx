import React, { useState } from "react";
import "../styles/Login.css";

interface RegisterProps {
  onRegister: (username: string, token: string) => void;
  onShowLogin: () => void;
}

export default function Register({ onRegister, onShowLogin }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (
      !username ||
      !firstName ||
      !lastName ||
      !birthDate ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }), // TODO: backend განახლების შემდეგ დაამატე სხვა ველებიც
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("username", data.username);
      localStorage.setItem("justLoggedIn", "true");

      localStorage.setItem("token", data.token);

      onRegister(data.username, data.token);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 style={{ color: "#1976d2" }}>Register</h2>
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
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Birth Date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 12,
              top: 10,
              cursor: "pointer",
              color: "#1976d2",
              userSelect: "none",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 12,
              top: 10,
              cursor: "pointer",
              color: "#1976d2",
              userSelect: "none",
            }}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: "#2196f3", color: "#fff" }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <div style={{ color: "#d32f2f", marginTop: 8 }}>{error}</div>}
      </form>
      <button
        type="button"
        onClick={onShowLogin}
        style={{
          marginTop: "10px",
          background: "none",
          border: "none",
          color: "#1976d2",
          cursor: "pointer",
          textDecoration: "underline",
          fontSize: "16px",
        }}
      >
        ← Back
      </button>
    </div>
  );
}
