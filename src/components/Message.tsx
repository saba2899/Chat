import "../styles/Message.css";

interface MessageProps {
  nickname?: string;
  text: string;
  system?: boolean;
  isMine?: boolean;
}

export default function Message({
  nickname,
  text,
  system,
  isMine,
}: MessageProps) {
  if (system) {
    return (
      <div className="message system-message">
        <em>{text}</em>
      </div>
    );
  }

  return (
    <div className={`message ${isMine ? "mine" : "other"}`}>
      <div className="message-nick">{isMine ? "You" : nickname}</div>
      <div className="message-text">{text}</div>
    </div>
  );
}
