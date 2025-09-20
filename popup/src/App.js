/* global chrome */
import React, { useState, useEffect } from 'react';
import ClipboardPage from './pages/clipboard';
import ChatPage from './pages/chat';
import './professional-theme.css';

function App() {
  const [copies, setCopies] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [activeTab, setActiveTab] = useState('clipboard');
  const [isLoading, setIsLoading] = useState(true);
  
  const typewriterMessages = [
    "CopyCache - Smart Clipboard Manager",
    "Manage your clipboard efficiently",
    "Access copied content instantly",
    "AI-powered clipboard assistant",
    "Organize and search your copies"
  ];

  // Continuous typewriter effect with 5-second cycles
  useEffect(() => {
    const currentMessage = typewriterMessages[typewriterIndex];
    
    if (isTyping && typewriterText.length < currentMessage.length) {
      const timeout = setTimeout(() => {
        setTypewriterText(currentMessage.slice(0, typewriterText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else if (typewriterText.length === currentMessage.length) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setTimeout(() => {
          setTypewriterText('');
          setTypewriterIndex((prev) => (prev + 1) % typewriterMessages.length);
          setIsTyping(true);
        }, 1000);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [typewriterText, isTyping, typewriterIndex, typewriterMessages]);

  // Load copies from Windows clipboard
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Load existing copies from storage
        chrome.storage.local.get(['copies'], (result) => {
          if (result.copies) {
            setCopies(result.copies);
          }
          setIsLoading(false);
        });

        // Listen for new copies in real-time
        chrome.storage.onChanged.addListener((changes, namespace) => {
          if (namespace === 'local' && changes.copies) {
            setCopies(changes.copies.newValue || []);
          }
        });
      } else {
        // Fallback when Chrome API is not available
        setCopies([]);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[450px] h-[650px] bg-black/90 text-white flex items-center justify-center border border-white/20 animate-[glowBorder_2s_ease-in-out_infinite_alternate]">
        <div className="text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-300">Loading CopyCache...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-[450px] h-screen bg-black/95 text-white overflow-hidden shadow-2xl animate-[slideInFromRight_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)] border-l-2 border-white/30 animate-[glowBorder_3s_ease-in-out_infinite_alternate]">
      
      {/* Transparent overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
      
      {/* Main Container */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Header with CopyCache logo */}
        <div className="bg-black/80 backdrop-blur-lg border-b border-white/20 p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <img 
                src="/images/copycache.png" 
                alt="CopyCache Logo" 
                className="w-12 h-12 rounded-xl shadow-lg ring-2 ring-white/30 bg-white/10 p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30 hidden">
                <span className="text-black font-bold text-lg">CC</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse border-2 border-black"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">
                <span className="font-mono text-white tracking-wide">
                  {typewriterText}
                  {isTyping && <span className="animate-pulse text-gray-300">|</span>}
                </span>
              </h1>
              <p className="text-gray-300 text-sm font-medium">Smart Clipboard Manager</p>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white/90">{copies.length} items</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with black and white theme */}
        <div className="bg-black/60 backdrop-blur-lg border-b border-white/20">
          <div className="flex relative">
            <button
              onClick={() => handleTabChange('clipboard')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-500 relative group ${
                activeTab === 'clipboard'
                  ? 'text-white bg-gradient-to-b from-white/10 to-transparent'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                  activeTab === 'clipboard' 
                    ? 'border-white bg-white/20 scale-110' 
                    : 'border-gray-400 group-hover:scale-105'
                }`}></div>
                <span className="font-medium">Clipboard</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === 'clipboard' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {copies.length}
                </span>
              </div>
              {activeTab === 'clipboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full animate-[expandWidth_0.4s_ease-out] shadow-lg"></div>
              )}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300"></div>
            </button>
            
            <button
              onClick={() => handleTabChange('chat')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-500 relative group ${
                activeTab === 'chat'
                  ? 'text-white bg-gradient-to-b from-white/10 to-transparent'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                <div className={`w-5 h-5 border-2 rounded-full transition-all duration-300 ${
                  activeTab === 'chat' 
                    ? 'border-white bg-white/20 scale-110' 
                    : 'border-gray-400 group-hover:scale-105'
                }`}></div>
                <span className="font-medium">Assistant</span>
                {chatHistory.length > 0 && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeTab === 'chat' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'bg-white/10 text-gray-300'
                  }`}>
                    {chatHistory.length}
                  </span>
                )}
              </div>
              {activeTab === 'chat' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full animate-[expandWidth_0.4s_ease-out] shadow-lg"></div>
              )}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300"></div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20"></div>
          <div className="relative z-10 h-full">
            {activeTab === 'clipboard' ? (
              <ClipboardPage 
                copies={copies} 
                setCopies={setCopies}
              />
            ) : (
              <ChatPage 
                copies={copies} 
                chatHistory={chatHistory} 
                setChatHistory={setChatHistory}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Animated floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 left-32 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-20 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-8 w-1 h-1 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 left-24 w-1 h-1 bg-white/35 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}

export default App;