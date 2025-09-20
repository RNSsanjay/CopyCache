/* global chrome */
import React, { useState } from 'react';

const ClipboardPage = ({ copies, setCopies }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopyClick = async (copyText, index) => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDeleteCopy = (indexToDelete) => {
    const newCopies = copies.filter((_, index) => index !== indexToDelete);
    setCopies(newCopies);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ copies: newCopies });
    }
  };

  const clearClipboard = () => {
    setCopies([]);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ copies: [] });
    }
  };

  const filteredCopies = copies.filter(copy => 
    copy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimeAgo = (index) => {
    const minutesAgo = index * 2;
    if (minutesAgo === 0) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  };

  const handleItemClick = (copyText, index) => {
    setSelectedItem({ text: copyText, index });
  };

  const handleShare = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CopyCache Item',
          text: text
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="h-full flex flex-col animate-[fadeInUp_0.4s_ease-out]">
      <div className="p-6 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
            <h2 className="text-lg font-bold text-white">Clipboard Manager</h2>
            <span className="text-sm text-gray-300 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              {copies.length}/100 items
            </span>
          </div>
          {copies.length > 0 && (
            <button 
              onClick={clearClipboard}
              className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              Clear All
            </button>
          )}
        </div>

        {copies.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your clipboard..."
                className="w-full p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all duration-300 shadow-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="h-full overflow-y-auto space-y-4 pb-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {filteredCopies.length === 0 ? (
            <div className="text-center py-16 text-gray-300 animate-[fadeIn_0.6s_ease-out]">
              {copies.length === 0 ? (
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
              ) : (
                <div className="py-8">
                  <p className="text-lg font-medium text-white mb-2">No matches found</p>
                  <p className="text-gray-400">Try a different search term</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCopies.map((copyText, index) => (
                <div 
                  key={index} 
                  className="group bg-gradient-to-br from-black/40 to-white/5 backdrop-blur-lg rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl animate-[slideInFromBottom_0.4s_ease-out] hover:scale-[1.02] cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleItemClick(copyText, index)}
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
                            {formatTimeAgo(index)}
                          </span>
                          <span>{copyText.length} chars</span>
                          {copyText.startsWith('http') && (
                            <span className="bg-white/10 px-2 py-1 rounded-full border border-white/20">URL</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyClick(copyText, index);
                          }}
                          className={`p-2.5 rounded-lg transition-all duration-300 border ${
                            copiedIndex === index
                              ? 'bg-white text-black border-white shadow-lg'
                              : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-110'
                          }`}
                          title="Copy to clipboard"
                        >
                          <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCopy(index);
                          }}
                          className="p-2.5 rounded-lg bg-black/20 text-gray-300 border border-white/20 hover:bg-black/40 hover:text-white hover:border-white/40 transition-all duration-300 hover:scale-110"
                          title="Delete item"
                        >
                          <div className="w-4 h-4 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-0.5 bg-current"></div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-lg rounded-2xl border border-white/20 p-6 m-4 max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl animate-[slideInFromBottom_0.4s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Clipboard Item Details</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <div className="w-5 h-5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-current rotate-45"></div>
                    <div className="w-4 h-0.5 bg-current -rotate-45"></div>
                  </div>
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="bg-black/40 border border-white/20 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <p className="text-white text-sm leading-relaxed break-words whitespace-pre-wrap">
                {selectedItem.text}
              </p>
            </div>

            {/* Info */}
            <div className="flex items-center gap-4 mb-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                {formatTimeAgo(selectedItem.index)}
              </span>
              <span>{selectedItem.text.length} characters</span>
              {selectedItem.text.startsWith('http') && (
                <span className="bg-white/10 px-2 py-1 rounded-full border border-white/20">URL</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  handleCopyClick(selectedItem.text, selectedItem.index);
                  setSelectedItem(null);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
                <span className="text-sm font-medium">Copy</span>
              </button>

              <button
                onClick={() => {
                  handleShare(selectedItem.text);
                  setSelectedItem(null);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <div className="w-4 h-4 border-2 border-current rounded-full"></div>
                <span className="text-sm font-medium">Share</span>
              </button>

              <button
                onClick={() => {
                  const newWindow = window.open('', '_blank');
                  newWindow.document.write(`<pre style="font-family: monospace; padding: 20px; background: #000; color: #fff;">${selectedItem.text}</pre>`);
                  setSelectedItem(null);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <div className="w-4 h-4 border-2 border-current rounded"></div>
                <span className="text-sm font-medium">View</span>
              </button>

              <button
                onClick={() => {
                  handleDeleteCopy(selectedItem.index);
                  setSelectedItem(null);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-black/20 text-gray-300 border border-white/20 rounded-xl hover:bg-black/40 hover:text-white hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <div className="w-4 h-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-0.5 bg-current"></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClipboardPage;