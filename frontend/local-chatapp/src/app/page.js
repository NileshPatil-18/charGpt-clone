"use client";
import React, { useState, useEffect, useCallback } from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import "@/styles/global.css"

const Page = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Fetch initial chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/chats");
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    fetchChats();
  }, []);

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [eventSource]);

  const handleNewChat = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }), // Temporary title
    });

    if (!res.ok) throw new Error("Failed to create chat");

    const data = await res.json();
    const newChat = {
      id: data.id,
      title: data.title, // This will be "New Chat" initially
      date: new Date().toLocaleString(),
      messages: [],
    };

    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  } catch (err) {
    console.error("Error creating chat:", err);
    alert("Failed to create chat. Please try again.");
  }
};

  const handleSelectChat = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${id}/messages`);
      if (!res.ok) throw new Error("Failed to load chat");
      const data = await res.json();
      setMessages(data);
      setCurrentChatId(id);
    } catch (err) {
      console.error("Error selecting chat:", err);
      alert("Failed to load chat messages.");
    }
  }, []);

const handleSend = async () => {
  if (!message.trim() || !currentChatId || loading) return;

  if (eventSource) {
    eventSource.close();
    setEventSource(null);
  }

  
  
  const isFirstMessage = messages.length === 0;
  
  const userMessage = { role: "user", content: message };
  setMessages((prev) => [...prev, userMessage]);
  
  // If this is the first message in the chat, update the title
  if (isFirstMessage) {
    const newTitle = message.length >10? `${message.substring(0, 30)}...` : message;
    
try {
    const updateResponse = await fetch(`http://localhost:5000/api/chat/${currentChatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (updateResponse.ok) {
      const updatedChat = await updateResponse.json();
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChatId ? { ...chat, title: updatedChat.title} : chat
        )
      );
    } else {
      console.error("Failed to update title:", await updateResponse.text());
    }
  } catch (err) {
    console.error("Error updating chat title:", err);
  }
}

  setMessage("");
  setLoading(true);

  try {
    // Close previous connection if exists
    

    const newEventSource = new EventSource(
      `http://localhost:5000/api/chat/${currentChatId}/message/stream?content=${encodeURIComponent(message)}`
    );
    setEventSource(newEventSource);

    let assistantMessage = { 
      role: "assistant", 
      content: "",
      tempId: Date.now() // Unique ID for this message
    };

    newEventSource.onmessage = (event) => {
  if (event.data === "[DONE]" || event.data === "[ABORTED]") {
    newEventSource.close();
    setLoading(false);
    return;
  }

      try {
        // Append new tokens to the assistant's message
        assistantMessage.content += event.data;

        // Update the messages array
        setMessages((prev) => {
          // Check if assistant message already exists
          const existingIdx = prev.findIndex(m => m.tempId === assistantMessage.tempId);
          
          if (existingIdx >= 0) {
            // Update existing message
            const updated = [...prev];
            updated[existingIdx] = { ...assistantMessage };
            return updated;
          } else {
            // Add new message
            return [...prev, assistantMessage];
          }
        });
      } catch (err) {
        console.error("Error processing message:", err);
      }
    };

    newEventSource.onerror = () => {
      console.error("SSE Error");
      newEventSource.close();
      setLoading(false);
    };

  } catch (err) {
    console.error("Error:", err);
    setLoading(false);
  }
};

const handleStop = async () => {
  if (!currentChatId || !loading) return;

  try {
    // Close the SSE connection
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    // Send stop request to backend
    await fetch(`http://localhost:5000/api/chat/${currentChatId}/stop`, {
      method: 'POST',
    });

    setLoading(false);
  } catch (err) {
    console.error('Error stopping generation:', err);
    setLoading(false);
  }
};


 return (
    <div className="chat-container">
      <div className="sidebar">
        <button 
          className="btn btn-primary new-chat-btn"
          onClick={handleNewChat}
        >
          New Chat
        </button>
        <div className="chat-list">
          {chats.map((chat) => (
            <div 
              key={chat.id}
              className={`p-3 border-bottom ${currentChatId === chat.id ? 'bg-light' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="chat-title">{chat.title}</div>
              <div className="chat-date">{chat.date}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-area">
        <ChatWindow messages={messages} loading={loading} />
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSend}
          onStop={handleStop}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Page;