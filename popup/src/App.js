/* global chrome */
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [copies, setCopies] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Load copies from storage
    chrome.storage.local.get(['copies'], (result) => {
      if (result.copies) {
        setCopies(result.copies);
      }
    });
  }, []);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', content: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage, copies })
      });
      const data = await response.json();
      setChatHistory([...newHistory, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="app">
      <h1>CopyCache</h1>
      <div className="copies">
        <h2>Copied Items</h2>
        {copies.map((copy, index) => (
          <div key={index} className="copy-item">{copy}</div>
        ))}
      </div>
      <div className="chat">
        <h2>Chat with Gemini</h2>
        <div className="chat-history">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleChat()}
          placeholder="Ask about your copies..."
        />
        <button onClick={handleChat}>Send</button>
      </div>
    </div>
  );
}

export default App;