import React, { useEffect, useState } from "react";
import { Button, ListGroup, Spinner } from "react-bootstrap";

const Sidebar = ({ chats, onNewChat, onSelectChat, selectedChatId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleChatSelect = async (id) => {
    setIsLoading(true);
    try {
      await onSelectChat(id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 border-end vh-100 bg-light" style={{ width: "280px" }}>
      <Button 
        variant="dark" 
        className="w-100 mb-3" 
        onClick={onNewChat}
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" /> : "New Chat"}
      </Button>
      <ListGroup>
        {chats.map((chat) => (
          <ListGroup.Item
            key={chat.id}
            action
            active={chat.id === selectedChatId}
            onClick={() => handleChatSelect(chat.id)}
            disabled={isLoading}
          >
            <div className="d-flex justify-content-between">
              <span className="text-truncate">{chat.title}</span>
              {isLoading && chat.id === selectedChatId && (
                <Spinner size="sm" className="ms-2" />
              )}
            </div>
            <small className="text-muted d-block">
              {new Date(chat.created_at).toLocaleString()}
            </small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;