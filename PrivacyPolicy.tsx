
import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import { MehriLogo } from './Logo.tsx';
import { PRIVACY_POLICY } from './constants.ts';

export const PrivacyPolicy = ({ onNavigate }: any) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    // Check if there is history to go back to (user navigated within app)
    // window.history.state is usually non-null if we used pushState
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: If user landed directly here or refreshed, go to landing
      onNavigate('landing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 animate-fade-in selection:bg-emerald-500/30">
      <div className="fixed top-0 left-0 right-0 h-24 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12 border-b border-slate-800">
         <div className="flex items-center gap-6">
            <button onClick={handleBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors group">
               <ArrowLeft size={24} className="text-slate-400 group-hover:text-white"/>
            </button>
            <div onClick={() => onNavigate('landing')} className="cursor-pointer">
                <MehriLogo size="sm" />
            </div>
         </div>
         <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-900/50">
            <Lock size={14}/> Secure Policy
         </div>
      </div>

      <div className="pt-40 pb-32 px-6 max-w-4xl mx-auto">
         <div className="mb-16 border-l-4 border-emerald-500 pl-6">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Privacy Policy</h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
               At MEHRI Group, your biological data is treated as high-value currency. We protect it with military-grade encryption and never sell it.
            </p>
         </div>

         <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-serif leading-relaxed whitespace-pre-line">
            {PRIVACY_POLICY}
         </div>

         <div className="mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
            Last Updated: January 2026 • San Francisco, CA • MEHRI Global Compliance<br/>
            Legal Contact: <a href="mailto:shamsullah.mehri@gmail.com" className="text-emerald-500 hover:text-emerald-400 transition-colors">shamsullah.mehri@gmail.com</a>
         </div>
      </div>
    </div>
  );
};
