import React, { useEffect, useRef, useState } from 'react';
import { Target, Users, ArrowRight, HelpCircle, ChevronDown, Trophy, Activity, Check, Shield, Zap, TrendingUp } from 'lucide-react';
import { FAQ_DATA } from './constants';
import { Footer } from './Footer.tsx';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

// --- PREMIUM ANIMATION COMPONENTS ---
const StaggeredText = ({ text, className = "", delayStart = 0, withUnderline = false, justify = "center" }: { text: string, justify?: string, className?: string, delayStart?: number, withUnderline?: boolean }) => {
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
      y: 50,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: justify, gap: "0.2em" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className={`inline-block ${withUnderline ? "relative" : ""}`}>
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

const LetterByLetterText = ({ text, className = "", delayStart = 0, justify = "center" }: { text: string, className?: string, delayStart?: number, justify?: string }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: delayStart }
    }
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: justify }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split(" ").map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex mr-[0.3em]">
          {Array.from(word).map((letter, letterIdx) => (
            <motion.span
              variants={child}
              key={letterIdx}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
};

const LiveDrawnLine = ({ delay = 1.5, color = "bg-emerald-400" }: { delay?: number, color?: string }) => (
  <motion.div
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ delay, duration: 1.2, ease: "easeInOut" }}
    className={`absolute -bottom-2 left-0 right-0 h-2 ${color} rounded-full origin-left shadow-[0_0_20px_rgba(52,211,153,0.5)]`}
  />
);

const ScrollReveal = ({ children, className = "", id = "" }: { children?: React.ReactNode, className?: string, id?: string }) => {
  return (
    <motion.div
      id={id}
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

const WhatWeDoSection = () => (
  <section className="max-w-4xl mx-auto px-6 md:px-8 py-24 text-center bg-white">
     <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
     >
       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 block">What We Do</span>
       <h2 className="text-2xl md:text-4xl font-medium text-slate-900 leading-relaxed font-serif">
          Mehri Fitness builds the bridge between raw biometric data and actionable human performance. We provide the hardware, the AI, and the ecosystem to help you track workouts, recovery, and health trends across all your devices.
       </h2>
       <p className="mt-8 text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Whether you use just your phone or pair it with our flagship Mehri fitness tracker, you get a personalized roadmap to your physical potential.
       </p>
     </motion.div>
  </section>
);

const WhoItIsForSection = () => (
  <section className="max-w-7xl mx-auto px-6 md:px-8 py-20 bg-slate-50 rounded-[40px] md:rounded-[60px] my-12 border border-slate-100">
     <div className="text-center mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block">Who It Is For</span>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">Built for the <span className="text-emerald-500">Relentless</span></h2>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
           {
             title: "The Executive",
             desc: "High-performance individuals who need data-driven insights to manage stress, recovery, and peak cognitive function.",
             img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800"
           },
           {
             title: "The Athlete",
             desc: "Serious competitors looking for every marginal gain in their biometric data and training efficiency.",
             img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"
           },
           {
             title: "The Visionary",
             desc: "People who view health as an investment and want the most advanced tools to ensure longevity.",
             img: "https://images.unsplash.com/photo-1507398941214-57f5162133bf?q=80&w=800"
           }
        ].map((item, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.1 }}
             className="group relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl"
           >
              <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-10">
                 <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">{item.title}</h3>
                 <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">{item.desc}</p>
              </div>
           </motion.div>
        ))}
     </div>
  </section>
);

const ServicesSection = () => (
  <section className="max-w-7xl mx-auto px-6 md:px-8 py-20">
     <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="space-y-3">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block">Our Services</span>
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">Ecosystem of <span className="text-emerald-500">Excellence</span></h2>
        </div>
        <p className="text-slate-500 font-medium max-w-sm text-right hidden md:block">
           A comprehensive suite of tools designed to optimize every aspect of your physical and mental well-being.
        </p>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
           { icon: Activity, title: "Biometric Architecture", desc: "Advanced physiological tracking and analysis of your core vitals like HRV, SpO2, and resting heart rate." },

           { icon: Target, title: "Precision Training", desc: "Custom-built workout protocols that adapt dynamically to your daily readiness and recovery scores." },
           { icon: Trophy, title: "Global Challenges", desc: "Compete in community challenges to push your boundaries and stay motivated with like-minded achievers." }
        ].map((service, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.1 }}
             className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group"
           >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
                 <service.icon size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">{service.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{service.desc}</p>
           </motion.div>
        ))}
     </div>
  </section>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div layout className="border-b border-slate-200 last:border-0 overflow-hidden">
       <motion.button
         layout
         onClick={() => setIsOpen(!isOpen)}
         className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
         aria-expanded={isOpen}
       >
          <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors pr-4">{question}</h3>
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
        {FAQ_DATA.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
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
              Why does it matter? Because health is not a solo journey. We are a family of achievers pushing boundaries together.
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
           src="https://images.unsplash.com/photo-1548690312-e3b507d17a47?q=80&w=1920&auto=format&fit=crop"
           className="w-full h-full object-cover opacity-20"
           alt="Fitness Motivation"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-emerald-900/40" />
     </div>
     
     <div className="relative z-10 max-container px-6 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="space-y-12"
        >
           <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none">
              READY TO <br/> <span className="text-emerald-400">EVOLVE?</span>
           </h2>
           <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
              Stop guessing. Start knowing. Join the ecosystem designed for peak human performance.
           </p>
           <button onClick={onAction} className="bg-[#A7F3D0] text-slate-900 px-12 py-6 rounded-full font-black uppercase text-xs md:text-sm tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_40px_rgba(167,243,208,0.4)] hover:scale-105 active:scale-95">
              Get Started Now
           </button>
        </motion.div>
     </div>
  </section>
);

// --- MAIN LANDING COMPONENT ---

export const LandingSection = ({ onStart, onNavigate, onShop }: { onStart: () => void, onNavigate: (view: string) => void, onShop: () => void }) => {
  const createRipple = () => {
    onStart(); 
  };

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/landingpage_poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/landingpage_hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <div className="text-6xl md:text-9xl font-black mb-6 tracking-tighter flex flex-wrap justify-center items-center gap-x-4 md:gap-x-8">
              <LetterByLetterText
                text="REACH YOUR"
                className="text-white"
              />
              <div className="relative inline-block">
                <LetterByLetterText
                  text="BEST"
                  className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  delayStart={0.5}
                />
                <LiveDrawnLine delay={1.2} />
              </div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 mb-10 font-light tracking-wide">
              Train smarter with Mehri. The ecosystem designed for peak performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('auth')}
                className="px-10 py-4 bg-emerald-400 text-slate-900 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 group text-lg shadow-[0_10px_30px_-10px_rgba(52,211,153,0.5)]"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('watch');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-10 py-4 bg-slate-900/40 backdrop-blur-md border border-emerald-500/30 text-emerald-400 rounded-full font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-slate-900 transition-all text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-white/50 text-sm font-medium tracking-widest">SCROLL TO EXPLORE</span>
            <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* 2. WATCH SECTION (Moved here, Expanded) */}
      <ScrollReveal id="watch" className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-32">
        <div className="bg-slate-950 border border-slate-900 rounded-[40px] md:rounded-[80px] p-8 md:p-24 relative overflow-hidden shadow-2xl group hover:shadow-emerald-400/10 transition-shadow duration-1000">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-emerald-500/20" />

            <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
              <div className="flex-1 space-y-8 md:space-y-12 z-10 text-center lg:text-left">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center lg:justify-start">
                     <span className="bg-emerald-400 text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(52,211,153,0.4)]">Mehri Tracker</span>
                     <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">Limited Time - It's Cheap</span>
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                    Meet the <br/> <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Mehri Fitness Tracker</span>
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Performance isn't just about how hard you work—it's about how well you recover. The Mehri fitness tracker is a precision instrument designed to give you a complete picture of your health, 24/7.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ul className="space-y-3 text-left">
                      {[
                        "Continuous Heart Rate",
                        "HRV & Sleep Analysis",
                        "SpO2 Blood Oxygen",
                      ].map((item, i) => (
                        <motion.li
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={item}
                          className="flex items-center gap-3 text-slate-300 font-bold text-sm tracking-wide"
                        >
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {item}
                        </motion.li>
                      ))}
                    </ul>
                    <ul className="space-y-3 text-left">
                      {[
                        "Activity Detection",
                        "14-Day Battery Life",
                        "Water Resistant",
                      ].map((item, i) => (
                        <motion.li
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: (i + 3) * 0.1 }}
                          key={item}
                          className="flex items-center gap-3 text-slate-300 font-bold text-sm tracking-wide"
                        >
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 italic">
                    Available in Black and Rose Pink. Built for high performance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4 justify-center lg:justify-start">
                  <motion.button
                    onClick={onShop}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-12 py-6 bg-emerald-400 text-slate-900 rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-[0_10px_30px_-10px_rgba(52,211,153,0.5)] text-center flex items-center justify-center gap-3 group/btn"
                  >
                    Get The Best Deal <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1"/>
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
                 <motion.div
                   initial="hidden"
                   whileInView="visible"
                   viewport={{ once: true }}
                   variants={{
                     visible: { transition: { staggerChildren: 0.1 } }
                   }}
                   className="relative z-10 grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg"
                 >
                    <div className="space-y-4 md:space-y-6">
                       <motion.div
                         variants={{
                           hidden: { opacity: 0, y: 20 },
                           visible: { opacity: 1, y: 0 }
                         }}
                         whileHover={{ y: -10, scale: 1.02 }}
                         className="aspect-[4/5] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-900 group/img"
                       >
                           <img src="/watchpic1.jpeg" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Mehri Watch Front" />
                       </motion.div>
                       <motion.div
                         variants={{
                           hidden: { opacity: 0, y: 20 },
                           visible: { opacity: 1, y: 0 }
                         }}
                         whileHover={{ y: -10, scale: 1.02 }}
                         className="aspect-[4/5] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-900 group/img"
                       >
                           <img src="/watchpic8.jpeg" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Mehri Watch Detail" />
                       </motion.div>
                    </div>
                    <div className="space-y-4 md:space-y-6 pt-12">
                       <motion.div
                         variants={{
                           hidden: { opacity: 0, y: 20 },
                           visible: { opacity: 1, y: 0 }
                         }}
                         whileHover={{ y: -10, scale: 1.02 }}
                         className="aspect-[4/5] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-900 group/img"
                       >
                           <img src="/watchpic2.jpeg" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Mehri Watch Side" />
                       </motion.div>
                       <motion.div
                         variants={{
                           hidden: { opacity: 0, y: 20 },
                           visible: { opacity: 1, y: 0 }
                         }}
                         whileHover={{ y: -10, scale: 1.02 }}
                         className="aspect-[4/5] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-900 group/img"
                       >
                           <img src="/watchpic10.jpeg" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Mehri Watch Wrist" />
                       </motion.div>
                    </div>
                 </motion.div>
              </div>
            </div>
        </div>
      </ScrollReveal>

      {/* 3. WHAT WE DO */}
      <WhatWeDoSection />

      {/* 4. WHO IT IS FOR */}
      <WhoItIsForSection />

      {/* 5. OUR SERVICES */}
      <ServicesSection />



      {/* 7. STRONG COMMUNITY */}
      <StrongCommunitySection />

      {/* 8. ONGOING CHALLENGES */}
      <ChallengesSection />

      {/* 9. REACH GOALS CTA */}
      <GoalsCTASection onAction={createRipple} />

      {/* 10. FAQ */}
      <FAQSection />

      {/* 11. FOOTER */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingSection;
