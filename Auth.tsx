import React, { useState, useEffect } from 'react';
import { detectSystemUnits, api } from './utils.ts';
import { checkEmailAvailability, checkUsernameAvailability } from './validationService.ts';
import { Loader } from './Loader.tsx';
import { X, Check, Mail, Newspaper } from 'lucide-react';
import { supabase } from './supabaseClient.ts';
import { AuthTabs, Ripple, TechOrbitDisplay } from './components/blocks/modern-animated-sign-in';

declare const window: any;

const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in w-[90%] max-w-sm justify-between ${type === 'error' ? 'bg-slate-900 text-[#A7F3D0] border border-[#A7F3D0]/20' : 'bg-[#A7F3D0] text-slate-900'}`}>
    <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-widest">{message}</span>
    </div>
    <button onClick={onClose} className="opacity-50 hover:opacity-100 p-1"><X size={16}/></button>
  </div>
);

const iconsArray = [
  {
    component: () => (
      <img
        width={40}
        height={40}
        src='https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=100&q=80'
        alt='Watch'
        className="rounded-full border-2 border-[#A7F3D0]"
      />
    ),
    className: 'size-[40px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <img
        width={40}
        height={40}
        src='https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=100&q=80'
        alt='Fitness'
        className="rounded-full border-2 border-[#A7F3D0]"
      />
    ),
    className: 'size-[40px] border-none bg-transparent',
    duration: 25,
    delay: 10,
    radius: 180,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <img
        width={40}
        height={40}
        src='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=100&q=80'
        alt='Yoga'
        className="rounded-full border-2 border-[#A7F3D0]"
      />
    ),
    className: 'size-[40px] border-none bg-transparent',
    radius: 260,
    duration: 30,
    path: false,
    reverse: false,
  },
];

export const AuthSection = ({ onComplete, initialView = 'login', onNavigate }: any) => {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  
  // Inputs
  const [loginInput, setLoginInput] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Newsletter State
  const [optInNewsletter, setOptInNewsletter] = useState(true);
  const [optInNews, setOptInNews] = useState(true);
  
  // Error States
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

  useEffect(() => {
    setIsLogin(initialView === 'login');
  }, [initialView]);

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

  const handleLogin = async (e?: any) => {
    if(e) e.preventDefault();
    if (!loginInput || !password) return;
    setIsLoading(true);
    setLoadingText('Authenticating...');

    const isEmail = loginInput.includes('@');
    let emailToAuth = loginInput;

    if (!isEmail) {
      const { data, error } = await supabase.from('profiles').select('email').eq('username', loginInput.toLowerCase()).single();
      if (error || !data) {
        setToast({ msg: "User not found", type: 'error' });
        setIsLoading(false);
        return;
      }
      emailToAuth = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: emailToAuth, password });

    if (error) {
      setToast({ msg: error.message, type: 'error' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      onComplete();
    }
    setIsLoading(false);
  };

  const handleRegister = async (e?: any) => {
    if(e) e.preventDefault();
    if (!email || !password || !name || !username) return;
    if (password.length < 8) { setToast({msg: 'Password too short', type: 'error'}); return; }
    if (password !== confirmPassword) { setToast({msg: 'Passwords do not match', type: 'error'}); return; }
    if (emailError || usernameError) return;

    setIsLoading(true);
    setLoadingText('Architecting Profile...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username: username.toLowerCase(),
          units: detectSystemUnits(),
          opt_in_newsletter: optInNewsletter,
          opt_in_news: optInNews
        }
      }
    });

    if (error) {
      setToast({ msg: error.message, type: 'error' });
    } else if (data.user) {
      setToast({ msg: 'Account Created', type: 'success' });
      onComplete();
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) setToast({ msg: error.message, type: 'error' });
  };

  const loginFields = [
    {
      label: 'Email or Username',
      name: 'loginInput',
      type: 'text' as const,
      placeholder: 'Enter your credentials',
      value: loginInput,
      onChange: (e: any) => setLoginInput(e.target.value),
      required: true
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password' as const,
      placeholder: '••••••••',
      value: password,
      onChange: (e: any) => setPassword(e.target.value),
      required: true
    }
  ];

  const signupFields = [
    {
      label: 'Full Name',
      name: 'name',
      type: 'text' as const,
      placeholder: 'John Doe',
      value: name,
      onChange: (e: any) => setName(e.target.value),
      required: true
    },
    {
      label: 'Username',
      name: 'username',
      type: 'text' as const,
      placeholder: 'johndoe123',
      value: username,
      error: usernameError,
      onChange: (e: any) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')),
      required: true
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'email' as const,
      placeholder: 'john@example.com',
      value: email,
      error: emailError,
      onChange: (e: any) => setEmail(e.target.value.toLowerCase()),
      required: true
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password' as const,
      placeholder: 'Min. 8 characters',
      value: password,
      onChange: (e: any) => setPassword(e.target.value),
      required: true
    },
    {
      label: 'Confirm Password',
      name: 'confirmPassword',
      type: 'password' as const,
      placeholder: 'Repeat password',
      value: confirmPassword,
      onChange: (e: any) => setConfirmPassword(e.target.value),
      required: true
    }
  ];

  const signupFooter = (
    <div className="space-y-3 pt-2">
       <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center">
             <input
                type="checkbox"
                className="peer appearance-none h-5 w-5 border-2 border-slate-200 rounded-md checked:bg-[#A7F3D0] checked:border-[#A7F3D0] transition-all cursor-pointer"
                checked={optInNewsletter}
                onChange={e => setOptInNewsletter(e.target.checked)}
             />
             <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
          </div>
          <div className="flex-1">
             <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 flex items-center gap-2"><Mail size={12}/> Weekly Newsletter</p>
             <p className="text-[9px] text-slate-300 mt-0.5">Training tips straight to your inbox.</p>
          </div>
       </label>

       <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center">
             <input
                type="checkbox"
                className="peer appearance-none h-5 w-5 border-2 border-slate-200 rounded-md checked:bg-[#A7F3D0] checked:border-[#A7F3D0] transition-all cursor-pointer"
                checked={optInNews}
                onChange={e => setOptInNews(e.target.checked)}
             />
             <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
          </div>
          <div className="flex-1">
             <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 flex items-center gap-2"><Newspaper size={12}/> Fitness News</p>
             <p className="text-[9px] text-slate-300 mt-0.5">Updates on MEHRI platform.</p>
          </div>
       </label>

       <p className="text-[9px] text-slate-300 text-center leading-relaxed mt-4">
          By signing up, you agree to our
          <button onClick={() => onNavigate('terms')} className="text-[#A7F3D0] hover:text-emerald-500 cursor-pointer font-bold mx-1 uppercase tracking-wider hover:underline">Terms</button>
          and
          <button onClick={() => onNavigate('privacy')} className="text-[#A7F3D0] hover:text-emerald-500 cursor-pointer font-bold ml-1 uppercase tracking-wider hover:underline">Privacy</button>.
       </p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-white flex overflow-hidden ${shake ? 'animate-shake' : ''}`}>
      <Loader isVisible={isLoading} text={loadingText} onDismiss={() => setIsLoading(false)} />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left Side: Animated Orbit */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-50 items-center justify-center overflow-hidden border-r border-slate-100">
        <Ripple mainCircleSize={120} numCircles={8} className="opacity-40" />
        <TechOrbitDisplay iconsArray={iconsArray} text="MEHRI GROUP" />

        <div className="absolute bottom-12 left-12 right-12">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl">
                <p className="text-slate-900 font-serif italic text-lg leading-relaxed">
                    "The future of fitness is about understanding your data. MEHRI gives you the tools to reach your goals."
                </p>
                <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#A7F3D0]" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">Mehri Fitness</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Performance Tracking</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 relative overflow-y-auto custom-scrollbar py-12">
        <AuthTabs
          isLogin={isLogin}
          onToggleMode={() => setIsLogin(!isLogin)}
          isLoading={isLoading}
          fields={isLogin ? loginFields : signupFields}
          onSubmit={isLogin ? handleLogin : handleRegister}
          onGoogleLogin={handleGoogleLogin}
          footer={!isLogin ? signupFooter : undefined}
        />

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#A7F3D0] rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-200 rounded-full blur-[100px] opacity-30 pointer-events-none" />
      </div>
    </div>
  );
};
