
import React, { useEffect } from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { MehriLogo } from './Logo.tsx';
import { TERMS_OF_SERVICE } from './constants.ts';

export const TermsOfService = ({ onNavigate }: any) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    // Check if there is history to go back to (user navigated within app)
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
            <Scale size={14}/> User Agreement
         </div>
      </div>

      <div className="pt-40 pb-32 px-6 max-w-4xl mx-auto">
         <div className="mb-16 border-l-4 border-emerald-500 pl-6">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Terms of Service</h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
               Governing usage of the MEHRI ecosystem, GTL-1 hardware, and AI-powered nutrition insights.
            </p>
         </div>

         <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-serif leading-relaxed whitespace-pre-line">
            {TERMS_OF_SERVICE}
         </div>

         <div className="mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
            Last Updated: January 2026 • San Francisco, CA • MEHRI Legal Division<br/>
            Inquiries: <a href="mailto:jajdn777@gmail.com" className="text-emerald-500 hover:text-emerald-400 transition-colors">jajdn777@gmail.com</a>
         </div>
      </div>
    </div>
  );
};
