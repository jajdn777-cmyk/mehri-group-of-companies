import React from 'react';
import { X, ArrowRight } from 'lucide-react';

export const WatchPromo = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[9000] w-[340px] md:w-[400px] animate-fade-in-up font-sans">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[35px] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group">
        
        {/* Close Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-30 p-2 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all shadow-sm"
        >
          <X size={16} />
        </button>

        <div className="flex gap-5 relative z-10">
           {/* Product Image */}
           <div className="w-24 h-32 rounded-2xl overflow-hidden shadow-lg shrink-0 border border-slate-100 relative">
              <img 
                src="https://images2.imgbox.com/5a/61/KpjySc0u_o.jpeg" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                alt="MEHRI Watch"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
           </div>
           
           {/* Content */}
           <div className="flex-1 flex flex-col justify-center space-y-3">
              <div>
                <h4 className="text-lg font-black uppercase text-slate-900 tracking-tighter leading-none mb-1">Health Mastery.</h4>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                   24/7 Biometric tracking for high-performance living.
                </p>
              </div>
              
              <div className="flex items-baseline gap-2">
                 <span className="text-xl font-black text-emerald-500">Best Value</span>
                 <span className="text-[10px] font-bold text-slate-300 line-through">Huge Savings</span>
              </div>

              <a 
                href="https://www.amazon.com/dp/B0FH4YTQ78?ref=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&ref_=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&social_share=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&titleSource=true&th=1"
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2 group/btn"
                onClick={onClose}
              >
                Shop Now <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform"/>
              </a>
           </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-200 to-transparent opacity-50" />
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};