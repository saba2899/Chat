import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [user, setUser] = useState<{ username: string; token: string } | null>(
    null
  );
  const [showRegister, setShowRegister] = useState(false);

  // გვერდის ჩატვირთვისას ვამოწმებთ სესიას
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }
  }, []);

  // გვერდის დახურვის/განახლებისას ბოლო აქტივობის დრო შეინახე
  useEffect(() => {
    const updateLastActive = () => {
      if (user) {
        localStorage.setItem("lastActive", Date.now().toString());
      }
    };

    window.addEventListener("beforeunload", updateLastActive);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") updateLastActive();
    });

    return () => {
      window.removeEventListener("beforeunload", updateLastActive);
      window.removeEventListener("visibilitychange", updateLastActive);
    };
  }, [user]);

  const handleLogin = (username: string, token: string) => {
    const userObj = { username, token };
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("justLoggedIn", "true");
    setShowRegister(false);
  };

  const handleRegister = (username: string, token: string) => {
    handleLogin(username, token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActive");
    localStorage.removeItem("chatMessages");
  };

  if (!user) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          color: "#1976d2",
          fontWeight: 500,
          background: "#e3f2fd",
          borderRadius: 8,
          padding: "6px 16px",
          boxShadow: "0 2px 8px rgba(33,150,243,0.08)",
        }}
      >
        Logged in as <b>{user.username}</b>
        <button
          onClick={handleLogout}
          style={{
            marginLeft: 16,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
      <Chat
        username={user.username}
        token={user.token}
        onLogout={handleLogout}
      />
    </>
  );
}
