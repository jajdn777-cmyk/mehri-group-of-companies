
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakOverlayProps {
  streak: number;
  userName: string;
  onClose: () => void;
}

const RollingNumber = ({ val }: { val: number }) => {
  const displayVal = val < 10 ? `0${val}` : `${val}`;
  const digits = displayVal.split('');

  return (
    <div className="flex justify-center overflow-hidden h-[100px] md:h-[180px]">
      {digits.map((digit, i) => (
        <div key={i} className="relative w-[50px] md:w-[90px]">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.2 + (i * 0.1)
            }}
            className="flex flex-col items-center"
          >
            <span className="text-6xl md:text-[150px] font-serif text-[#1E3A8A] leading-none select-none font-light">
              {digit}
            </span>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export const StreakOverlay = ({ streak, userName, onClose }: StreakOverlayProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getMessage = () => {
    if (streak === 1) return "THE FIRST STEP TOWARD EXCELLENCE.";
    if (streak === 2) return "CONSISTENCY IS THE FOUNDATION.";
    return "MAINTAINING THE STANDARD OF MOMENTUM.";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center font-sans overflow-hidden p-6"
      >
        {/* Subtle Architectural Background (Ken Burns Effect) */}
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=1200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
          
          {/* Header Mask Reveal */}
          <div className="overflow-hidden mb-2 md:mb-4">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-[9px] md:text-xs font-black uppercase tracking-[0.4em] text-[#D4AF37]"
            >
              Sequence Achievement
            </motion.p>
          </div>

          {/* Rolling Number */}
          <div className="mb-6 md:mb-8">
            <RollingNumber val={streak} />
          </div>

          {/* Prestige Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
            className="w-32 md:w-64 h-[1px] bg-[#D4AF37]/40 mb-8 md:mb-12 origin-center"
          />

          {/* Title Mask Reveal */}
          <div className="overflow-hidden mb-4 md:mb-6">
            <motion.h2
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl md:text-6xl font-serif text-[#1E3A8A] tracking-tight italic"
            >
              Day {streak} Committed
            </motion.h2>
          </div>

          {/* Subtitle Staggered Fade */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1.5 }}
            className="text-slate-400 text-xs md:text-lg font-medium tracking-wide max-w-[280px] md:max-w-md"
          >
            {getMessage()}
          </motion.p>

          {/* Action Button - Elegant Minimalism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="mt-12 md:mt-24"
          >
            <button
              onClick={onClose}
              className="group border border-slate-200 px-10 md:px-12 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 hover:text-[#1E3A8A] hover:border-[#1E3A8A] hover:bg-slate-50 transition-all duration-500 active:scale-95"
            >
              Enter Dashboard
            </button>
          </motion.div>

        </div>

        {/* Framing elements */}
        <div className="absolute top-8 left-8 border-l border-t border-slate-100 w-8 md:w-12 h-8 md:h-12 pointer-events-none opacity-30" />
        <div className="absolute bottom-8 right-8 border-r border-b border-slate-100 w-8 md:w-12 h-8 md:h-12 pointer-events-none opacity-30" />
      </motion.div>
    </AnimatePresence>
  );
};
