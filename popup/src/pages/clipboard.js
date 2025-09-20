/* global chrome */
import React, { useState } from 'react';

const ClipboardPage = ({ copies, setCopies }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopyClick = async (copyItem, index) => {
    try {
      const text = typeof copyItem === 'string' ? copyItem : copyItem.text;
      await navigator.clipboard.writeText(text);
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

  const filteredCopies = copies.filter(copy => {
    const text = typeof copy === 'string' ? copy : copy.text;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTimeAgo = (copyItem, index) => {
    if (typeof copyItem === 'object' && copyItem.timestamp) {
      const now = Date.now();
      const diff = now - copyItem.timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
    
    // Fallback for old format
    const minutesAgo = index * 2;
    if (minutesAgo === 0) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  };

  const getContentType = (copyItem) => {
    if (typeof copyItem === 'object' && copyItem.type) {
      return copyItem.type.toUpperCase();
    }
    return 'TEXT';
  };

  const getContentTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'url': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'email': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'phone': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'number': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'code': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'longtext': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleItemClick = (copyItem, index) => {
    const text = typeof copyItem === 'string' ? copyItem : copyItem.text;
    setSelectedItem({ text, index });
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
              {filteredCopies.map((copyItem, index) => {
                const text = typeof copyItem === 'string' ? copyItem : copyItem.text;
                const type = getContentType(copyItem);
                const typeColor = getContentTypeColor(type);
                
                return (
                  <div 
                    key={typeof copyItem === 'object' ? copyItem.id : index} 
                    className="group bg-gradient-to-br from-black/40 to-white/5 backdrop-blur-lg rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl animate-[slideInFromBottom_0.4s_ease-out] hover:scale-[1.02] cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleItemClick(copyItem, index)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm leading-relaxed break-words font-medium">
                            {text.length > 150 ? `${text.substring(0, 150)}...` : text}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              {formatTimeAgo(copyItem, index)}
                            </span>
                            <span>{text.length} chars</span>
                            <span className={`px-2 py-1 rounded-full border text-xs font-medium ${typeColor}`}>
                              {type}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyClick(copyItem, index);
                            }}
                            className={`p-2.5 rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95 ${
                              copiedIndex === index 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
                            }`}
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCopy(index);
                            }}
                            className="p-2.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Delete item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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