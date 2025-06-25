import { useState } from "react";
import "../styles/UserList.css";

interface UserListProps {
  userStatus: { [user: string]: string };
  username: string;
  onLogout: () => void;
}

const statusColors: { [key: string]: string } = {
  online: "#4caf50", // მწვანე
  offline: "#bdbdbd", // ნაცრისფერი
};

export default function UserList({ userStatus, onLogout }: UserListProps) {
  const [open, setOpen] = useState(false);
  const users = Object.keys(userStatus).filter(
    (user) => userStatus[user] === "online"
  );
  return (
    <>
      <button
        className="burger-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open users menu"
      >
        &#9776;
      </button>
      <div className={`user-list-panel${open ? " open" : ""}`}>
        <div className="user-list-header">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
        <h3 className="user-list-title">Users</h3>
        <div className="user-list-scroll">
          {users.length === 0 && (
            <div className="user-list-empty">No users online</div>
          )}
          {users.map((user) => (
            <div className="user-list-item" key={user}>
              <span
                className="user-status-dot"
                style={{
                  background: statusColors[userStatus[user]] || "#bdbdbd",
                }}
                title={userStatus[user]}
              />
              <span className="user-list-name">{user}</span>
              <span className="user-list-status">{userStatus[user]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
