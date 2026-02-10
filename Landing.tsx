
import React, { useEffect, useRef, useState } from 'react';
import { Target, Users, Brain, Eraser, LineChart, MessageSquare, ArrowRight, HelpCircle, ChevronDown, Trophy, Activity, Check, Smartphone } from 'lucide-react';
import { Footer } from './Footer.tsx';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// --- PREMIUM ANIMATION COMPONENTS ---

const StaggeredText = ({ text, className = "", delayStart = 0, withUnderline = false }: { text: string, className?: string, delayStart?: number, withUnderline?: boolean }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delayStart * i }
    })
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 50, // Start slightly lower
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2em" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className={`inline-block ${withUnderline ? 'relative' : ''}`}>
          {word}
          {withUnderline && (
             <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 right-0 h-2 bg-emerald-400 rounded-full origin-left"
             />
          )}
        </motion.span>
      ))}
    </motion.div>
  );
};

const ScrollReveal = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CountUpStat = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView || !ref.current) return;
    
    let startTime: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.floor(ease * end);
      if (ref.current) ref.current.textContent = current.toLocaleString() + suffix;

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

// --- SECTION COMPONENTS ---

const WhatWeDoSection = () => (
  <section className="relative py-24 md:py-32 bg-white overflow-hidden">
     {/* Ambient Background */}
     <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent opacity-60" />
     </div>

     <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
           <motion.span 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block"
           >
              The Ecosystem
           </motion.span>
           <motion.h2 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none"
           >
              What We Do
           </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
           {/* Column 1: Tracking */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             whileHover={{ y: -10 }}
             className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] group"
           >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                 <Activity size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-900">Universal Tracking</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 Mehri Fitness helps people track workouts, recovery, and health trends across devices.
              </p>
           </motion.div>

           {/* Column 2: Hardware (Highlighted) */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             whileHover={{ y: -10 }}
             className="bg-slate-900 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-colors" />
              
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 backdrop-blur-md">
                 <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-white">Biometric Hardware</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                 Users can train using just their phone or pair the GTL-1 smartwatch for deeper biometric insights.
              </p>
           </motion.div>

           {/* Column 3: AI */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
             whileHover={{ y: -10 }}
             className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] group"
           >
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                 <Brain size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-900">Neural Intelligence</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 All supported by Alma AI guidance to interpret your physiological data.
              </p>
           </motion.div>
        </div>
     </div>
  </section>
);

const KeyFeaturesSection = () => (
  <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 bg-slate-50 rounded-[40px] md:rounded-[60px] my-12 md:my-20 border border-slate-100 shadow-sm">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
        <div className="space-y-4 px-4">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-emerald-500 mb-4">
              <Activity size={24} />
           </div>
           <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">Personalized Biometric Analytics</h3>
           <p className="text-sm text-slate-500 leading-relaxed font-medium">
              We decode your physiological signals. From HRV to SpO2, every data point is analyzed to tailor your recovery and performance strategy.
           </p>
        </div>
        <div className="space-y-4 px-4 border-l-0 md:border-l border-slate-200">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-emerald-500 mb-4">
              <Brain size={24} />
           </div>
           <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">AI-Powered Health Insights</h3>
           <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Alma isn't just a chatbot. It's a neural engine that turns complex health data into simple, actionable advice for longevity and peak condition.
           </p>
        </div>
        <div className="space-y-4 px-4 border-l-0 md:border-l border-slate-200">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-emerald-500 mb-4">
              <Users size={24} />
           </div>
           <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">GTL-1 Wearable Integration</h3>
           <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Seamlessly sync with our flagship hardware. The GTL-1 Smartwatch provides the high-fidelity sensor data that powers the entire MEHRI ecosystem.
           </p>
        </div>
     </div>
     <div className="mt-12 text-center border-t border-slate-200 pt-8 max-w-2xl mx-auto px-4">
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
           Mehri Fitness analyzes heart rate, HRV, sleep, SpO₂, and activity data. Data availability depends on connected devices and usage patterns.
        </p>
     </div>
  </section>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div layout className="border-b border-slate-200 last:border-0 overflow-hidden">
       <motion.button layout onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex items-center justify-between text-left focus:outline-none group">
          <span className="text-base md:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors pr-4">{question}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
             <ChevronDown className="text-slate-400 shrink-0 group-hover:text-emerald-500 transition-colors" />
          </motion.div>
       </motion.button>
       {isOpen && (
         <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="pb-6"
         >
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{answer}</p>
         </motion.div>
       )}
    </motion.div>
  );
};

const FAQSection = () => (
  <section className="max-w-4xl mx-auto px-6 md:px-8 mb-20 md:mb-32">
     <div className="text-center mb-8 md:mb-12 space-y-2">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 flex items-center justify-center gap-3">
           <HelpCircle size={28} className="text-emerald-500 md:w-8 md:h-8"/> FAQ
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Common Questions</p>
     </div>
     <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-xl border border-slate-100 p-6 md:p-12">
        <FAQItem 
           question="Does Mehri Fitness work without the GTL-1?" 
           answer="Yes. You can use Mehri Fitness with just your smartphone to track workouts, log meals, and access Alma coaching. The GTL-1 is optional hardware for automated biometric data like continuous heart rate and sleep tracking." 
        />
        <FAQItem 
           question="Is the GTL-1 compatible with iOS and Android?" 
           answer="Yes, the GTL-1 Smartwatch features universal compatibility. It syncs seamlessly via Bluetooth 5.3 to the Mehri app on both iOS and Android platforms." 
        />
        <FAQItem 
           question="Is this a medical device?" 
           answer="No. Mehri Fitness and the GTL-1 are wellness tools designed for recreational use, training, and performance tracking. They are not medical devices and should not be used to diagnose or treat medical conditions." 
        />
        <FAQItem 
           question="Is my biometric data secure?" 
           answer="Yes. We prioritize your privacy. Biometric data is encrypted locally on the device and during transmission to ensure your personal health information remains secure." 
        />
        <FAQItem 
           question="What is the battery life of the GTL-1?" 
           answer="The GTL-1 is engineered for endurance, boasting an intelligent 14-day battery life on a single charge under typical usage conditions." 
        />
     </div>
  </section>
);

const StrongCommunitySection = () => (
  <section className="relative h-[600px] w-full max-w-[95%] mx-auto rounded-[60px] flex items-center justify-center overflow-hidden my-20 shadow-2xl">
     <div className="absolute inset-0 bg-slate-900">
        <img 
           src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop" 
           className="w-full h-full object-cover opacity-30" 
           alt="Gym Community"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-slate-900/50" />
     </div>
     
     <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-10">
        <div className="space-y-4">
           <div className="w-16 h-16 bg-[#A7F3D0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(167,243,208,0.3)]">
              <Users size={32} className="text-slate-900"/>
           </div>
           <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">Strong <br/><span className="text-[#A7F3D0]">Community</span></h2>
           <p className="text-lg md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              We are more than an app. We are a family of achievers. Together, we push boundaries, break records, and leave no one behind.
           </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-20 pt-8 border-t border-white/10">
           <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-black text-white"><CountUpStat end={50000} suffix="+" /></p>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#A7F3D0]">Registered Users</p>
           </div>
           <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-black text-white"><CountUpStat end={1000000} suffix="+" /></p>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#A7F3D0]">Miles Since Launch</p>
           </div>
        </div>
     </div>
  </section>
);

const ChallengesSection = () => (
  <section className="max-w-7xl mx-auto px-6 md:px-8 py-20">
     <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="space-y-3">
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">Ongoing Challenges</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Push your limits with the community</p>
        </div>
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
           { id: 1, title: 'YOU VS 2026', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', label: 'JOIN NOW' },
           { id: 2, title: 'THE WEEKLY 10', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800', label: 'JOIN NOW' },
           { id: 3, title: 'MOUNTAIN MOVER', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800', label: 'JOIN NOW' },
           { id: 4, title: 'SPEED DEMON', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', label: 'JOIN NOW' }
        ].map((card) => (
           <div key={card.id} className="group relative h-[300px] md:h-[400px] rounded-[40px] overflow-hidden cursor-pointer shadow-xl">
              <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-10 space-y-2">
                 <span className="bg-[#A7F3D0] text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block">
                    {card.label}
                 </span>
                 <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{card.title}</h3>
              </div>
           </div>
        ))}
     </div>
  </section>
);

const GoalsCTASection = ({ onAction }: { onAction: () => void }) => (
  <section className="relative py-32 md:py-48 overflow-hidden w-full max-w-[95%] mx-auto rounded-[60px] my-20 shadow-2xl">
     <div className="absolute inset-0 bg-slate-900">
        <img 
           src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1920" 
           className="w-full h-full object-cover opacity-40 blur-sm" 
           alt="Running Legs"
        />
        <div className="absolute inset-0 bg-black/40" />
     </div>
     
     <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="w-20 h-20 border-2 border-[#A7F3D0] rounded-full flex items-center justify-center mx-auto text-[#A7F3D0] bg-slate-900/50 backdrop-blur-md">
           <Target size={40} />
        </div>
        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none drop-shadow-xl">
           Reach Your <br/> Goals
        </h2>
        <p className="text-lg md:text-2xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
           Define your own path. Whether it's distance, duration, or consistency, Mehri Group of Companies adapts to your personal targets.
        </p>
        <div className="pt-8">
           <button onClick={onAction} className="bg-[#A7F3D0] text-slate-900 px-12 py-6 rounded-full font-black uppercase text-xs md:text-sm tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_40px_rgba(167,243,208,0.4)] hover:scale-105 active:scale-95">
              Define Your Path
           </button>
        </div>
     </div>
  </section>
);

// --- MAIN LANDING COMPONENT ---

export const LandingSection = ({ onStart, onNavigate }: any) => {
  // Removed explicit type annotation from unused parameter to satisfy GoalsCTASection prop type
  const createRipple = () => {
    onStart(); 
  };

  return (
    <div className="space-y-0 pb-0 overflow-hidden bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden isolate">
        <motion.div 
           initial={{ scale: 1.1 }}
           animate={{ scale: 1 }}
           transition={{ duration: 10, ease: "easeOut" }}
           className="absolute inset-0 z-0 bg-cover bg-center" 
           style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop")' }} 
        />
        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]" />
        
        <div className="relative z-10 text-center px-6 md:px-8 text-white flex flex-col items-center">
          <h1 className="font-black tracking-tighter uppercase mb-6 md:mb-10 leading-none text-5xl md:text-9xl drop-shadow-2xl flex flex-col items-center gap-y-2">
            <StaggeredText text="REACH YOUR" delayStart={0} />
            <StaggeredText text="BEST." delayStart={0.8} className="text-emerald-400" withUnderline={true} />
          </h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <p className="text-lg md:text-3xl font-medium max-w-3xl mx-auto mb-12 md:mb-20 leading-relaxed tracking-tight drop-shadow-md text-white/90 px-4">
              An integrated fitness platform for training, recovery, and performance.
            </p>
            <motion.button 
              onClick={createRipple} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 md:px-20 py-6 md:py-10 bg-emerald-400 text-slate-900 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] rounded-full shadow-2xl relative overflow-hidden"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* 2. WHAT WE DO (NEW) */}
      <WhatWeDoSection />

      {/* 3. WATCH FEATURE (Reordered) */}
      <ScrollReveal className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="bg-slate-900 rounded-[40px] md:rounded-[80px] p-8 md:p-24 flex flex-col lg:flex-row items-center gap-12 md:gap-20 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-emerald-500/20" />

            <div className="flex-1 space-y-8 md:space-y-12 z-10 text-center lg:text-left">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4 justify-center lg:justify-start">
                   <span className="bg-emerald-400 text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(52,211,153,0.4)]">GTL1 Series</span>
                   <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> In Stock</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                  Biometric <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Dominance</span>
                </h2>
              </div>
              
              <div className="space-y-8">
                <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  The GTL-1 is a precision instrument for your wrist. Milled from aerospace-grade titanium, it provides continuous physiological tracking to inform your training decisions. While optional, it unlocks the full depth of Mehri's biometric analysis.
                </p>
                
                <ul className="space-y-3 inline-block text-left">
                   {[
                     "Continuous heart-rate tracking",
                     "HRV analysis during rest and sleep",
                     "Night-time SpO₂ estimation",
                     "Activity and workout detection",
                     "Up to 14-day intelligent battery life"
                   ].map(item => (
                     <li key={item} className="flex items-center gap-3 text-slate-300 font-bold text-sm tracking-wide">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {item}
                     </li>
                   ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4 justify-center lg:justify-start">
                <motion.a 
                  href="https://a.co/d/f49Dhaq" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-6 bg-white text-slate-900 rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_10px_30px_-10px_rgba(52,211,153,0.5)] text-center flex items-center justify-center gap-3 group/btn"
                >
                  Get Yours Now <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1"/>
                </motion.a>
              </div>
            </div>

            <div className="flex-1 relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-slate-800 rounded-full animate-[spin_60s_linear_infinite]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-dashed border-emerald-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

               <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg">
                  <motion.div whileHover={{ y: -10 }} className="space-y-6 pt-12">
                     <div className="aspect-[3/4] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-800 relative group/img">
                         <img src="https://images2.imgbox.com/56/17/7wy6uJHG_o.jpeg" onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'} className="w-full h-full object-cover transition-all duration-700" alt="GTL1 Watch Face" />
                         <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-black text-sm md:text-lg">Focus Mode</p>
                         </div>
                     </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -10 }} className="space-y-6 pb-12">
                     <div className="aspect-[3/4] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-800 relative group/img">
                         <img src="https://images2.imgbox.com/3b/e6/QhMzpqDY_o.jpeg" onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=800'} className="w-full h-full object-cover transition-all duration-700" alt="GTL1 Side Profile" />
                         <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-black text-sm md:text-lg">Titanium</p>
                         </div>
                     </div>
                  </motion.div>
               </div>
            </div>
        </div>
      </ScrollReveal>

      {/* 4. ALMA AI SECTION (Reordered) */}
      <ScrollReveal className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="bg-slate-900 rounded-[40px] md:rounded-[80px] p-8 md:p-24 flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900 pointer-events-none" />
           <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
           
           <div className="flex-1 space-y-8 md:space-y-10 z-10 relative text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-400/20">
                    <Brain size={20} />
                 </div>
                 <span className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs">AI Intelligence</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                 COMMAND YOUR DATA <br/>
                 <span className="text-emerald-400">WITH ALMA</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                   Your personal AI coach that does the work for you. Command Alma to log new sessions, remove accidental entries, or analyze your historical workouts through a simple interface.
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                   * Alma provides non-medical fitness insights based on historical data trends.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 pt-4">
                 {[
                   { icon: MessageSquare, title: "Smart Logging", desc: "Just say it, she logs it." },
                   { icon: Eraser, title: "Data Cleanup", desc: "Edit history instantly." },
                   { icon: LineChart, title: "Lifetime Insights", desc: "View your stats on demand." }
                 ].map((feat, i) => (
                    <motion.div whileHover={{ scale: 1.05 }} key={i} className="space-y-3 group cursor-default">
                       <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-slate-900 text-emerald-400 transition-all duration-300 mx-auto lg:mx-0">
                          <feat.icon size={20} />
                       </div>
                       <div>
                         <h4 className="text-white font-black uppercase text-xs tracking-wider mb-1">{feat.title}</h4>
                         <p className="text-slate-500 text-[11px] font-bold leading-tight">{feat.desc}</p>
                       </div>
                    </motion.div>
                 ))}
              </div>

              <div className="flex justify-center lg:justify-start">
                <motion.button 
                  onClick={createRipple}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-6 bg-emerald-400 text-slate-900 rounded-full font-black uppercase text-xs tracking-[0.4em] hover:bg-white transition-colors shadow-lg relative overflow-hidden flex items-center gap-3 group"
                >
                   Talk to Alma <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </div>
           </div>

           <div className="flex-1 w-full relative z-10 flex justify-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-md bg-slate-800 rounded-[40px] border border-slate-700/50 p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 group">
                 <div className="flex items-center gap-4 mb-8 border-b border-slate-700/50 pb-6">
                    <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden border-2 border-emerald-400 shadow-lg shadow-emerald-400/20">
                       <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=200" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="text-white font-bold">Alma</p>
                       <p className="text-emerald-400 text-xs uppercase font-black tracking-widest">Online</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-2xl p-4 text-sm text-slate-300">
                       Hey there. I noticed your HRV dropped 12% after yesterday's 10k run.
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-sm text-emerald-100">
                       Recommendation: Focus on zone 2 recovery today. Want me to schedule a light 20min yoga session?
                    </div>
                 </div>
                 
                 {/* Decorative Elements */}
                 <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500 rounded-full blur-[40px] opacity-20 animate-pulse" />
              </div>
           </div>
        </div>
      </ScrollReveal>

      {/* 5. STRONG COMMUNITY (Styling Updated) */}
      <StrongCommunitySection />

      {/* 6. ONGOING CHALLENGES */}
      <ChallengesSection />

      {/* 7. REACH GOALS CTA (Styling Updated) */}
      <GoalsCTASection onAction={createRipple} />

      {/* 8. KEY FEATURES (Moved Here) */}
      <KeyFeaturesSection />

      {/* 9. FAQ */}
      <FAQSection />

      {/* 10. FOOTER */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
