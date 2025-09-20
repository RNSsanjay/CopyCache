/* global chrome */
import React, { useState, useEffect } from 'react';

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
    <div className="w-[500px] h-screen p-5 bg-black text-white animate-[slideInFromRight_0.4s_ease-out] overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">CopyCache</h1>
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-3">Copied Items</h2>
        {copies.map((copy, index) => (
          <div key={index} className="bg-gray-600 p-2.5 my-1.5 rounded">{copy}</div>
        ))}
      </div>
      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-3">Chat with Gemini</h2>
        <div className="h-50 overflow-y-auto bg-gray-900 p-2.5 rounded mb-2.5">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`my-1.5 p-1.5 rounded ${msg.role === 'user' ? 'bg-gray-500 text-right' : 'bg-gray-800'}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            placeholder="Ask about your copies..."
            className="flex-1 p-2.5 bg-gray-600 text-white border-none rounded"
          />
          <button onClick={handleChat} className="px-4 py-2.5 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-400">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;