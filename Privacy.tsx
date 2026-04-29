
import React from 'react';
import { ArrowLeft, Shield, Lock, Database, Globe, Eye, Server } from 'lucide-react';
import { MehriLogo } from './Logo.tsx';
import { PRIVACY_POLICY } from './constants.ts';

export const PrivacyView = ({ onNavigate }: any) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 animate-fade-in">
      {/* Simple Header */}
      <div className="fixed top-0 left-0 right-0 h-24 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12 border-b border-slate-100">
         <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('landing')} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors group">
               <ArrowLeft size={24} className="text-slate-400 group-hover:text-slate-900"/>
            </button>
            <MehriLogo size="sm" />
         </div>
         <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
            <Lock size={14}/> Secure Policy
         </div>
      </div>

      <div className="pt-40 pb-32 px-6 max-w-4xl mx-auto">
         <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-6">Data & Privacy</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
               At MEHRI Group, your biological data is treated with the highest priority. We don't sell it. We secure it.
            </p>
         </div>

         <div className="prose prose-slate max-w-none text-slate-600 font-serif leading-relaxed whitespace-pre-line">
            {PRIVACY_POLICY}
         </div>

         <div className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            Last Updated: January 2026 • San Francisco, CA • MEHRI Global Compliance
         </div>
      </div>
    </div>
  );
};
