import { useState, useEffect } from 'react';

interface DogMascotProps {
  variant?: 'happy' | 'excited' | 'sleeping' | 'running';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DogMascot({ variant = 'happy', size = 'md', className = '' }: DogMascotProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transition-transform duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}
        style={{ filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.15))' }}
      >
        {/* Dog body - hand-drawn style */}
        <path
          d="M 50 60 Q 45 55 40 58 Q 35 60 35 65 Q 35 70 40 72 Q 45 74 50 72 Q 55 70 60 72 Q 65 74 70 72 Q 75 70 75 65 Q 75 60 70 58 Q 65 55 60 60 Q 55 65 50 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: '2,1',
            opacity: 0.8,
          }}
        />

        {/* Dog head - sketchy circle */}
        <circle
          cx="50"
          cy="35"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: '3,1',
            opacity: 0.9,
          }}
        />

        {/* Ears - floppy */}
        <path
          d="M 35 30 Q 28 28 25 35 Q 23 40 28 42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={isAnimating ? 'animate-wiggle' : ''}
        />
        <path
          d="M 65 30 Q 72 28 75 35 Q 77 40 72 42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={isAnimating ? 'animate-wiggle' : ''}
        />

        {/* Eyes - happy */}
        {variant === 'happy' && (
          <>
            <circle cx="42" cy="32" r="2" fill="currentColor" />
            <circle cx="58" cy="32" r="2" fill="currentColor" />
          </>
        )}

        {/* Eyes - excited */}
        {variant === 'excited' && (
          <>
            <circle cx="42" cy="32" r="3" fill="currentColor" />
            <circle cx="58" cy="32" r="3" fill="currentColor" />
            {/* Sparkles */}
            <path d="M 38 28 L 39 29 L 38 30 L 37 29 Z" fill="currentColor" opacity="0.6" />
            <path d="M 62 28 L 63 29 L 62 30 L 61 29 Z" fill="currentColor" opacity="0.6" />
          </>
        )}

        {/* Eyes - sleeping */}
        {variant === 'sleeping' && (
          <>
            <path d="M 38 32 Q 42 30 46 32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 54 32 Q 58 30 62 32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Zzz */}
            <text x="65" y="25" fontSize="8" fill="currentColor" opacity="0.5">z</text>
            <text x="68" y="22" fontSize="6" fill="currentColor" opacity="0.5">z</text>
          </>
        )}

        {/* Nose - cute triangle */}
        <path
          d="M 50 40 L 47 43 L 53 43 Z"
          fill="currentColor"
          opacity="0.8"
        />

        {/* Mouth - happy smile */}
        <path
          d="M 44 44 Q 50 48 56 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Tongue - excited variant */}
        {variant === 'excited' && (
          <path
            d="M 49 46 Q 50 50 51 46"
            fill="#FFB6C1"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.8"
          />
        )}

        {/* Legs - sketch style */}
        <path d="M 40 68 L 40 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 48 70 L 48 82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 62 70 L 62 82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 70 68 L 70 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

        {/* Paw pads - cute details */}
        <circle cx="40" cy="82" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="48" cy="84" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="62" cy="84" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="70" cy="82" r="2" fill="currentColor" opacity="0.5" />

        {/* Tail - wagging */}
        <path
          d="M 72 65 Q 80 60 82 55"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
          className={isAnimating ? 'animate-wag' : ''}
        />
      </svg>

      {/* Add wiggle and wag animations */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes wag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.6s ease-in-out;
          transform-origin: center;
        }
        .animate-wag {
          animation: wag 0.4s ease-in-out 3;
          transform-origin: left center;
        }
      `}</style>
    </div>
  );
}

// Paw print decoration component
export function PawPrint({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${sizeClasses[size]} ${className}`}
      style={{ opacity: 0.15 }}
    >
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="4" ry="5" fill="currentColor" />
      {/* Toe pads */}
      <circle cx="7" cy="9" r="2" fill="currentColor" />
      <circle cx="11" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="7" r="2" fill="currentColor" />
      <circle cx="18" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}
