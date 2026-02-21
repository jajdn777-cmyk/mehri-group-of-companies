
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  isVisible: boolean;
  text: string;
  onDismiss?: () => void;
}

export const Loader = ({ isVisible, text, onDismiss }: LoaderProps) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsExiting(false);
      setShowDismiss(false);
      
      // If loading takes longer than 6 seconds, show manual dismiss
      const dismissTimer = setTimeout(() => {
          setShowDismiss(true);
      }, 6000);
      
      return () => clearTimeout(dismissTimer);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-all duration-700 ${
        isExiting || !isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-white'
      }`}
    >
      <div className="relative flex flex-col items-center gap-14">
        {/* ORBITAL SYSTEM */}
        <div className="relative w-16 h-16 flex items-center justify-center">
            
            {/* 1. Central Text */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
               <span className="text-[8px] font-black text-slate-300 tracking-[0.2em] ml-0.5">
                 LOAD
               </span>
            </div>

            {/* 2. The Track (Static) */}
            <div className="absolute inset-0 rounded-full border-2 border-slate-50"></div>

            {/* 3. The Spinner (Rotates) */}
            <div className="absolute inset-0 animate-spin-slow">
               {/* Mint Trace */}
               <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
                  <path 
                    d="M 50,5 A 45,45 0 0 1 95,50" 
                    fill="none" 
                    stroke="#A7F3D0" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
               </svg>

               {/* Runner - Pinned to the Top */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                  <RunnerSprite />
               </div>
            </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-2 text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-900 animate-pulse leading-relaxed font-sans">
             {text}
          </p>
          <div className="h-0.5 w-12 bg-slate-100 mx-auto rounded-full overflow-hidden">
             <div className="h-full bg-[#A7F3D0] w-1/2 animate-[loading-bar_1.5s_infinite_ease-in-out]" />
          </div>
        </div>

        {/* Emergency Dismiss Button */}
        {showDismiss && onDismiss && (
            <button 
                onClick={onDismiss}
                className="absolute top-32 text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors animate-fade-in border-b border-transparent hover:border-red-500 pb-0.5"
            >
                Taking too long? Tap to Cancel
            </button>
        )}
      </div>

      <style>{`
        .animate-spin-slow {
           animation: spin 1.8s linear infinite;
        }
        @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
        }
        @keyframes loading-bar {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(200%); }
        }

        
      `}</style>
    </div>
  );
};

/**
 * HIGH-FIDELITY ATHLETIC RUNNER (SMOOTH INTERPOLATION)
 */
const RunnerSprite = () => (
  <div className="w-8 h-8 relative">
     <motion.svg
        viewBox="0 0 24 24"
        className="w-full h-full"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ y: [0, -1.5, 0] }}
        transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: "easeInOut"
        }}
     >
        {/* Head */}
        <motion.circle
            cx="14"
            r="2"
            fill="black"
            stroke="none"
            animate={{ cy: [5, 4, 5, 4, 5] }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />

        {/* Torso */}
        <motion.path
            animate={{
                d: [
                    "M13 7 L12 12",
                    "M13 6 L13 11",
                    "M13 7 L12 12",
                    "M13 6 L13 11",
                    "M13 7 L12 12"
                ]
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />

        {/* Right Leg */}
        <motion.path
            animate={{
                d: [
                    "M12 12 L16 16 L18 15", // Ext R
                    "M13 11 L13 16 L12 20", // Mid R
                    "M12 12 L16 15 L18 13", // Ext L (Kick back)
                    "M13 11 L16 13 L15 15", // Mid L (Swing through)
                    "M12 12 L16 16 L18 15"  // Ext R
                ]
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />

        {/* Left Leg */}
        <motion.path
            animate={{
                d: [
                    "M12 12 L9 15 L6 13",  // Ext R (Kick back)
                    "M13 11 L10 13 L11 15", // Mid R (Swing through)
                    "M12 12 L9 15 L6 14",  // Ext L
                    "M13 11 L13 16 L14 20", // Mid L
                    "M12 12 L9 15 L6 13"   // Ext R (Kick back)
                ]
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />

        {/* Left Arm */}
        <motion.path
            animate={{
                d: [
                    "M13 8 L9 10 L10 13", // Ext R (Forward)
                    "M13 7 L11 9 L12 11", // Mid R
                    "M13 8 L9 9 L10 12",  // Ext L (Back)
                    "M13 7 L11 9 L12 11", // Mid L
                    "M13 8 L9 10 L10 13"  // Ext R (Forward)
                ]
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />

        {/* Right Arm */}
        <motion.path
            animate={{
                d: [
                    "M13 8 L16 9 L15 12",  // Ext R (Back)
                    "M13 7 L15 9 L14 11",  // Mid R
                    "M13 8 L16 10 L15 13", // Ext L (Forward)
                    "M13 7 L15 9 L14 11",  // Mid L
                    "M13 8 L16 9 L15 12"   // Ext R (Back)
                ]
            }}
            transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
            }}
        />
     </motion.svg>
  </div>
);
