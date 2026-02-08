
import React, { useState, useEffect } from 'react';
import { ArrowRight, X, Smartphone, Map, Brain, LayoutDashboard, Check, Download } from 'lucide-react';

export const OnboardingTour = ({ onComplete, onNavigate }: any) => {
  const [step, setStep] = useState(0);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect Standalone Mode
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // 2. OS Detection
    const checkDevice = () => {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
        if (/Android/i.test(ua)) return 'android';
        return 'other';
    };
    setDeviceType(checkDevice());

    // 3. Listen for Android Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Start at dashboard
    onNavigate('dashboard');

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNext = async () => {
    const nextStep = step + 1;
    const maxSteps = isStandalone ? 3 : 4;
    
    if (nextStep === 1) {
        onNavigate('routes');
        setStep(1);
    } else if (nextStep === 2) {
        onNavigate('alma');
        setStep(2);
    } else if (nextStep === 3) {
        if (isStandalone) {
            finish();
        } else {
            setStep(3);
        }
    } else {
        finish();
    }
  };

  const handleInstallClick = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to install prompt: ${outcome}`);
          setDeferredPrompt(null);
          finish();
      }
  };

  const finish = () => {
      localStorage.setItem('mehri_onboarding_complete', 'true');
      onComplete();
  };

  const steps = [
      {
          title: "Command Center",
          text: "Use the log button to record workouts. Track streaks and monthly stats here.",
          icon: LayoutDashboard,
      },
      {
          title: "Route Planner",
          text: "Draw paths on the map. Save them to get precise distance data for your runs.",
          icon: Map,
      },
      {
          title: "Alma Intelligence",
          text: "Your AI coach. Ask her about recovery, nutrition, or log workouts via chat.",
          icon: Brain,
      },
      {
          title: "Install MEHRI",
          text: deviceType === 'ios' 
            ? "Apple requires a manual step to add the app to your home screen."
            : "Get quick access and a full-screen experience by installing the app.",
          icon: Smartphone,
      }
  ];

  const currentContent = steps[step];
  const maxStepsDisplay = isStandalone ? 3 : 4;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end pb-8 px-4 bg-slate-900/30 backdrop-blur-[2px]">
        <div className="w-full flex justify-center">
            <div className="w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 shadow-2xl transform transition-all duration-500 ease-out animate-slide-up relative overflow-hidden">
                
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <currentContent.icon size={24} className="text-[#A7F3D0]" />
                    </div>

                    <div className="flex-1 space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white">{currentContent.title}</h3>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{step + 1} / {maxStepsDisplay}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-sm">
                            {currentContent.text}
                        </p>

                        {step === 3 && !isStandalone && (
                            <div className="mt-4 bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">
                                {deviceType === 'ios' ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#A7F3D0] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                Tap the <span className="text-white font-bold inline-flex items-center gap-1">Share icon <span className="opacity-50 text-[10px]">(square with arrow)</span></span> at the bottom of Safari.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#A7F3D0] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                Scroll down and select <span className="text-white font-bold">"Add to Home Screen"</span>.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {deferredPrompt ? (
                                            <button 
                                                onClick={handleInstallClick}
                                                className="w-full py-4 bg-[#A7F3D0] text-slate-900 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-300 transition-colors shadow-lg"
                                            >
                                                <Download size={16}/> Install Now
                                            </button>
                                        ) : (
                                            <div className="flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#A7F3D0] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                                                <p className="text-xs text-slate-300 leading-relaxed">
                                                    Tap the <span className="text-white font-bold">three dots</span> in the top right and select <span className="text-white font-bold">"Install app"</span> or <span className="text-white font-bold">"Add to Home screen"</span>.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <div className="flex gap-2">
                        {steps.slice(0, maxStepsDisplay).map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#A7F3D0]' : 'w-2 bg-slate-700'}`} />
                        ))}
                    </div>
                    
                    <div className="flex gap-3">
                        {step === 3 && (
                            <button 
                                onClick={finish}
                                className="px-5 py-3 border border-white/10 rounded-full text-slate-500 font-black uppercase text-[9px] tracking-widest hover:text-white hover:border-white/30 transition-all"
                            >
                                Maybe Later
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#A7F3D0] transition-colors shadow-lg group"
                        >
                            {step >= 3 || (isStandalone && step === 2) ? "Finish" : "Next"} 
                            {step >= 3 || (isStandalone && step === 2) ? <Check size={14}/> : <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up {
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
        `}</style>
    </div>
  );
};
