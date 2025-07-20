import React from "react";
import { useRef ,useEffect} from "react";

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`message p-3 ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
        >
          <div className="fw-bold">{msg.role === 'user' ? 'You:' : 'Bot:'}</div>
          <div className={loading && idx === messages.length - 1 ? 'streaming-cursor' : ''}>
            {msg.content}
          </div>
        </div>
      ))}
      {loading && messages[messages.length - 1]?.role !== 'assistant' && (
        <div className="message p-3 bot-message">
          <div className="fw-bold">Bot:</div>
          <div className="streaming-cursor">Typing...</div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;