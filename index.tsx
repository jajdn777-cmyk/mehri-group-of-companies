
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from "react-ga4";
import { safeParse, detectSystemUnits, calculateStreak, api, updateUserCache } from './utils.ts';
import { getLocalTodayStr } from './constants.ts';
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
import { PrivacyView } from './Privacy.tsx';
import { TermsView } from './Terms.tsx';
import { SEO } from './SEO.tsx';

// --- SCROLL PRESERVATION COMPONENT ---
const ScrollToTop = ({ view, dashView }: { view: string, dashView?: string }) => {
  useEffect(() => {
    // Instant reset to top on any view change
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
  '/contact': { view: 'landing' }, 
  '/dashboard': { view: 'main', dashView: 'dashboard' },
  '/stats': { view: 'main', dashView: 'stats' },
  '/goals': { view: 'main', dashView: 'goals' },
  '/routes': { view: 'main', dashView: 'routes' },
  '/challenges': { view: 'main', dashView: 'challenges' },
  '/alma': { view: 'main', dashView: 'alma' },
  '/alma-meals': { view: 'main', dashView: 'alma-meals' },
  '/blogs': { view: 'main', dashView: 'blogs' },
  '/write': { view: 'main', dashView: 'write' }, // NEW ROUTE
};

const App = () => {
  // --- INITIAL ROUTING LOGIC ---
  const getInitialState = () => {
    const path = window.location.pathname.replace(/\/$/, "") || "/"; 
    const session = localStorage.getItem('mehri_session_user');
    
    if (VALID_ROUTES[path]) {
        if ((VALID_ROUTES[path].view === 'main' || VALID_ROUTES[path].view === 'settings') && !session) {
            return { view: 'landing', dashView: 'dashboard' };
        }
        return VALID_ROUTES[path];
    }
    return { view: 'landing', dashView: 'dashboard' };
  };

  const initialState = getInitialState();

  const [view, setView] = useState<'landing' | 'auth' | 'specs' | 'goal' | 'main' | 'settings' | 'privacy' | 'terms'>(initialState.view as any);
  const [dashView, setDashView] = useState<'dashboard' | 'stats' | 'goals' | 'routes' | 'challenges' | 'alma' | 'alma-meals' | 'blogs' | 'write'>(initialState.dashView as any);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Use Refs to access current state in async functions without closures staleness
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  const [showShop, setShowShop] = useState(false);
  const [showAd, setShowAd] = useState(false); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false); 
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Connecting to Database...');

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

  // --- CINEMATIC AD TIMER (5 MINUTES) ---
  useEffect(() => {
    const adTimer = setInterval(() => {
       if (view !== 'auth' && view !== 'specs' && view !== 'goal') {
         setShowAd(true);
       }
    }, 300000); 

    return () => clearInterval(adTimer);
  }, [view]);

  // --- CHECK AUTH ON LOAD ---
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
       try {
           const sessionUser = localStorage.getItem('mehri_session_user');
           if (sessionUser && mounted) {
               setUserHandle(sessionUser);
               if (view === 'landing' || view === 'auth') {
                   setView('main');
               }
               await loadUserData(sessionUser);
           }
       } catch (error: any) {
           console.warn("Auth check error:", error);
       }
    };
    if (view !== 'privacy' && view !== 'terms') {
        checkAuth();
    }
    return () => { mounted = false; };
  }, []);

  // --- DATABASE SYNC ENGINE ---
  useEffect(() => {
    localStorage.setItem('mehri_view', view);
    if (userName) localStorage.setItem('mehri_name', JSON.stringify(userName));
    if (userHandle) localStorage.setItem('mehri_handle', JSON.stringify(userHandle));
  }, [view, userName, userHandle]);

  const loadUserData = async (handle: string) => {
    // Only show full loader on initial load or critical updates
    if (viewRef.current === 'landing' || viewRef.current === 'auth') {
        setIsLoading(true);
        setLoadingText("Syncing with Cloud Database...");
    }
    
    try {
        const response: any = await api("SYNC_USER", { username: handle });
        
        if (response?.status === 'error' && response?.message === 'Not logged in') {
            console.warn("Session error during sync.");
            if (viewRef.current === 'landing' || viewRef.current === 'auth') {
                // Silent failure - let user click login again
            }
            return;
        }

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

           const fixDate = (item: any) => {
              if (item.data_json && item.data_json.date) return item.data_json.date;
              if (item.date && typeof item.date === 'string' && item.date.match(/^\d{4}-\d{2}-\d{2}$/)) return item.date;
              const dateVal = item.date;
              if(!dateVal) return getLocalTodayStr();
              if (typeof dateVal === 'string' && dateVal.includes('T')) return dateVal.split('T')[0];
              return dateVal;
           };

           if (d.workouts) {
               const cleanWorkouts = d.workouts.map((w: any) => ({ ...w, date: fixDate(w) }));
               setWorkouts(cleanWorkouts);
           }
           if (d.goals) {
               const cleanGoals = d.goals.map((g: any) => ({ ...g, startDate: fixDate(g) }));
               setUserGoals(cleanGoals);
           }
           if (d.routes) {
               const cleanRoutes = (d.routes || []).map((r: any) => ({
                   ...r,
                   points: r.points || r.data?.points || [] 
               }));
               setRoutes(cleanRoutes);
           }
           if (d.meals) {
               const cleanMeals = d.meals.map((m: any) => ({ ...m, date: fixDate(m) }));
               setUserMeals(cleanMeals);
           }
           if (d.blogs) setBlogs(d.blogs || []);
           if (d.challenges) setUserChallenges(d.challenges || []);
           
           if (d.alma) {
               setAlmaMemories(d.alma.memories || []);
               setAlmaChats(d.alma.chats || []);
           }
        }
    } catch (e: any) {
        console.error("Critical Sync Error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const currentStreak = calculateStreak(workouts, userPreferences.restDay);

  const handleTransition = (
    nextView: 'landing' | 'auth' | 'specs' | 'goal' | 'main' | 'shop' | 'settings' | 'privacy' | 'terms', 
    nextDashView?: 'dashboard' | 'stats' | 'goals' | 'routes' | 'challenges' | 'alma' | 'alma-meals' | 'blogs' | 'write',
    customText?: string,
    skipLoader?: boolean
  ) => {
    if (!skipLoader) {
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
            if (nextView === 'terms') path = '/terms';
            if (nextView === 'main') {
                if (nextDashView === 'dashboard') path = '/dashboard';
                else if (nextDashView) path = `/${nextDashView}`;
            }
            try {
              window.history.pushState({}, '', path);
            } catch (e) {
              // History API restricted
            }

            if (nextView) setView(nextView);
            if (nextDashView) setDashView(nextDashView);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (!skipLoader) setIsLoading(false);
    };

    if (skipLoader) {
        executeTransition();
        setIsLoading(false);
    } else {
        setTimeout(executeTransition, 500);
    }
  };

  const navigateTo = (v: string) => {
    if (v === 'auth-login') {
        setAuthMode('login');
        handleTransition('auth');
        return;
    }
    if (v === 'auth-signup') {
        setAuthMode('signup');
        handleTransition('auth');
        return;
    }

    if (['dashboard', 'stats', 'goals', 'routes', 'challenges', 'alma', 'alma-meals', 'blogs', 'write'].includes(v)) {
      handleTransition('main', v as any);
    } else { 
      handleTransition(v as any); 
    }
  };

  const handleAuthComplete = async (data: any) => {
      const nameVal = data.name || data.auth?.name || '';
      const unitsVal = data.units || data.preferences?.units || 'metric';
      
      setUserName(nameVal);
      setUserHandle(data.username);
      
      const [first, ...rest] = nameVal.split(' ');
      const newProfile = {
        ...userProfile,
        firstName: first || '',
        lastName: rest.join(' ') || '',
        username: data.username,
        email: data.email || '',
        joinDate: data.joinDate || '1/27/2026'
      };
      setUserProfile(newProfile);
      
      setUserPreferences(prev => ({ ...prev, units: unitsVal }));

      if (data.isNewUser) {
          setIsNewUserFlow(true);
          handleTransition('specs', undefined, "Calibrating New Profile...");
      } else {
          await loadUserData(data.username);
          handleTransition('main', 'dashboard', "Welcome Back, Athlete.");
      }
  };

  const handleWatchPurchase = () => {
    const newProfile = { ...userProfile, hasWatch: true };
    setUserProfile(newProfile);
    api("UPDATE_PROFILE", { username: userHandle, profile: { hasWatch: true } });
    setShowShop(false);
    setShowAd(false); 
    alert("MEHRI Watch V1 Linked successfully. Profile Status: Elite.");
  };

  const handleSignOut = async (remoteLogout = true) => {
    if (remoteLogout) {
        setIsLoading(true);
        setLoadingText("Securely Logging Out...");
        await api("LOGOUT", {});
    }

    localStorage.removeItem('mehri_session_user');
    localStorage.removeItem('mehri_name');
    localStorage.removeItem('mehri_handle');
    setWorkouts([]);
    setRoutes([]);
    setUserGoals([]);
    setUserMeals([]);
    setBlogs([]);
    setUserChallenges([]);
    setAlmaChats([]);
    setAlmaMemories([]);
    
    setUserName('');
    setUserHandle('');
    setUserProfile(defaultProfile);
    
    if (remoteLogout) {
        setTimeout(() => {
            try { window.history.pushState({}, '', '/'); } catch (e) {}
            setView('landing');
            setIsLoading(false);
        }, 800);
    }
  };

  // --- BLOG HANDLERS ---
  const handlePublishBlog = async (data: any) => {
    const tempId = Date.now();
    const newPost = { 
        id: tempId, 
        author: userName || 'Admin', 
        username: userHandle, 
        category: 'Insight', 
        likes: 0, 
        ...data 
    };
    
    setBlogs([newPost, ...blogs]);
    setDashView('blogs');
    
    try {
        await api("PUBLISH_BLOG", { ...newPost, username: userHandle });
    } catch(e) { console.error(e); }
  };

  const handleDeleteBlog = async (id: number) => {
      try {
          const res = await api("DELETE_BLOG", { id });
          if (res.status === 'success') {
              setBlogs(prev => prev.filter((b: any) => b.id !== id));
          } else {
              alert("Could not delete blog post: " + res.message);
          }
      } catch (e) {
          console.error(e);
          alert("Network error deleting blog.");
      }
  };

  // Helper for dynamic SEO titles
  const getSEOTitle = () => {
    if (view === 'main') {
        return dashView.charAt(0).toUpperCase() + dashView.slice(1);
    }
    if (view === 'auth') return 'Sign In';
    if (view === 'settings') return 'Settings';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] font-sans text-slate-900 selection:bg-emerald-100 relative overflow-x-hidden">
      
      <ScrollToTop view={view} dashView={dashView} />
      <SEO title={getSEOTitle()} view={`${view}-${dashView}`} />

      <div className="fixed top-0 left-0 right-0 h-[1px] bg-slate-100 z-[10000]">
         <div className={`h-full bg-[#A7F3D0] transition-all duration-1000 ease-out ${isLoading ? 'w-[90%]' : 'w-full opacity-0'}`} />
      </div>

      <Loader isVisible={isLoading} text={loadingText} />
      
      {showOnboarding && (
        <OnboardingTour 
            onComplete={() => setShowOnboarding(false)} 
            onNavigate={(page: any) => handleTransition('main', page, undefined, true)}
        />
      )}
      
      {view !== 'privacy' && view !== 'terms' && dashView !== 'write' && (
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
      
      <main className={`${view === 'landing' || view === 'privacy' || view === 'terms' || dashView === 'write' ? '' : 'pt-28 md:pt-52 px-0 md:px-12 pb-20'}`}>
        {view === 'landing' && <LandingSection onStart={() => navigateTo('auth-signup')} />}
        {view === 'auth' && <AuthSection onComplete={handleAuthComplete} initialView={authMode} />}
        {view === 'privacy' && <PrivacyView onNavigate={navigateTo} />}
        {view === 'terms' && <TermsView onNavigate={navigateTo} />}
        {view === 'specs' && <SpecsSection specs={userSpecs} onComplete={(s: any) => { 
            setUserSpecs(s); 
            api("UPDATE_PROFILE", { username: userHandle, specs: s });
            handleTransition('goal', undefined, "Calibrating Bio-Metrics..."); 
        }} userPreferences={userPreferences} />}
        {view === 'goal' && (
            <OnboardingGoalSection onComplete={(goal: string) => { 
                handleTransition('main', 'dashboard', "Finalizing Setup..."); 
                if (isNewUserFlow) {
                    setTimeout(() => setShowOnboarding(true), 1500); 
                }
            }} />
        )}
        
        {view === 'settings' && (
          <div className="max-w-7xl mx-auto px-4 md:px-0">
             <SettingsView 
               userProfile={userProfile} 
               setUserProfile={setUserProfile} 
               userPreferences={userPreferences} 
               setUserPreferences={setUserPreferences}
               userSpecs={userSpecs}
               setUserSpecs={setUserSpecs}
               workouts={workouts}
               blogs={blogs}
               onShop={() => setShowShop(true)}
               userHandle={userHandle}
             />
          </div>
        )}

        {view === 'main' && (
          <div className={`${dashView === 'write' ? '' : 'max-w-7xl mx-auto'}`}>
            {dashView === 'dashboard' && <DashboardView workouts={workouts} setWorkouts={setWorkouts} userGoals={userGoals} setUserGoals={setUserGoals} routes={routes} userSpecs={userSpecs} userProfile={userProfile} userPreferences={userPreferences} userHandle={userHandle} onForceSync={() => loadUserData(userHandle)} />}
            {dashView === 'stats' && <div className="px-4 md:px-0"><StatsView workouts={workouts} userPreferences={userPreferences} /></div>}
            {dashView === 'routes' && <RoutesView routes={routes} setRoutes={setRoutes} userPreferences={userPreferences} userProfile={userProfile} userHandle={userHandle} />}
            {dashView === 'challenges' && <div className="px-4 md:px-0"><ChallengesView userChallenges={userChallenges} setUserChallenges={setUserChallenges} userHandle={userHandle} /></div>}
            
            {/* NEW BLOG COMPONENTS */}
            {dashView === 'blogs' && (
               <BlogList 
                  blogs={blogs} 
                  setBlogs={setBlogs} 
                  userProfile={userProfile} 
                  onNavigate={navigateTo} 
                  onDelete={handleDeleteBlog}
               />
            )}
            {dashView === 'write' && (
               <BlogWriting 
                  onClose={() => navigateTo('blogs')} 
                  onPublish={handlePublishBlog} 
                  userName={userName}
                  userProfile={userProfile}
               />
            )}

            {dashView === 'alma' && (
              <div className="px-2 md:px-0">
                <AlmaView 
                  workouts={workouts} 
                  setWorkouts={setWorkouts} 
                  userSpecs={userSpecs} 
                  userName={userName}
                  memories={almaMemories}
                  setMemories={setAlmaMemories}
                  chats={almaChats}
                  setChats={setAlmaChats}
                  routes={routes}
                  userPreferences={userPreferences}
                  userProfile={userProfile}
                  userHandle={userHandle}
                />
              </div>
            )}
            {dashView === 'alma-meals' && (
              <div className="px-4 md:px-0">
                <AlmaMealsView 
                  onNavigate={navigateTo} 
                  userMeals={userMeals} 
                  setUserMeals={setUserMeals}
                  userSpecs={userSpecs}
                  userProfile={userProfile}
                  workouts={workouts}
                  userHandle={userHandle}
                />
              </div>
            )}
            {dashView === 'goals' && <GoalsView userGoals={userGoals} setUserGoals={setUserGoals} onNavigate={navigateTo} userPreferences={userPreferences} userProfile={userProfile} userHandle={userHandle} workouts={workouts} />}
          </div>
        )}
      </main>
      
      {showShop && <ShopModal onClose={() => setShowShop(false)} onBuy={handleWatchPurchase} />}
      <AdInterstitial isOpen={showAd} onClose={() => setShowAd(false)} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
