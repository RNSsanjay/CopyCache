import React from 'react';

const ChatPage = () => {
  return (
    <div className="h-full flex flex-col animate-[fadeInUp_0.4s_ease-out] bg-black/95 text-white">
      <div className="p-6 flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">AI Assistant</h2>
          <p className="text-gray-300 mb-6">Professional AI chat interface</p>
          <div className="w-16 h-16 border-2 border-white rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;