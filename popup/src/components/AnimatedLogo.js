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
      <img 
        src="/images/copynew.png" 
        alt="CopyCache Logo" 
        className="w-full h-full object-contain opacity-30"
      />
      
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
      <img 
        src="/images/copynew.png" 
        alt="CopyCache Logo" 
        className="absolute inset-0 w-full h-full object-contain z-10 drop-shadow-lg"
      />
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-white/20 shadow-lg animate-[glow_2s_ease-in-out_infinite_alternate]" />
    </div>
  );
};

export default AnimatedLogo;