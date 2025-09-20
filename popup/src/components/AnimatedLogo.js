import React, { useState, useEffect } from 'react';

const AnimatedLogo = ({ className = '', size = 'md' }) => {
  const [animationPhase, setAnimationPhase] = useState('leftToRight');

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => prev === 'leftToRight' ? 'rightToLeft' : 'leftToRight');
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Background logo - always visible */}
      <div className="w-full h-full  rounded-lg border-2 flex items-center justify-center backdrop-blur-sm">
        <span className="text-white font-bold text-lg tracking-wider drop-shadow-lg">
          RNS
        </span>
      </div>
      
      {/* Animated overlay rectangles */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {/* Left to Right Animation */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 transition-all duration-1000 ${
            animationPhase === 'leftToRight' 
              ? 'animate-[slideLeftToRight_1s_ease-in-out]' 
              : 'translate-x-full opacity-0'
          }`}
          style={{
            width: '50%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)'
          }}
        />
        
        {/* Right to Left Animation */}
        <div 
          className={`absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent opacity-60 transition-all duration-1000 ${
            animationPhase === 'rightToLeft' 
              ? 'animate-[slideRightToLeft_1s_ease-in-out]' 
              : '-translate-x-full opacity-0'
          }`}
          style={{
            width: '50%',
            right: 0,
            background: 'linear-gradient(270deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)'
          }}
        />
      </div>
      
      {/* Main logo - overlaid on top */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <span className="text-white font-extrabold tracking-[0.2em] drop-shadow-2xl text-shadow-glow">
          RNS
        </span>
      </div>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-white/40 animate-pulse"></div>
    </div>
  );
};

export default AnimatedLogo;