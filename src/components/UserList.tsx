import "../styles/UserList.css";

interface UserListProps {
  userStatus: { [user: string]: string };
}

const statusColors: { [key: string]: string } = {
  online: "#4caf50", // მწვანე
  offline: "#bdbdbd", // ნაცრისფერი
};

export default function UserList({ userStatus }: UserListProps) {
  const users = Object.keys(userStatus).filter(
    (user) => userStatus[user] === "online"
  );
  return (
    <div className="user-list-panel">
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
  );
}
