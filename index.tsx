
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from "react-ga4";
import { safeParse, detectSystemUnits, calculateStreak, api, updateUserCache } from './utils.ts';
import { getLocalTodayStr, ADMIN_EMAIL } from './constants.ts';
import { Header } from './Header.tsx';
import { ShopModal } from './ShopModal.tsx';
import { AdInterstitial } from './AdInterstitial.tsx';
import { AlmaView } from './Alma.tsx';
import { AlmaMealsView } from './AlmaMeals.tsx';
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

// --- BOOT SCREEN (LOADING SHIELD) ---
const BootScreen = () => (
  <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center justify-center font-sans">
     <div className="relative flex flex-col items-center gap-8 animate-pulse">
        <img 
          src="https://i.ibb.co/8D5MPnyX/logo1-pixian-ai.png" 
          className="w-32 md:w-40 h-auto object-contain drop-shadow-2xl"
          alt="MEHRI OS"
        />
        <div className="flex flex-col items-center gap-2">
           <div className="h-0.5 w-32 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#A7F3D0] w-1/3 animate-[loading-bar_1s_infinite_ease-in-out]" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Initializing Core</p>
        </div>
     </div>
     <style>{`
        @keyframes loading-bar {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(300%); }
        }
     `}</style>
  </div>
);

// --- SCROLL PRESERVATION COMPONENT ---
const ScrollToTop = ({ view, dashView }: { view: string, dashView?: string }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, dashView]);
  return null;
};

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
           <h1 className="text-4xl font-black uppercase tracking-widest text-red-500 mb-4">System Failure</h1>
           <p className="text-slate-400 max-w-md mb-8">The application encountered a critical error.</p>
           <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-400">
              Hard Reset
           </button>
           <pre className="mt-8 text-xs text-slate-600 bg-slate-800 p-4 rounded max-w-lg overflow-auto text-left">
              {this.state.error?.toString()}
           </pre>
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
  '/alma': { view: 'main', dashView: 'alma' },
  '/alma-meals': { view: 'main', dashView: 'alma-meals' },
  '/blogs': { view: 'main', dashView: 'blogs' },
  '/write': { view: 'main', dashView: 'write' }, 
};

const App = () => {
  // --- INITIAL ROUTING LOGIC ---
  const getInitialState = () => {
    const path = window.location.pathname.replace(/\/$/, "") || "/"; 
    // We defer session checks to the Smart Entry logic, but set initial route view
    if (VALID_ROUTES[path]) {
        return VALID_ROUTES[path];
    }
    return { view: 'landing', dashView: 'dashboard' };
  };

  const initialState = getInitialState();

  const [view, setView] = useState<'landing' | 'auth' | 'specs' | 'goal' | 'main' | 'settings' | 'privacy' | 'terms'>(initialState.view as any);
  const [dashView, setDashView] = useState<'dashboard' | 'stats' | 'goals' | 'routes' | 'challenges' | 'alma' | 'alma-meals' | 'blogs' | 'write'>(initialState.dashView as any);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // GLOBAL LOADING SHIELD
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Use Refs to access current state in async functions without closures staleness
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  const [showShop, setShowShop] = useState(false);
  const [showAd, setShowAd] = useState(false); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false); 
  
  // Loading State (Internal app loading, separate from BootScreen)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');

  // Data State - SOLE SOURCE OF TRUTH
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [userMeals, setUserMeals] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  
  // Alma State
  const [almaMemories, setAlmaMemories] = useState<string[]>([]);
  const [almaChats, setAlmaChats] = useState<any[]>([]);

  // Profile State
  const [userSpecs, setUserSpecs] = useState({ weight: '70', height: '175' });
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

  const [userProfile, setUserProfile] = useState(defaultProfile);
  const [userPreferences, setUserPreferences] = useState({
    units: detectSystemUnits(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    restDay: ''
  });

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
        setView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- SMART ENTRY AUTH CONTROLLER ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 1. Session Detected (Login, Signup, or Persisted)
      if (session?.user) {
        setIsCheckingAuth(true); // Keep shield up while checking DB
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
              handleTransition('specs', undefined, undefined, true); // true = skip internal loader, BootScreen handles it
           } 
           // CASE C: Complete Profile (Returning User) -> Dashboard
           else {
              // Admin Special Case is implicitly handled here (routes to dashboard, admin features unlocked by email)
              await loadUserData(profile.username); // Pre-load data behind shield
              handleTransition('main', 'dashboard', undefined, true);
           }
        }
        
        // 5. Lower Shield
        setIsCheckingAuth(false);

      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
         // Handle Logout
         localStorage.clear();
         setWorkouts([]);
         setUserName('');
         setView('landing');
         setIsCheckingAuth(false);
      } else if (event === 'INITIAL_SESSION') {
         // If no session exists on startup, remove shield so landing page shows
         if (!session) {
             setIsCheckingAuth(false);
         }
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
              if (d.user.specs) setUserSpecs(d.user.specs);
              if (d.user.preferences) setUserPreferences(d.user.preferences);
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
           if (d.alma) { setAlmaMemories(d.alma.memories || []); setAlmaChats(d.alma.chats || []); }
        }
    } catch (e) { console.error("Sync Error:", e); }
  };

  const currentStreak = calculateStreak(workouts, userPreferences.restDay);

  const handleTransition = (
    nextView: 'landing' | 'auth' | 'specs' | 'goal' | 'main' | 'shop' | 'settings' | 'privacy' | 'terms', 
    nextDashView?: 'dashboard' | 'stats' | 'goals' | 'routes' | 'challenges' | 'alma' | 'alma-meals' | 'blogs' | 'write',
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
    if (['dashboard', 'stats', 'goals', 'routes', 'challenges', 'alma', 'alma-meals', 'blogs', 'write'].includes(v)) {
      handleTransition('main', v as any);
    } else { 
      handleTransition(v as any); 
    }
  };

  // Manual Auth Handler (Legacy/Non-Google)
  const handleAuthComplete = async (data: any) => {
      // Re-use smart logic via manual trigger if needed, but usually onAuthStateChange catches this too
      // if supabase.auth.signInWithPassword is used.
      // However, for immediate UI feedback in manual login:
      setIsCheckingAuth(true); // Raise shield manually
      await loadUserData(data.username);
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('username', data.username).single();
      if (profile && (!profile.weight || !profile.height)) {
          handleTransition('specs', undefined, undefined, true);
      } else {
          handleTransition('main', 'dashboard', undefined, true);
      }
      setIsCheckingAuth(false);
  };

  const handleWatchPurchase = () => {
    const newProfile = { ...userProfile, hasWatch: true };
    setUserProfile(newProfile);
    api("UPDATE_PROFILE", { username: userHandle, profile: { hasWatch: true } });
    setShowShop(false);
    alert("MEHRI Watch V1 Linked successfully. Profile Status: Elite.");
  };

  const handleSignOut = async (remoteLogout = true) => {
    if (remoteLogout) {
        setIsLoading(true);
        setLoadingText("Securely Logging Out...");
        await api("LOGOUT", {});
    }
    // Auth Listener will handle state clearing
  };

  // --- BLOG HANDLERS ---
  const handlePublishBlog = async (data: any) => {
    const tempId = Date.now();
    const newPost = { id: tempId, author: userName || 'Admin', username: userHandle, category: 'Insight', likes: 0, ...data };
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
    if (view === 'main') return dashView.charAt(0).toUpperCase() + dashView.slice(1);
    if (view === 'auth') return 'Sign In';
    if (view === 'settings') return 'Settings';
    if (view === 'privacy') return 'Privacy Policy';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] font-sans text-slate-900 selection:bg-emerald-100 relative overflow-x-hidden">
      
      {isCheckingAuth && <BootScreen />}

      <ScrollToTop view={view} dashView={dashView} />
      <SEO title={getSEOTitle()} view={`${view}-${dashView}`} />

      <Loader isVisible={isLoading} text={loadingText} />
      
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
                {view === 'landing' && <LandingSection onStart={() => navigateTo('auth-signup')} onNavigate={navigateTo} />}
                {view === 'auth' && <AuthSection onComplete={handleAuthComplete} initialView={authMode} onNavigate={navigateTo} />}
                {view === 'privacy' && <PrivacyPolicy onNavigate={navigateTo} />}
                {view === 'terms' && <TermsOfService onNavigate={navigateTo} />}
                
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
                    {dashView === 'dashboard' && <DashboardView workouts={workouts} setWorkouts={setWorkouts} userGoals={userGoals} setUserGoals={setUserGoals} routes={routes} userSpecs={userSpecs} userProfile={userProfile} userPreferences={userPreferences} userHandle={userHandle} onForceSync={() => loadUserData(userHandle)} />}
                    {dashView === 'stats' && <div className="px-4 md:px-0"><StatsView workouts={workouts} userPreferences={userPreferences} /></div>}
                    {dashView === 'routes' && <RoutesView routes={routes} setRoutes={setRoutes} userPreferences={userPreferences} userProfile={userProfile} userHandle={userHandle} />}
                    {dashView === 'challenges' && <div className="px-4 md:px-0"><ChallengesView userChallenges={userChallenges} setUserChallenges={setUserChallenges} userHandle={userHandle} /></div>}
                    
                    {dashView === 'blogs' && <BlogList blogs={blogs} setBlogs={setBlogs} userProfile={userProfile} onNavigate={navigateTo} onDelete={handleDeleteBlog} />}
                    {dashView === 'write' && <BlogWriting onClose={() => navigateTo('blogs')} onPublish={handlePublishBlog} userName={userName} userProfile={userProfile} />}

                    {dashView === 'alma' && (
                      <div className="px-2 md:px-0">
                        <AlmaView 
                          workouts={workouts} setWorkouts={setWorkouts} userSpecs={userSpecs} userName={userName}
                          memories={almaMemories} setMemories={setAlmaMemories} chats={almaChats} setChats={setAlmaChats}
                          routes={routes} userPreferences={userPreferences} userProfile={userProfile} userHandle={userHandle}
                        />
                      </div>
                    )}
                    {dashView === 'alma-meals' && (
                      <div className="px-4 md:px-0">
                        <AlmaMealsView 
                          onNavigate={navigateTo} userMeals={userMeals} setUserMeals={setUserMeals}
                          userSpecs={userSpecs} userProfile={userProfile} workouts={workouts} userHandle={userHandle}
                        />
                      </div>
                    )}
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
