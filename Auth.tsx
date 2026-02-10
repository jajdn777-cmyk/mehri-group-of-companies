
import React, { useState, useEffect } from 'react';
import { detectSystemUnits, api, getWeightUnit } from './utils.ts';
import { checkEmailAvailability, checkUsernameAvailability } from './validationService.ts';
import { Loader } from './Loader.tsx';
import { Eye, EyeOff, ArrowRight, Activity, Zap, Target, Heart, X, Check } from 'lucide-react';
import { supabase } from './supabaseClient.ts';

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

  useEffect(() => {
    setIsLogin(initialView === 'login');
  }, [initialView]);

  useEffect(() => {
    setUnits(detectSystemUnits());
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
    const target = username;
    if (isLogin || !target) { 
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
  }, [username, isLogin]);

  const triggerShake = () => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
  };

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 4000);
  };

  const handleGoogleLogin = async () => {
      setIsLoading(true);
      setLoadingText("Redirecting to Google...");
      const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
              redirectTo: window.location.origin
          }
      });
      if (error) {
          showToast(error.message);
          setIsLoading(false);
      }
      // Note: If successful, the page redirects, so no need to stop loading manually.
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

      <div className="fixed inset-0 bg-white z-[6000] flex flex-col items-center justify-center p-6 animate-fade-in font-sans h-[100dvh]">
          <div className={`w-full max-w-md relative ${shake ? 'animate-shake' : ''} max-h-full overflow-y-auto`}>
            <div className="bg-white border border-slate-100 rounded-[30px] p-8 md:p-10 shadow-2xl relative z-10 flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 font-serif">{isLogin ? "Welcome Back" : "Join MEHRI"}</h2>
              </div>
              
              <button 
                onClick={handleGoogleLogin} 
                className="w-full py-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all hover:border-slate-300 shadow-sm"
              >
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G"/>
                 Continue with Google
              </button>

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
    </>
  );
};
