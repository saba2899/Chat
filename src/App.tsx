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
      <Chat
        username={user.username}
        token={user.token}
        onLogout={handleLogout}
      />
    </>
  );
}
