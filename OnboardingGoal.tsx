
import React from 'react';
import { Target, Zap, Activity, Heart } from 'lucide-react';

export const OnboardingGoalSection = ({ onComplete }: any) => {
  const goals = [
      { id: 'Weight Loss', icon: Zap, desc: 'Burn fat efficiently' },
      { id: 'Muscle Gain', icon: Activity, desc: 'Build strength & mass' },
      { id: 'Endurance', icon: Target, desc: 'Go further, longer' },
      { id: 'Vitality', icon: Heart, desc: 'Health & longevity' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-[#A7F3D0] z-[6000] animate-fade-in font-sans overflow-y-auto">
        <div className="min-h-full w-full flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-6xl relative z-10 flex flex-col justify-center">
                <div className="text-center mb-8 md:mb-16 space-y-4 pt-10 md:pt-0">
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">Pick a Goal</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Define your 2026 trajectory</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-10">
                    {goals.map(g => (
                    <button 
                        key={g.id} 
                        onClick={() => onComplete(g.id)} 
                        className="group relative h-[200px] md:h-[300px] bg-white/60 backdrop-blur-sm border border-white/60 hover:border-slate-900 rounded-[30px] md:rounded-[40px] p-6 md:p-8 flex flex-col justify-between text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <g.icon size={20} className="md:w-6 md:h-6" />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-1 md:mb-2">{g.id}</h3>
                            <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest group-hover:text-slate-600">{g.desc}</p>
                        </div>

                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Background Glow */}
        <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </div>
  );
};
