import React, { useEffect, useState } from 'react';

interface LoaderProps {
  isVisible: boolean;
  text: string;
}

export const Loader = ({ isVisible, text }: LoaderProps) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsExiting(false);
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

        .runner-frame {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 0;
            animation: run-cycle 0.6s steps(1) infinite;
        }
        
        .frame-1 { animation-name: frame-1; }
        .frame-2 { animation-name: frame-2; }
        .frame-3 { animation-name: frame-3; }
        .frame-4 { animation-name: frame-4; }

        @keyframes frame-1 { 0% { opacity: 1; } 25% { opacity: 0; } }
        @keyframes frame-2 { 0% { opacity: 0; } 25% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes frame-3 { 0% { opacity: 0; } 50% { opacity: 1; } 75% { opacity: 0; } }
        @keyframes frame-4 { 0% { opacity: 0; } 75% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};

/**
 * HIGH-FIDELITY ATHLETIC RUNNER - UPDATED
 * Straightened stride for more natural look.
 */
const RunnerSprite = () => (
  <div className="w-8 h-8 relative">
     {/* FRAME 1: EXTENSION */}
     <svg viewBox="0 0 24 24" className="frame-1 runner-frame" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="5" r="2" fill="black" stroke="none" /> {/* Head Forward */}
        <path d="M13 7 L12 12" /> {/* Torso */}
        <path d="M12 12 L16 16 L18 15" /> {/* Right Leg Forward Extension */}
        <path d="M12 12 L9 15 L6 13" /> {/* Left Leg Kick Back */}
        <path d="M13 8 L9 10 L10 13" /> {/* Left Arm Forward */}
        <path d="M13 8 L16 9 L15 12" /> {/* Right Arm Back */}
     </svg>

     {/* FRAME 2: MID-STANCE RIGHT */}
     <svg viewBox="0 0 24 24" className="frame-2 runner-frame" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="4" r="2" fill="black" stroke="none" />
        <path d="M13 6 L13 11" />
        <path d="M13 11 L13 16 L12 20" /> {/* Right Leg Planted */}
        <path d="M13 11 L10 13 L11 15" /> {/* Left Leg Swing Through */}
        <path d="M13 7 L11 9 L12 11" />
        <path d="M13 7 L15 9 L14 11" />
     </svg>

     {/* FRAME 3: EXTENSION LEFT */}
     <svg viewBox="0 0 24 24" className="frame-3 runner-frame" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="5" r="2" fill="black" stroke="none" />
        <path d="M13 7 L12 12" />
        <path d="M12 12 L9 15 L6 14" /> {/* Left Leg Forward Extension */}
        <path d="M12 12 L16 15 L18 13" /> {/* Right Leg Kick Back */}
        <path d="M13 8 L16 10 L15 13" /> {/* Right Arm Forward */}
        <path d="M13 8 L9 9 L10 12" /> {/* Left Arm Back */}
     </svg>

     {/* FRAME 4: MID-STANCE LEFT */}
     <svg viewBox="0 0 24 24" className="frame-4 runner-frame" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="4" r="2" fill="black" stroke="none" />
        <path d="M13 6 L13 11" />
        <path d="M13 11 L13 16 L14 20" /> {/* Left Leg Planted */}
        <path d="M13 11 L16 13 L15 15" /> {/* Right Leg Swing Through */}
        <path d="M13 7 L15 9 L14 11" />
        <path d="M13 7 L11 9 L12 11" />
     </svg>
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-slate-100 relative overflow-hidden rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
  </div>
);