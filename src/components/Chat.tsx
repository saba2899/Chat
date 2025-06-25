import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";
import EmojiPickerReact, { type EmojiClickData } from "emoji-picker-react";
import UserList from "./UserList";

import "../styles/Chat.css";

interface ChatProps {
  username: string;
  token: string;
  onLogout: () => void;
}

const SESSION_TIMEOUT = 5 * 60 * 1000;

type MessageType = {
  id?: string;
  nickname?: string;
  text?: string;
  image?: string;
  system?: boolean;
  readBy?: string[];
};

export default function Chat({ username, token, onLogout }: ChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userStatus, setUserStatus] = useState<{ [user: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const lastActive = localStorage.getItem("lastActive");
    const now = Date.now();
    if (lastActive && now - parseInt(lastActive, 10) > SESSION_TIMEOUT) {
      onLogout();
      return;
    }
  }, [onLogout]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;
    const justLoggedIn = localStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      localStorage.removeItem("justLoggedIn");
    }
    if (username && username.trim() !== "") {
      socket.emit("join", username);
    } else {
      console.warn("Username is empty, not emitting join");
    }

    socket.on("message", (msg: MessageType) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("userStatus", (statusObj) => {
      setUserStatus(statusObj || {});
    });
    socket.on("messageRead", ({ msgId, user }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? { ...msg, readBy: [...(msg.readBy || []), user] }
            : msg
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token, username]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    localStorage.setItem("lastActive", Date.now().toString());
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const updateLastActive = () => {
      localStorage.setItem("lastActive", Date.now().toString());
    };
    window.addEventListener("beforeunload", updateLastActive);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") updateLastActive();
    });

    return () => {
      window.removeEventListener("beforeunload", updateLastActive);
      window.removeEventListener("visibilitychange", updateLastActive);
    };
  }, []);

  const addEmoji = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    const socket = socketRef.current;
    if (!socket) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        socket.emit("chatMessage", { image: data.fileUrl, nickname: username });
      } catch (error) {
        console.error("ფოტოს ატვირთვა ვერ მოხერხდა:", error);
      }
      setSelectedFile(null);
    } else {
      socket.emit("chatMessage", { text: input, nickname: username });
    }
    setInput("");
    setShowPicker(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    messages.forEach((msg) => {
      if (
        msg.id &&
        msg.nickname !== username &&
        !(msg.readBy || []).includes(username)
      ) {
        socket.emit("messageRead", msg.id);
      }
    });
  }, [messages, username]);

  return (
    <div style={{ display: "flex", height: "90vh", background: "#e3f2fd" }}>
      <UserList userStatus={userStatus} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ color: "#1976d2", textAlign: "center" }}>
          Welcome, {username}!
        </h2>

        <div className="chat-box" style={{ background: "#bbdefb" }}>
          {messages.map((msg) => {
            const isMine = msg.nickname === username;
            return (
              <div
                key={msg.id || `${msg.text}-${Math.random()}`}
                className={`message ${isMine ? "mine" : "other"} ${
                  msg.system ? "system-message" : ""
                }`}
                style={{ background: isMine ? "#90caf9" : "#e3f2fd" }}
              >
                {!msg.system && (
                  <div className="message-nick" style={{ color: "#1976d2" }}>
                    {isMine ? "You" : msg.nickname || "Unknown"}
                    {msg.readBy && msg.readBy.includes(username) && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#388e3c",
                          fontSize: 12,
                        }}
                      >
                        (Read)
                      </span>
                    )}
                  </div>
                )}
                {msg.system ? (
                  <em>{msg.text}</em>
                ) : msg.image ? (
                  <div
                    className={`image-wrapper ${
                      isMine ? "mine-image" : "other-image"
                    }`}
                  >
                    <img
                      src={msg.image}
                      alt="Chat image"
                      className="chat-image"
                    />
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="chat-form">
          <button
            type="button"
            onClick={() => setShowPicker((val) => !val)}
            className="emoji-button"
            title="Emoji picker"
            style={{ color: "#1976d2" }}
          >
            😀
          </button>
          {showPicker && (
            <div className="emoji-picker-container">
              <EmojiPickerReact onEmojiClick={addEmoji} />
            </div>
          )}
          <textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            required={!selectedFile}
            className="chat-input"
            style={{
              resize: "none",
              overflow: "hidden",
              background: "#e3f2fd",
              color: "#1976d2",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="file-upload-label"
            title="Upload image"
            style={{ color: "#1976d2" }}
          >
            ��
          </label>
          <button
            type="submit"
            className="send-button"
            title="Send"
            style={{ background: "#1976d2", color: "#fff" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "30px", height: "30px" }}
            >
              <line x1="2" y1="12" x2="13" y2="12" />
              <polygon points="13 2 22 12 13 22 13 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
