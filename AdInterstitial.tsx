
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2 } from 'lucide-react';

interface AdInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
}

// The high-value asset URL
const AD_ASSET_URL = "https://images2.imgbox.com/79/ae/QtLKXnOG_o.jpeg";

export const AdInterstitial = ({ isOpen, onClose }: AdInterstitialProps) => {
  const [showClose, setShowClose] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 1. PRELOADER: Start fetching the image as soon as the component mounts (even if hidden)
  useEffect(() => {
    const img = new Image();
    img.src = AD_ASSET_URL;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
      // 3-second delay for close button
      const timer = setTimeout(() => setShowClose(true), 3000);
      return () => {
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
      };
    } else {
      setShowClose(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-xl p-4 md:p-8"
        >
          {/* Close Button - Delayed Reveal */}
          <AnimatePresence>
            {showClose && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onClose}
                className="absolute top-6 right-6 md:top-12 md:right-12 p-3 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all shadow-xl z-[10001]"
              >
                <X size={24} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Ad Card */}
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "20vh", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="bg-white rounded-[40px] md:rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] max-w-2xl w-full overflow-hidden relative border border-slate-50 flex flex-col"
          >
            {/* Top Half: Cinematic Image with Loading State */}
            <div className="h-64 md:h-80 relative overflow-hidden bg-slate-100">
              {/* Skeleton Loader (Visible while loading) */}
              <AnimatePresence>
                {!imageLoaded && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-slate-200 z-10"
                  >
                     <div className="flex flex-col items-center gap-3 opacity-50">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Asset...</span>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actual Image */}
              <motion.img
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    opacity: imageLoaded ? 1 : 0 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src={AD_ASSET_URL}
                onLoad={() => setImageLoaded(true)}
                className="w-full h-full object-cover relative z-0"
                alt="Mehri fitness tracker"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20" />
            </div>

            {/* Bottom Half: Premium Content */}
            <div className="p-8 md:p-14 text-center space-y-8 relative z-30">
              <div className="space-y-4">
                <motion.span 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                   className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-[#D4AF37]"
                >
                  Architectural Precision
                </motion.span>
                <motion.h2 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.7 }}
                   className="text-3xl md:text-5xl font-serif text-[#1E3A8A] font-bold tracking-tight uppercase"
                >
                  Affordable Executive Offer
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.9 }}
                   className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed max-w-md mx-auto"
                >
                  Master your health with the precision Mehri fitness tracker. Now syncing with Alma 3.0.
                </motion.p>
              </div>

              <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 1.2 }}
              >
                <a 
                  href="https://www.amazon.com/dp/B0FH4YTQ78?ref=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&ref_=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&social_share=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&titleSource=true&th=1"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-6 bg-[#1E3A8A] text-[#D4AF37] rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.4em] shadow-2xl hover:bg-[#162a63] transition-all flex items-center justify-center gap-4 group"
                >
                  Get It Now <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </a>
              </motion.div>

              <div className="flex justify-center gap-8 opacity-20">
                 <div className="h-px bg-slate-900 flex-1 self-center" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Mehri 2026</span>
                 <div className="h-px bg-slate-900 flex-1 self-center" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
