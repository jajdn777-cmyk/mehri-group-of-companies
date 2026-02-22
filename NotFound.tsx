import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Frown } from 'lucide-react';

interface NotFoundProps {
  onNavigate: (v: string) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Detect login status using localStorage
    const checkIsLoggedIn = () => {
      try {
        const keys = Object.keys(localStorage);
        // Supabase stores tokens in keys like sb-xxxxxxxxxxxx-auth-token
        return keys.some(key => key.includes('auth-token') && !!localStorage.getItem(key));
      } catch {
        return false;
      }
    };

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    const redirectTimer = setTimeout(() => {
      if (checkIsLoggedIn()) {
        onNavigate('main-dashboard');
      } else {
        onNavigate('landing');
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [onNavigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCFCFC] selection:bg-emerald-100">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full"
      >
        <div className="mb-8 relative flex justify-center">
          <div className="w-24 h-24 bg-[#A7F3D0]/30 rounded-[32px] flex items-center justify-center border border-emerald-100 shadow-sm relative z-10">
            <Frown size={42} className="text-emerald-500" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />
        </div>

        <h1 className="text-7xl font-black text-slate-900 mb-2 tracking-tighter leading-none">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Page Not Found</h2>

        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          Oops! That path doesn't exist. <br/>
          We'll take you home in <span className="text-emerald-500 font-extrabold">{countdown}s</span>.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
              const keys = Object.keys(localStorage);
              const isLoggedIn = keys.some(key => key.includes('auth-token') && !!localStorage.getItem(key));
              onNavigate(isLoggedIn ? 'main-dashboard' : 'landing');
          }}
          className="w-full py-5 bg-[#A7F3D0] text-emerald-900 rounded-[24px] font-black uppercase text-[11px] tracking-[0.3em] shadow-sm hover:bg-emerald-300 transition-colors"
        >
          Go Back Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
