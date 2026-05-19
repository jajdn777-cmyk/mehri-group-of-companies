
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Shield, FileText, X, Lock, Users, BookOpen, Facebook as FacebookIcon, Instagram as InstagramIcon, Check, Loader2 } from 'lucide-react';
import { MehriLogo } from './Logo.tsx';

const ABOUT_US_CONTENT = `
ABOUT MEHRI GROUP

BUILDING BETTER HEALTH
MEHRI Group is dedicated to democratizing high-level health data. We believe that detailed health analytics shouldn't be restricted to professional laboratories. By combining precision hardware with data-driven insights, we empower individuals to move beyond basic tracking and start improving their health. Our mission is accuracy, accessibility, and absolute privacy.

THE MEHRI VISION
We envision a future where technology doesn't just track you—it understands you. From our headquarters to our worldwide user base, we are building a platform where every heartbeat, every step, and every night of sleep contributes to a clearer picture of your potential. We are building the tools you need to understand your body.

WHAT WE DO
- Hardware Engineering: Creating robust, durable wearables like the Mehri fitness tracker, milled from titanium and sapphire.
- Community Building: Fostering a worldwide network of athletes, health enthusiasts, and everyday achievers committed to self-improvement.

LOCATION & ORIGIN
Headquartered in the heart of San Francisco, CA, we operate at the intersection of biotech and consumer electronics. Born from a desire to close the gap between medical-grade diagnostics and consumer wearables.
`;

const LegalModal = ({ title, content, onClose }: { title: string, content: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="bg-slate-900 border border-slate-800 rounded-[30px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black">
        <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          {title === 'Privacy Policy' ? <Lock size={20} className="text-emerald-500"/> : title === 'About Us' ? <Users size={20} className="text-emerald-500"/> : <FileText size={20} className="text-emerald-500"/>}
          {title}
        </h3>
        <button onClick={onClose} aria-label="Close document" className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20}/></button>
      </div>
      <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-900">
        <div className="prose prose-invert prose-sm max-w-none font-sans leading-relaxed text-slate-300 whitespace-pre-line">
          {content}
        </div>
      </div>
      <div className="p-6 border-t border-slate-800 bg-black flex justify-end">
        <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-colors">
          Close Document
        </button>
      </div>
    </div>
  </div>
);

export const Footer = ({ onNavigate }: any) => {
  const [activeModal, setActiveModal] = useState<'about' | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
        const response = await fetch("https://formspree.io/f/xjgoqgve", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            setFormStatus('success');
            form.reset(); 
        } else {
            alert("There was a problem submitting your form. Please try again.");
            setFormStatus('idle');
        }
    } catch (error) {
        alert("There was a problem submitting your form. Please try again.");
        setFormStatus('idle');
    }
  };

  return (
    <>
      {formStatus === 'success' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white rounded-[40px] p-8 md:p-14 max-w-lg text-center relative shadow-2xl w-full border border-slate-100 flex flex-col items-center animate-scale-in">
                <button onClick={() => setFormStatus('idle')} aria-label="Close confirmation" className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-400 hover:text-slate-900"/>
                </button>
                <div className="w-24 h-24 bg-[#A7F3D0] rounded-full flex items-center justify-center mb-8 text-slate-900 shadow-[0_0_30px_rgba(167,243,208,0.5)] animate-bounce-slow">
                    <Check size={48} strokeWidth={4} />
                </div>
                <h3 className="text-4xl font-black uppercase text-slate-900 mb-4 tracking-tighter">Thank You</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                    Your message has been sent to the MEHRI development team. We will respond shortly.
                </p>
                <button onClick={() => setFormStatus('idle')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-500 hover:text-slate-900 transition-all shadow-xl active:scale-95">
                    Close Confirmation
                </button>
            </div>
        </div>,
        document.body
      )}

      <footer className="bg-black text-white pt-20 border-t border-slate-900 font-sans relative overflow-hidden">
        {activeModal === 'about' && (
          <LegalModal 
            title="About Us" 
            content={ABOUT_US_CONTENT} 
            onClose={() => setActiveModal(null)} 
          />
        )}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-emerald-900/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-8 pb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20 bg-slate-900/50 p-10 rounded-[40px] border border-slate-800 backdrop-blur-sm">
             <div className="space-y-2 text-center md:text-left">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Secure Your Tracker</h3>
                <p className="text-slate-400 text-sm font-medium">Limited stock available for the 2026 release batch.</p>
             </div>
             <a 
               href="https://www.amazon.com/dp/B0FH4YTQ78?ref=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&ref_=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&social_share=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&titleSource=true&th=1"
               target="_blank" 
               rel="noopener noreferrer"
               className="px-10 py-5 bg-white text-black rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)]"
             >
               Get on Amazon <ArrowRight size={16} />
             </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-b border-slate-900 pb-20">
             <div className="lg:col-span-4 space-y-8">
                <div className="flex items-center gap-4">
                   <MehriLogo size="lg" className="brightness-0 invert" />
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                   Mehri is the main platform for performance tracking. Powered by the Mehri fitness tracker technology.
                </p>
                <div className="space-y-4 pt-2">
                   <a 
                      href="https://medium.com/@shamsullah.mehri/beyond-the-step-counter-the-new-rules-of-personal-health-monitoring-ee7f3d27d5a9"
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                   >
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/50 transition-colors shrink-0">
                         <BookOpen size={14} className="text-emerald-500"/>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide leading-tight">Read Latest Insights</span>
                   </a>
                   <a 
                      href="https://www.facebook.com/p/MEHRI-Group-Of-Companies-61578019483578/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                   >
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 transition-colors shrink-0">
                         <FacebookIcon size={14} className="text-blue-500"/>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide leading-tight">Join the Community</span>
                   </a>
                   <a 
                      href="https://www.instagram.com/mehrigroupofcompanies" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                   >
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-pink-500/50 transition-colors shrink-0">
                         <InstagramIcon size={14} className="text-pink-500"/>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide leading-tight">Follow on Instagram</span>
                   </a>
                </div>
             </div>
             <div className="lg:col-span-3 space-y-8">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">Product</h4>
                <ul className="space-y-4">
                   <li><a href="https://www.amazon.com/dp/B0FH4YTQ78?ref=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&ref_=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&social_share=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&titleSource=true&th=1" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">Mehri fitness tracker</a></li>
                   <li><a href="https://apps.apple.com/us/app/runmefit/id1541334057" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">App Store (iOS)</a></li>
                   <li><a href="https://play.google.com/store/apps/details?id=com.runmefit.wear" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">Google Play (Android)</a></li>
                </ul>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600 pt-4">Support</h4>
                <ul className="space-y-4">
                   <li><button onClick={() => setActiveModal('about')} className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">About Us</button></li>
                   <li><a href="mailto:jajdn777@gmail.com" className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">Contact Support</a></li>
                </ul>
             </div>
             <div className="lg:col-span-5 bg-slate-900/30 p-8 rounded-[30px] border border-slate-900/50 backdrop-blur-md">
                <h4 className="text-lg font-black uppercase tracking-tight text-white mb-2">Contact Us</h4>
                <p className="text-slate-500 text-xs mb-6">Direct line to the MEHRI development team.</p>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="name" placeholder="Name" className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600" required />
                      <input type="email" name="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600" required />
                   </div>
                   <textarea name="message" rows={3} placeholder="How can we help?" className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-none" required></textarea>
                   <button type="submit" disabled={formStatus === 'submitting'} className="w-full bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {formStatus === 'submitting' ? <Loader2 size={16} className="animate-spin"/> : 'Send Message'}
                   </button>
                </form>
             </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                © 2026 MEHRI Group. Powered by Mehri fitness tracker Technology.
             </p>
             <div className="flex gap-8">
                <button onClick={() => onNavigate('privacy')} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                   <Shield size={12}/> Privacy Policy
                </button>
                <button onClick={() => onNavigate('terms')} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                   <FileText size={12}/> Terms of Service
                </button>
             </div>
          </div>
        </div>
      </footer>
    </>
  );
};
