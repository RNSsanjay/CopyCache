import React from 'react';

const ClipboardPage = ({ copies, setCopies }) => {
  return (
    <div className="h-full flex flex-col animate-[fadeInUp_0.4s_ease-out]">
      <div className="p-6 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
            <h2 className="text-lg font-bold text-white">Clipboard Manager</h2>
            <span className="text-sm text-gray-300 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              {copies.length}/10 items
            </span>
          </div>
        </div>
        
        <div className="h-full overflow-y-auto space-y-4 pb-6">
          {copies.length === 0 ? (
            <div className="text-center py-16 text-gray-300 animate-[fadeIn_0.6s_ease-out]">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-black/20 to-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-[float_4s_ease-in-out_infinite] backdrop-blur-lg border border-white/20 shadow-2xl">
                  <div className="w-12 h-12 border-2 border-white rounded-lg"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No items yet</h3>
                <p className="text-gray-400 mb-6">Copy some text to get started</p>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-3">
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 font-mono text-xs backdrop-blur-sm">Ctrl+C</kbd>
                    <span>to copy text</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <kbd className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 font-mono text-xs backdrop-blur-sm">Win+V</kbd>
                    <span>Windows clipboard access</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {copies.map((copyText, index) => (
                <div 
                  key={index} 
                  className="group bg-gradient-to-br from-black/40 to-white/5 backdrop-blur-lg rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm leading-relaxed break-words font-medium">
                          {copyText.length > 150 ? `${copyText.substring(0, 150)}...` : copyText}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            Just now
                          </span>
                          <span>{copyText.length} chars</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClipboardPage;