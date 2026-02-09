
import React, { useState, useEffect } from 'react';
import { detectSystemUnits, api, getWeightUnit } from './utils.ts';
import { GOOGLE_CLIENT_ID } from './constants.ts';
import { checkEmailAvailability, checkUsernameAvailability } from './validationService.ts';
import { Loader } from './Loader.tsx';
import { Eye, EyeOff, ArrowRight, Activity, Zap, Target, Heart, X } from 'lucide-react';

declare const window: any;

const GOALS = [
  { id: 'Weight Loss', icon: Zap, desc: 'Burn fat efficiently' },
  { id: 'Muscle Gain', icon: Activity, desc: 'Build strength & mass' },
  { id: 'Endurance', icon: Target, desc: 'Go further, longer' },
  { id: 'Vitality', icon: Heart, desc: 'Health & longevity' }
];

const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in w-[90%] max-w-sm justify-between ${type === 'error' ? 'bg-slate-900 text-[#A7F3D0] border border-[#A7F3D0]/20' : 'bg-[#A7F3D0] text-slate-900'}`}>
    <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-widest">{message}</span>
    </div>
    <button onClick={onClose} className="opacity-50 hover:opacity-100 p-1"><X size={16}/></button>
  </div>
);

export const AuthSection = ({ onComplete, initialView = 'login', onNavigate }: any) => {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  
  // Inputs
  const [loginInput, setLoginInput] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [units, setUnits] = useState<'imperial' | 'metric'>('metric');
  
  // Error States
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [googleData, setGoogleData] = useState<any>(null);
  const [googleOnboardingForm, setGoogleOnboardingForm] = useState({
    username: '',
    weight: '',
    height: '',
    heightFt: '',
    heightIn: '',
    goal: ''
  });

  const weightUnit = getWeightUnit(units);

  useEffect(() => {
    setIsLogin(initialView === 'login');
  }, [initialView]);

  useEffect(() => {
    setUnits(detectSystemUnits());
    const initGoogle = () => {
        if (typeof window !== 'undefined' && window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            const btnParent = document.getElementById("googleIconBtn");
            if (btnParent) {
                window.google.accounts.id.renderButton(btnParent, { theme: "outline", size: "large", shape: "pill" });
            }
        }
    };
    initGoogle();
  }, []);

  useEffect(() => {
    if (isLogin || !email) { 
      setEmailError(''); 
      return; 
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (email.length > 5) setEmailError('Email format is incorrect');
      return;
    } else {
       setEmailError('');
    }
    const timer = setTimeout(async () => {
      const status = await checkEmailAvailability(email);
      if (status === 'taken') setEmailError('Email is already taken');
      else setEmailError('');
    }, 500);
    return () => clearTimeout(timer);
  }, [email, isLogin]);

  useEffect(() => {
    const target = onboardingStep === 1 ? googleOnboardingForm.username : username;
    if ((isLogin && onboardingStep === 0) || !target) { 
      setUsernameError(''); 
      return; 
    }
    if (target.length < 3) {
      if (target.length > 0) setUsernameError('Username too short');
      return;
    }
    const timer = setTimeout(async () => {
      const status = await checkUsernameAvailability(target);
      if (status === 'taken') setUsernameError('Username already taken');
      else setUsernameError('');
    }, 500);
    return () => clearTimeout(timer);
  }, [username, googleOnboardingForm.username, isLogin, onboardingStep]);

  const triggerShake = () => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
  };

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 4000);
  };

  const handleGoogleResponse = async (response: any) => {
      if (isLoading) return;
      setIsLoading(true);
      setLoadingText("Verifying Credentials...");
      try {
        const res: any = await api("GOOGLE_AUTH", { token: response.credential });
        if (res.status === 'success' && res.data?.user) {
            localStorage.setItem('mehri_session_user', res.data.user.username);
            onComplete({ ...res.data.user, isNewUser: false });
        } else if (res.status === 'new_user') {
            setGoogleData({ email: res.googleData.email, name: res.googleData.name, token: response.credential });
            setGoogleOnboardingForm(p => ({ ...p, username: res.googleData.email.split('@')[0].replace(/[^a-z0-9_]/g, '') }));
            setOnboardingStep(1);
        }
      } catch (e) {
        showToast("Authentication failed.");
      } finally {
        setIsLoading(false);
      }
  };

  const handleGoogleOnboardingNext = async () => {
      if (onboardingStep === 1) {
          if (usernameError) return;
          setOnboardingStep(2);
      } else if (onboardingStep === 2) {
          if (!googleOnboardingForm.weight) return;
          setOnboardingStep(3);
      } else if (onboardingStep === 3) {
          if (!googleOnboardingForm.goal) return;
          setIsLoading(true);
          const res = await api("GOOGLE_REGISTER", { 
            username: `@${googleOnboardingForm.username}`, 
            email: googleData.email, 
            name: googleData.name, 
            specs: { weight: googleOnboardingForm.weight, height: googleOnboardingForm.height },
            goal: googleOnboardingForm.goal,
            units
          });
          if (res.status === 'success') {
            localStorage.setItem('mehri_session_user', `@${googleOnboardingForm.username}`);
            onComplete({ username: `@${googleOnboardingForm.username}`, name: googleData.name, isNewUser: true });
          }
          setIsLoading(false);
      }
  };

  const handleLogin = async () => {
      if (isLoading || !loginInput || !password) return;
      setIsLoading(true);
      try {
        // Send trim() but allow case sensitivity to be handled by backend/utils
        const res = await api("LOGIN", { login: loginInput.trim(), password });
        if (res.status === 'success') {
            localStorage.setItem('mehri_session_user', res.data.user.username);
            onComplete(res.data.user);
        } else {
            showToast(res.message || "Invalid credentials.");
            triggerShake();
        }
      } catch (e) { showToast("Connection error."); } finally { setIsLoading(false); }
  };

  const handleRegister = async () => {
    if (isLoading || emailError || usernameError || !name || !email || !username || !password || password !== confirmPassword || password.length < 8) {
        triggerShake();
        return;
    }
    setIsLoading(true);
    try {
        const res = await api("REGISTER", { name, username: `@${username.toLowerCase()}`, email, password, units });
        if (res.status === 'success') {
            localStorage.setItem('mehri_session_user', `@${username.toLowerCase()}`);
            onComplete({ name, username: `@${username.toLowerCase()}`, isNewUser: true });
        } else {
            const msg = res.message.toLowerCase();
            if (msg.includes("email")) setEmailError("Email is already taken");
            else if (msg.includes("username")) setUsernameError("Username is already taken");
            else showToast(res.message);
            triggerShake();
        }
    } catch (e) { showToast("Registration error."); } finally { setIsLoading(false); }
  };

  const isSignupReady = !emailError && !usernameError && name && email && username && password && password === confirmPassword && password.length >= 8;

  return (
    <>
      <Loader isVisible={isLoading} text={loadingText} />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {onboardingStep > 0 ? (
        <div className="fixed inset-0 bg-white z-[7000] flex items-center justify-center p-6 animate-fade-in font-sans h-[100dvh]">
             <div className="w-full max-w-2xl bg-white flex flex-col items-center text-center space-y-8 overflow-y-auto max-h-full py-10">
                 <div className="flex gap-2 mb-8">
                     {[1,2,3].map(step => (
                         <div key={step} className={`h-1 rounded-full transition-all duration-500 ${step <= onboardingStep ? 'w-12 bg-[#A7F3D0]' : 'w-4 bg-slate-100'}`} />
                     ))}
                 </div>

                 {onboardingStep === 1 && (
                     <div className="space-y-6 w-full max-w-md animate-fade-in">
                         <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Claim Your Handle</h2>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">This will be your identity.</p>
                         <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">@</span>
                            <input 
                                type="text" 
                                className={`w-full bg-slate-50 text-lg font-bold rounded-2xl pl-12 pr-6 py-6 outline-none transition-all lowercase focus:ring-2 focus:ring-[#A7F3D0] ${usernameError ? 'border-2 border-red-500' : 'border-none'}`}
                                value={googleOnboardingForm.username}
                                onChange={e => setGoogleOnboardingForm({...googleOnboardingForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                                autoFocus
                            />
                            {usernameError && <p className="text-[10px] font-black text-red-500 uppercase tracking-wide text-left ml-4 mt-2">{usernameError}</p>}
                         </div>
                     </div>
                 )}
                 {onboardingStep === 2 && (
                     <div className="space-y-6 w-full max-w-lg animate-fade-in">
                         <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Calibrate Bio-Core</h2>
                         <div className="flex justify-center gap-4 mb-4">
                            <button onClick={() => setUnits('metric')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${units === 'metric' ? 'bg-[#A7F3D0] text-slate-900' : 'bg-slate-50 text-slate-400'}`}>Metric</button>
                            <button onClick={() => setUnits('imperial')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${units === 'imperial' ? 'bg-[#A7F3D0] text-slate-900' : 'bg-slate-50 text-slate-400'}`}>Imperial</button>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Weight ({weightUnit})</label>
                                <input type="number" className="w-full bg-slate-50 border-none text-slate-900 text-2xl font-black rounded-2xl px-6 py-6 focus:ring-2 focus:ring-[#A7F3D0] outline-none transition-all text-center" value={googleOnboardingForm.weight} onChange={e => setGoogleOnboardingForm({...googleOnboardingForm, weight: e.target.value})} placeholder="0" />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Height ({units === 'metric' ? 'cm' : 'in'})</label>
                                <input type="number" className="w-full bg-slate-50 border-none text-slate-900 text-2xl font-black rounded-2xl px-6 py-6 focus:ring-2 focus:ring-[#A7F3D0] outline-none transition-all text-center" value={googleOnboardingForm.height} onChange={e => setGoogleOnboardingForm({...googleOnboardingForm, height: e.target.value})} placeholder="0" />
                            </div>
                         </div>
                     </div>
                 )}
                 {onboardingStep === 3 && (
                     <div className="space-y-6 w-full max-w-4xl animate-fade-in">
                         <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Set Your Focus</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            {GOALS.map(g => (
                                <button key={g.id} onClick={() => setGoogleOnboardingForm({...googleOnboardingForm, goal: g.id})} className={`p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between h-48 group ${googleOnboardingForm.goal === g.id ? 'bg-slate-900 border-slate-900 shadow-xl scale-105 ring-4 ring-[#A7F3D0]/50' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${googleOnboardingForm.goal === g.id ? 'bg-[#A7F3D0] text-slate-900' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}><g.icon size={20} /></div>
                                    <div><p className={`text-lg font-black uppercase mb-1 ${googleOnboardingForm.goal === g.id ? 'text-white' : 'text-slate-900'}`}>{g.id}</p></div>
                                </button>
                            ))}
                         </div>
                     </div>
                 )}
                 <div className="pt-8 w-full max-w-md pb-20">
                     <button onClick={handleGoogleOnboardingNext} className="w-full bg-[#A7F3D0] hover:bg-emerald-300 text-slate-900 font-black uppercase text-xs tracking-[0.2em] py-5 rounded-xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2" disabled={isLoading || (onboardingStep === 1 && !!usernameError)}>
                         {onboardingStep === 3 ? "Complete Setup" : "Continue"} <ArrowRight size={16}/>
                     </button>
                 </div>
             </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-white z-[6000] flex flex-col items-center justify-center p-6 animate-fade-in font-sans h-[100dvh]">
          <div className={`w-full max-w-md relative ${shake ? 'animate-shake' : ''} max-h-full overflow-y-auto`}>
            <div className="bg-white border border-slate-100 rounded-[30px] p-8 md:p-10 shadow-2xl relative z-10 flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 font-serif">{isLogin ? "Welcome Back" : "Join MEHRI"}</h2>
              </div>
              <div id="googleIconBtn" className="w-full flex justify-center min-h-[44px]"></div>
              <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">OR</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Log In</button>
                  <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Sign Up</button>
              </div>
              
              <div className="space-y-4">
                 {isLogin ? (
                     <>
                        <input type="text" placeholder="Email or Username" className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#A7F3D0] outline-none" value={loginInput} onChange={e => setLoginInput(e.target.value)} />
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#A7F3D0] outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                     </>
                 ) : (
                     <>
                        <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#A7F3D0] outline-none" value={name} onChange={e => setName(e.target.value)} />
                        <div className="space-y-1">
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className={`w-full p-4 rounded-xl bg-slate-50 border ${emailError ? 'border-red-500' : 'border-slate-100'} focus:border-[#A7F3D0] outline-none transition-all`} 
                                value={email} 
                                onChange={e => setEmail(e.target.value.toLowerCase())} 
                            />
                            {emailError && (
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">
                                    {emailError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <input 
                                type="text" 
                                placeholder="Username" 
                                className={`w-full p-4 rounded-xl bg-slate-50 border ${usernameError ? 'border-red-500' : 'border-slate-100'} focus:border-[#A7F3D0] outline-none transition-all lowercase`} 
                                value={username} 
                                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                            />
                             {usernameError && (
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">
                                    {usernameError}
                                </p>
                            )}
                        </div>
                        <input type="password" placeholder="Password (Min 8)" className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#A7F3D0] outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                        <input type="password" placeholder="Confirm Password" className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#A7F3D0] outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                     </>
                 )}
              </div>

              <button 
                onClick={isLogin ? handleLogin : handleRegister} 
                disabled={isLoading || (!isLogin && !isSignupReady)}
                className={`w-full text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 ${isLoading || (!isLogin && !isSignupReady) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:scale-[1.02] active:scale-95'}`}
              >
                 {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={16}/>
              </button>

              <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                By signing up, you agree to our 
                <button onClick={() => onNavigate('terms')} className="text-[#A7F3D0] hover:text-emerald-500 cursor-pointer font-bold mx-1 uppercase tracking-wider hover:underline">Terms of Service</button>
                and
                <button onClick={() => onNavigate('privacy')} className="text-[#A7F3D0] hover:text-emerald-500 cursor-pointer font-bold ml-1 uppercase tracking-wider hover:underline">Privacy Policy</button>.
              </p>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A7F3D0] rounded-full blur-[80px] opacity-60 pointer-events-none" />
          </div>
        </div>
      )}
    </>
  );
};
