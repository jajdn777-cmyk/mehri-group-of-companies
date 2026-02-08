import React, { useEffect, useState } from 'react';
import { Trophy, X, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalCelebration = ({ goal, onClose }: { goal: any, onClose: () => void }) => {
  const [stage, setStage] = useState<'hidden' | 'pop' | 'text'>('hidden');

  useEffect(() => {
    // Lock scroll to prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    const popTimer = setTimeout(() => setStage('pop'), 100);
    const textTimer = setTimeout(() => {
        setStage('text');
        triggerConfetti();
    }, 800);

    return () => {
       document.body.style.overflow = 'unset';
       clearTimeout(popTimer);
       clearTimeout(textTimer);
    }
  }, []);

  const triggerConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;

    (function frame() {
      // Launch confetti from multiple angles for full screen effect
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#A7F3D0', '#ffffff'],
        zIndex: 100000
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#A7F3D0', '#ffffff'],
        zIndex: 100000
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <div 
      className="fixed inset-0 !z-[99999] bg-slate-950/95 backdrop-blur-3xl animate-fade-in flex items-center justify-center p-4"
      onClick={onClose}
    >
        {/* Radial Gradient Background for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors z-[100000] p-4 bg-white/5 rounded-full hover:bg-white/10 backdrop-blur-md"
        >
          <X size={32} />
        </button>
        
        {/* Content Container - Scrollable/Centered */}
        <div 
          className="w-full max-w-4xl relative z-[100001] flex flex-col items-center justify-center text-center max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()} 
        >
            {/* The Trophy */}
            <div className={`relative transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${stage === 'pop' || stage === 'text' ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-20'} flex flex-col items-center shrink-0`}>
                {/* Glow Effect Behind Trophy */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-[600px] md:h-[600px] bg-yellow-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
                
                <div className={`relative ${stage === 'text' ? 'animate-bounce-slow' : ''}`}>
                    <Trophy 
                        className="text-yellow-400 drop-shadow-[0_0_60px_rgba(250,204,21,0.8)] relative z-10 w-32 h-32 md:w-[320px] md:h-[320px]" 
                        fill="#FACC15" 
                    />
                    {/* Floating Stars */}
                    <Star size={40} className="absolute -top-10 -right-10 text-white animate-spin-slow w-10 h-10 md:w-[80px] md:h-[80px] drop-shadow-[0_0_20px_white]" fill="white" />
                    <Star size={32} className="absolute bottom-4 -left-16 text-emerald-400 animate-pulse w-8 h-8 md:w-[60px] md:h-[60px] drop-shadow-[0_0_20px_#34D399]" fill="#34D399" />
                    <Star size={24} className="absolute top-0 -left-8 text-yellow-200 animate-ping-slow w-6 h-6 md:w-[40px] md:h-[40px]" fill="#FEF08A" />
                </div>
            </div>

            {/* Text Reveal */}
            <div className={`space-y-6 md:space-y-12 mt-8 md:mt-20 transition-all duration-1000 delay-300 transform ${stage === 'text' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} w-full`}>
                <h2 className="text-4xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                    GOAL <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight">CRUSHED!</span>
                </h2>
                
                <div className="bg-white/5 rounded-[40px] p-6 md:p-12 border border-white/10 backdrop-blur-xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-emerald-400 mb-4">Achievement Unlocked</p>
                    <p className="text-xl md:text-5xl text-white font-black uppercase tracking-tight leading-tight line-clamp-2">{goal?.title || 'Custom Goal'}</p>
                </div>

                <div className="pt-8 md:pt-12 pb-12">
                    <button 
                        onClick={onClose} 
                        className="bg-white text-slate-950 px-12 py-5 md:px-24 md:py-8 rounded-full font-black uppercase text-[10px] md:text-base tracking-[0.3em] hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95 ring-4 ring-white/10"
                    >
                        Collect Badge
                    </button>
                </div>
            </div>
        </div>
        
        <style>{`
           .animate-bounce-slow { animation: bounce 3s infinite ease-in-out; }
           .animate-spin-slow { animation: spin 6s linear infinite; }
           .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
           @keyframes spin { 100% { transform: rotate(360deg); } }
           @keyframes bounce {
             0%, 100% { transform: translateY(-5%); }
             50% { transform: translateY(0); }
           }
        `}</style>
    </div>
  );
};