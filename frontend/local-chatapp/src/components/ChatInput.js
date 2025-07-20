"use client";
import React from "react";

const ChatInput = ({ message, setMessage, onSend, onStop, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend();
  };

  return (
    <div className="input-area">
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !message.trim()}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" />
          ) : (
            "Send"
          )}
        </button>
        {loading && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={onStop}
            disabled={!loading}
          >
            Stop
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;