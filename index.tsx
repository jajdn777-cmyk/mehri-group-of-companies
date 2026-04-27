
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from "react-ga4";
import { safeParse, detectSystemUnits, calculateStreak, api, updateUserCache } from './utils.ts';
import { getLocalTodayStr, ADMIN_EMAIL, FAQ_DATA } from './constants.ts';
import { Header } from './Header.tsx';
import { ShopModal } from './ShopModal.tsx';
import { AdInterstitial } from './AdInterstitial.tsx';
import { DashboardView } from './Dashboard.tsx';
import { StatsView } from './Stats.tsx';
import { RoutesView } from './Routes.tsx';
import { ChallengesView } from './Challenges.tsx';
import { GoalsView } from './Goals.tsx';
import { BlogList } from './BlogList.tsx';
import { BlogWriting } from './BlogWriting.tsx';
import { LandingSection } from './Landing.tsx';
import { AuthSection } from './Auth.tsx';
import { SpecsSection } from './Specs.tsx';
import { OnboardingGoalSection } from './OnboardingGoal.tsx';
import { SettingsView } from './Settings.tsx';
import { Loader } from './Loader.tsx';
import { OnboardingTour } from './OnboardingTour.tsx';
import { PrivacyPolicy } from './PrivacyPolicy.tsx';
import { TermsOfService } from './TermsOfService.tsx';
import { SEO } from './SEO.tsx';
import { supabase } from './supabaseClient.ts';
import NotFound from './NotFound.tsx';

// --- SCROLL PRESERVATION COMPONENT ---
const ScrollToTop = ({ view, dashView }: { view: string, dashView?: string }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, dashView]);
  return null;
};

// --- GLOBAL ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  countdown: number;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private redirectTimer: any;
  private intervalTimer: any;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, countdown: 4 };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: any, prevState: ErrorBoundaryState) {
    if (this.state.hasError && !prevState.hasError) {
      this.startCountdown();
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalTimer);
    clearTimeout(this.redirectTimer);
  }

  startCountdown = () => {
    this.intervalTimer = setInterval(() => {
      this.setState(prev => ({ countdown: Math.max(0, prev.countdown - 1) }));
    }, 1000);

    this.redirectTimer = setTimeout(() => {
      this.handleSmartRedirect();
    }, 4000);
  };

  handleSmartRedirect = () => {
    try {
      const keys = Object.keys(localStorage);
      const isLoggedIn = keys.some(key => key.includes("auth-token") && !!localStorage.getItem(key));
      window.location.href = isLoggedIn ? "/dashboard" : "/";
    } catch {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFCFC] flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-emerald-100">
           <div className="mb-8 relative flex justify-center">
              <div className="w-24 h-24 bg-[#A7F3D0]/30 rounded-[32px] flex items-center justify-center border border-emerald-100 shadow-sm relative z-10">
                 <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                 </svg>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />
           </div>

           <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 mb-4 leading-none">
              System<br/><span className="text-emerald-500">Glitch</span>
           </h1>
           
           <p className="text-slate-500 font-medium text-sm md:text-base max-w-md mb-10 leading-relaxed tracking-wide">
              We encountered an unexpected error. <br/>
              Redirecting you home in <span className="text-emerald-500 font-extrabold">{this.state.countdown}s</span>.
           </p>
           
           <button 
             onClick={this.handleSmartRedirect}
             className="bg-[#A7F3D0] text-emerald-900 px-10 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-300 transition-all shadow-sm active:scale-95"
           >
              Go Back Now
           </button>

           <div className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Error Code: MEHRI_CORE_ERR
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- ROUTING MAP ---
const VALID_ROUTES: Record<string, { view: string, dashView?: string }> = {
  '/': { view: 'landing' },
  '/auth': { view: 'auth' },
  '/specs': { view: 'specs' },
  '/goal': { view: 'goal' },
  '/settings': { view: 'settings' },
  '/privacy': { view: 'privacy' }, 
  '/terms': { view: 'terms' },
  '/terms-of-service': { view: 'terms' },
  '/contact': { view: 'landing' }, 
  '/dashboard': { view: 'main', dashView: 'dashboard' },
  '/stats': { view: 'main', dashView: 'stats' },
  '/goals': { view: 'main', dashView: 'goals' },
  '/routes': { view: 'main', dashView: 'routes' },
  '/challenges': { view: 'main', dashView: 'challenges' },
  '/blogs': { view: 'main', dashView: 'blogs' },
  '/write': { view: 'main', dashView: 'write' }, 
};

const PUBLIC_ROUTES = ['/', '/auth', '/privacy', '/terms', '/terms-of-service', '/contact', '/blogs'];

const App = () => {
  // --- INITIAL ROUTING LOGIC ---
  const getInitialState = () => {
    const path = window.location.pathname.replace(/\/$/, "") || "/"; 
    const isPublic = PUBLIC_ROUTES.includes(path);

    // Quick check for existing session markers
    const keys = typeof window !== 'undefined' ? Object.keys(localStorage) : [];
    const probablyHasSession = keys.some(key => key.includes("auth-token") && !!localStorage.getItem(key)) || (typeof window !== "undefined" && (window.location.hash.includes("access_token") || window.location.hash.includes("id_token")));


    // If on a protected route but no session marker, force landing early to avoid ghosting
    if (!isPublic && !probablyHasSession) {
        return { view: 'landing', dashView: 'dashboard' };
    }

    if (VALID_ROUTES[path]) {
        return VALID_ROUTES[path];
    }
    return { view: 'notfound', dashView: 'dashboard' };
  };

  const initialState = getInitialState();

  const [view, setView] = useState<'landing' | 'auth' | 'specs' | 'goal' | 'main' | 'settings' | 'privacy' | 'terms' | 'notfound'>(initialState.view as any);
  const [dashView, setDashView] = useState<'dashboard' | 'stats' | 'goals' | 'routes' | 'challenges' | 'blogs' | 'write'>(initialState.dashView as any);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // GLOBAL LOADING SHIELD
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Use Refs to access current state in async functions without closures staleness
  const viewRef = useRef(view);
  const hasLoadedSession = useRef(false); // Track if we've already handled the session load
  
  useEffect(() => { viewRef.current = view; }, [view]);

  const [showShop, setShowShop] = useState(false);
  const [showAd, setShowAd] = useState(false); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false); 
  
  // Loading State (Internal app loading, separate from BootScreen)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');

  // Data State - SOLE SOURCE OF TRUTH
  const [workouts, setWorkouts] = useState<any[]>(() => safeParse('mehri_workouts', []));
  const [userGoals, setUserGoals] = useState<any[]>(() => safeParse('mehri_goals', []));
  const [routes, setRoutes] = useState<any[]>(() => safeParse('mehri_routes', []));
  const [userMeals, setUserMeals] = useState<any[]>(() => safeParse('mehri_meals', []));
  const [blogs, setBlogs] = useState<any[]>(() => safeParse('mehri_blogs', []));
  const [userChallenges, setUserChallenges] = useState<any[]>(() => safeParse('mehri_challenges', []));
  

  // Profile State
  const [userSpecs, setUserSpecs] = useState(() => safeParse('mehri_specs', { weight: '70', height: '175' }));
  const [userName, setUserName] = useState(() => safeParse('mehri_name', '')); 
  const [userHandle, setUserHandle] = useState(() => safeParse('mehri_handle', '')); 

  const defaultProfile = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    birthdate: '',
    gender: '',
    city: '',
    state: '',
    location: '',
    joinDate: '1/27/2026',
    friends: 0,
    hasWatch: false,
    currentStreak: 0
  };

  const [userProfile, setUserProfile] = useState(() => safeParse('mehri_profile', defaultProfile));
  const [userPreferences, setUserPreferences] = useState(() => safeParse('mehri_preferences', {
    units: detectSystemUnits(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    restDay: ''
  }));

  // --- ANALYTICS INITIALIZATION ---
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
        ReactGA.initialize("G-T4HC5W541K");
    }
  }, []);

  // --- BROWSER HISTORY LISTENER ---
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/$/, "") || "/";
      const route = VALID_ROUTES[path];
      if (route) {
           setView(route.view as any);
           if (route.dashView) setDashView(route.dashView as any);
      } else {
        setView('notfound');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- FAILSAFE LOADER TIMEOUT ---
  // If the loader (auth check or app loading) gets stuck, force it off.
  useEffect(() => {
    if (isLoading || isCheckingAuth) {
      // Reduced timeout to 4s to be very responsive to "forever loading" complaints
      const timer = setTimeout(() => {
        console.warn("Loader timed out. Forcing UI reveal.");
        setIsLoading(false);
        setIsCheckingAuth(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isCheckingAuth]);

  // --- SMART ENTRY AUTH CONTROLLER ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // IGNORE NON-CRITICAL EVENTS TO PREVENT UI FLASHING
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;

      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const isPublic = PUBLIC_ROUTES.includes(currentPath);

      // 1. Session Detected (Login, Signup, or Initial Load)
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Double check shield - don't raise it if we already have data visible
        // Check if we already have a hydrated state to avoid flickering
        const hasData = userHandle || localStorage.getItem('mehri_handle');
        if (!hasLoadedSession.current && !hasData) {
            setIsCheckingAuth(true); 
        }
        
        try {
            const user = session.user;
            const metadata = user.user_metadata || {};

            // 2. Identify User in Database
            let { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            // 3. CASE A: Profile Missing (Brand New User) -> Create Profile
            if (!profile) {
               const newUsername = `@${(metadata.full_name || user.email?.split('@')[0] || 'user').replace(/\s+/g, '').toLowerCase()}`;
               const { data: newProfile, error } = await supabase
                 .from('profiles')
                 .insert({
                   id: user.id,
                   email: user.email,
                   full_name: metadata.full_name,
                   username: newUsername,
                   units: 'metric',
                   join_date: new Date().toISOString()
                 })
                 .select()
                 .single();
               
               if (newProfile) {
                 profile = newProfile;
                 setIsNewUserFlow(true);
               }
            }

            // 4. Determine Route based on Profile State
            if (profile) {
               // Sync Local State immediately
               localStorage.setItem('mehri_session_user', profile.username);
               setUserName(profile.full_name || '');
               setUserHandle(profile.username);

               // CASE B: Incomplete Specs -> Force Onboarding
               if (!profile.weight || !profile.height) {
                  handleTransition('specs', undefined, undefined, true); // true = skip internal loader
               } 
               // CASE C: Complete Profile (Returning User) -> Dashboard
               else {
                  if (!hasLoadedSession.current) {
                      await loadUserData(profile.username); // Pre-load data behind shield
                  }

                  // If they just signed in (and aren't already in the app), take them to dashboard.
                  // If it's an initial session, they stay on their current route.
                  if ((event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && (currentPath === '/' || currentPath === '/auth'))) && viewRef.current !== 'main') {
                     handleTransition('main', 'dashboard', undefined, true);
                  }
               }
            }
        } catch (error) {
            console.error("Critical Auth Error:", error);
            // Fallback to landing if auth processing fails completely
            setView('notfound');
        } finally {
            // 5. Lower Shield & Mark Session as Loaded
            // CRITICAL: This ensures the loader ALWAYS disappears, even if errors occur above
            hasLoadedSession.current = true;
            setIsCheckingAuth(false);
        }

      } else if (event === 'SIGNED_OUT' || (event as string) === 'USER_DELETED' || (event === 'INITIAL_SESSION' && !session)) {
         const hasData = userHandle || localStorage.getItem('mehri_handle');

         // Only treat INITIAL_SESSION with no session as a "logout" if we don't have cached data
         // or if we're on a protected route.
         const hasHash = typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('id_token'));
         const shouldRedirect = !isPublic && !hasData && !hasHash;

         if (event === 'SIGNED_OUT' || (event as string) === 'USER_DELETED' || shouldRedirect) {
            if (!isPublic || (currentPath === "/" && viewRef.current === "main")) {
                handleTransition("landing", "dashboard", "/", true);
            }

            if (event === 'SIGNED_OUT' || (event as string) === 'USER_DELETED') {
                localStorage.clear();
                setWorkouts([]);
                setUserName('');
                setUserHandle('');
                hasLoadedSession.current = false;
            }
         }

         hasLoadedSession.current = true;
         setIsCheckingAuth(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- DATABASE SYNC ENGINE ---
  const loadUserData = async (handle: string) => {
    try {
        const response: any = await api("SYNC_USER", { username: handle });
        if (response?.status === 'success' && response?.data) {
           const d = response.data;
           if (d.user) {
              setUserName(d.user.auth.name || "");
              setUserHandle(d.user.username);
              const newProfile = {
                 ...userProfile,
                 username: d.user.username,
                 email: d.user.email, 
                 firstName: d.user.auth.name ? d.user.auth.name.split(' ')[0] : '',
                 lastName: d.user.auth.name ? d.user.auth.name.split(' ').slice(1).join(' ') : '',
                 joinDate: d.user.auth.joinDate || '1/27/2026',
                 ...d.user.profile,
                 currentStreak: d.user.streaks?.current || 0
              };
              setUserProfile(newProfile);
              localStorage.setItem('mehri_profile', JSON.stringify(newProfile));
              if (d.user.specs) {
                  setUserSpecs(d.user.specs);
                  localStorage.setItem('mehri_specs', JSON.stringify(d.user.specs));
              }
              if (d.user.preferences) {
                  setUserPreferences(d.user.preferences);
                  localStorage.setItem('mehri_preferences', JSON.stringify(d.user.preferences));
              }
           }
           // Data hydration...
           const fixDate = (item: any) => {
              if (item.data_json && item.data_json.date) return item.data_json.date;
              if (item.date && typeof item.date === 'string' && item.date.match(/^\d{4}-\d{2}-\d{2}$/)) return item.date;
              return item.date || getLocalTodayStr();
           };
           if (d.workouts) setWorkouts(d.workouts.map((w: any) => ({ ...w, date: fixDate(w) })));
           if (d.goals) setUserGoals(d.goals.map((g: any) => ({ ...g, startDate: fixDate(g) })));
           if (d.routes) setRoutes(d.routes || []);
           if (d.meals) setUserMeals(d.meals.map((m: any) => ({ ...m, date: fixDate(m) })));
           if (d.blogs) setBlogs(d.blogs || []);
           if (d.challenges) setUserChallenges(d.challenges || []);

        }
    } catch (e) { console.error("Sync Error:", e); }
  };

  const currentStreak = calculateStreak(workouts, userPreferences.restDay);

  const handleTransition = (
    nextView: 'landing' | 'auth' | 'specs' | 'goal' | 'main' | 'shop' | 'settings' | 'privacy' | 'terms', 
    nextDashView?: 'dashboard' | 'stats' | 'goals' | 'routes' | 'challenges' | 'blogs' | 'write',
    customText?: string,
    skipLoader?: boolean
  ) => {
    if (!skipLoader && !isCheckingAuth) {
        setLoadingText(customText || "Loading...");
        setIsLoading(true);
    }
    
    const executeTransition = () => {
        if (nextView === 'shop') {
            setShowShop(true);
        } else {
            let path = '/';
            if (nextView === 'auth') path = '/auth';
            if (nextView === 'specs') path = '/specs';
            if (nextView === 'goal') path = '/goal';
            if (nextView === 'settings') path = '/settings';
            if (nextView === 'privacy') path = '/privacy';
            if (nextView === 'terms') path = '/terms-of-service';
            if (nextView === 'main') {
                if (nextDashView === 'dashboard') path = '/dashboard';
                else if (nextDashView) path = `/${nextDashView}`;
            }
            try { window.history.pushState({}, '', path); } catch (e) {}

            setView(nextView);
            if (nextDashView) setDashView(nextDashView);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (!skipLoader) setIsLoading(false);
    };

    if (skipLoader || isCheckingAuth) {
        executeTransition();
    } else {
        setTimeout(executeTransition, 500);
    }
  };

  const navigateTo = (v: string) => {
    if (v === 'auth-login') { setAuthMode('login'); handleTransition('auth'); return; }
    if (v === 'auth-signup') { setAuthMode('signup'); handleTransition('auth'); return; }
    if (['dashboard', 'stats', 'goals', 'routes', 'challenges', 'blogs', 'write'].includes(v)) {
      handleTransition('main', v as any);
    } else { 
      handleTransition(v as any); 
    }
  };

  // Manual Auth Handler (Legacy/Non-Google)
  const handleAuthComplete = async (data: any) => {
      setIsCheckingAuth(true); // Raise shield manually
      try {
          await loadUserData(data.username);
          
          const { data: profile } = await supabase.from('profiles').select('*').eq('username', data.username).single();
          if (profile && (!profile.weight || !profile.height)) {
              handleTransition('specs', undefined, undefined, true);
          } else {
              handleTransition('main', 'dashboard', undefined, true);
          }
      } finally {
          setIsCheckingAuth(false);
          hasLoadedSession.current = true;
      }
  };

  const handleWatchPurchase = () => {
    const newProfile = { ...userProfile, hasWatch: true };
    setUserProfile(newProfile);
    api("UPDATE_PROFILE", { username: userHandle, profile: { hasWatch: true } });
    setShowShop(false);
    alert("MEHRI Watch V1 Linked successfully. Profile Status: Elite.");
  };

  const handleSignOut = async (remoteLogout = true) => {
    try {
        if (remoteLogout) {
            setIsLoading(true);
            setLoadingText("Securely Logging Out...");
            await api("LOGOUT", {});
        }
    } catch (e) {
        console.error("Logout Error:", e);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/");
    }
  };

  // --- BLOG HANDLERS ---
  const handlePublishBlog = async (data: any) => {
    const tempId = Date.now();
    const newPost = { id: tempId, author: userName || 'Admin', username: userHandle, category: 'Insight', likes_count: 0, ...data };
    setBlogs([newPost, ...blogs]);
    setDashView('blogs');
    try { await api("PUBLISH_BLOG", { ...newPost, username: userHandle }); } catch(e) { console.error(e); }
  };

  const handleDeleteBlog = async (id: number) => {
      try {
          const res = await api("DELETE_BLOG", { id });
          if (res.status === 'success') {
              setBlogs(prev => prev.filter((b: any) => b.id !== id));
          } else {
              alert("Could not delete blog post: " + res.message);
          }
      } catch (e) { console.error(e); }
  };

  // Helper for dynamic SEO titles
  const getSEOTitle = () => {
    if (view === 'main') return dashView === "dashboard" ? "Dashboard" : dashView.charAt(0).toUpperCase() + dashView.slice(1);
    if (view === 'auth') return 'Sign In';
    if (view === 'settings') return 'Settings';
    if (view === 'privacy') return 'Privacy Policy';
    if (view === 'notfound') return 'Page Not Found';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] font-sans text-slate-900 selection:bg-emerald-100 relative overflow-x-hidden">
      
      <ScrollToTop view={view} dashView={dashView} />
      <SEO title={getSEOTitle()} view={`${view}-${dashView}`} faq={view === "landing" ? FAQ_DATA : undefined} />

      {/* Unified Loader that handles both app transitions and initial auth check */}
      <Loader 
        isVisible={isLoading || isCheckingAuth} 
        text={loadingText || "Initializing Core..."} 
        onDismiss={() => {
            console.warn("Manual loader dismiss triggered");
            setIsLoading(false);
            setIsCheckingAuth(false);
        }}
      />
      
      {showOnboarding && (
        <OnboardingTour 
            onComplete={() => setShowOnboarding(false)} 
            onNavigate={(page: any) => handleTransition('main', page, undefined, true)}
        />
      )}
      
      {/* HEADER RENDER LOGIC */}
      {!isCheckingAuth && view !== 'privacy' && view !== 'terms' && dashView !== 'write' && (
        <Header 
          currentView={view === 'main' ? dashView : view} 
          onNavigate={navigateTo} 
          onSignOut={() => handleSignOut(true)} 
          onShop={() => setShowShop(true)}
          userProfile={userProfile}
          userName={userName}
          streak={currentStreak}
        />
      )}
      
      {/* MAIN CONTENT AREA */}
      <main className={`${view === 'landing' || view === 'privacy' || view === 'terms' || dashView === 'write' ? '' : 'pt-28 md:pt-52 px-0 md:px-12 pb-20'}`}>
        {!isCheckingAuth && (
            <>
                {view === 'landing' && <LandingSection onStart={() => navigateTo('auth-signup')} onNavigate={navigateTo} onShop={() => setShowShop(true)} />}
                {view === 'auth' && <AuthSection onComplete={handleAuthComplete} initialView={authMode} onNavigate={navigateTo} />}
                {view === 'privacy' && <PrivacyPolicy onNavigate={navigateTo} />}
                {view === 'terms' && <TermsOfService onNavigate={navigateTo} />}
                {view === 'notfound' && <NotFound onNavigate={navigateTo} />}
                
                {view === 'specs' && (
                    <SpecsSection specs={userSpecs} userPreferences={userPreferences} onComplete={(s: any) => { 
                        setUserSpecs(s); 
                        api("UPDATE_PROFILE", { username: userHandle, specs: s });
                        handleTransition('goal', undefined, "Calibrating Bio-Metrics..."); 
                    }} />
                )}
                
                {view === 'goal' && (
                    <OnboardingGoalSection onComplete={(goal: string) => { 
                        handleTransition('main', 'dashboard', "Finalizing Setup..."); 
                        if (isNewUserFlow) setTimeout(() => setShowOnboarding(true), 1500); 
                    }} />
                )}
                
                {view === 'settings' && (
                  <div className="max-w-7xl mx-auto px-4 md:px-0">
                     <SettingsView 
                       userProfile={userProfile} setUserProfile={setUserProfile} 
                       userPreferences={userPreferences} setUserPreferences={setUserPreferences}
                       userSpecs={userSpecs} setUserSpecs={setUserSpecs}
                       workouts={workouts} blogs={blogs} onShop={() => setShowShop(true)} userHandle={userHandle}
                     />
                  </div>
                )}

                {view === 'main' && (
                  <div className={`${dashView === 'write' ? '' : 'max-w-7xl mx-auto'}`}>
                    {dashView === 'dashboard' && (
                      <DashboardView
                        workouts={workouts} setWorkouts={setWorkouts}
                        userGoals={userGoals} setUserGoals={setUserGoals}
                        routes={routes} userSpecs={userSpecs} userProfile={userProfile}
                        userPreferences={userPreferences} userHandle={userHandle}
                        onForceSync={() => loadUserData(userHandle)}
                        userMeals={userMeals}
                        onNavigate={navigateTo}
                      />
                    )}
                    {dashView === 'stats' && (
                      <div className="px-4 md:px-0">
                        <StatsView
                          workouts={workouts}
                          userPreferences={userPreferences}
                          userMeals={userMeals}
                          userSpecs={userSpecs}
                          userProfile={userProfile}
                        />
                      </div>
                    )}
                    {dashView === 'routes' && <RoutesView routes={routes} setRoutes={setRoutes} userPreferences={userPreferences} userProfile={userProfile} userHandle={userHandle} />}
                    {dashView === 'challenges' && <div className="px-4 md:px-0"><ChallengesView userChallenges={userChallenges} setUserChallenges={setUserChallenges} userHandle={userHandle} /></div>}
                    
                    {dashView === 'blogs' && <BlogList blogs={blogs} setBlogs={setBlogs} userProfile={userProfile} onNavigate={navigateTo} onDelete={handleDeleteBlog} />}
                    {dashView === 'write' && <BlogWriting onClose={() => navigateTo('blogs')} onPublish={handlePublishBlog} userName={userName} userProfile={userProfile} />}

                    {dashView === 'goals' && <GoalsView userGoals={userGoals} setUserGoals={setUserGoals} onNavigate={navigateTo} userPreferences={userPreferences} userProfile={userProfile} userHandle={userHandle} workouts={workouts} />}
                  </div>
                )}
            </>
        )}
      </main>
      
      {showShop && <ShopModal onClose={() => setShowShop(false)} onBuy={handleWatchPurchase} />}
      <AdInterstitial isOpen={showAd && !isCheckingAuth} onClose={() => setShowAd(false)} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
