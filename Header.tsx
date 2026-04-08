
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Brain, ShoppingBag, X, Newspaper, User, Settings, LogOut, MessageSquare, Utensils, Zap, Flame, Menu, Map as MapIcon, Trophy, Target, BarChart2, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = ({ currentView, onNavigate, onSignOut, onShop, userProfile, userName, streak = 0, hasAlmaNotification }: any) => {
  const [scrolled, setScrolled] = useState(false);
  const [workoutsHover, setWorkoutsHover] = useState(false);
  const [almaHover, setAlmaHover] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'workouts': true, // Default open for convenience
    'community': false,
    'alma': false
  });

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Click outside handler for profile menu
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDashboard = ['dashboard', 'stats', 'goals', 'routes', 'challenges', 'alma', 'alma-meals', 'blogs', 'settings'].includes(currentView);
  const isTransparent = !scrolled && !isDashboard && currentView !== 'auth';

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const MobileMenuSection = ({ label, isOpen, onToggle, children }: any) => (
    <div className="border-b border-slate-50 last:border-0">
      <button 
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left active:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-black uppercase tracking-widest text-slate-900">{label}</span>
        <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 bg-slate-50/50 ${isOpen ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
         {children}
      </div>
    </div>
  );

  const MobileSubLink = ({ onClick, label, icon: Icon, badge }: any) => (
    <button 
      type="button"
      onClick={() => { onClick(); setMobileMenuOpen(false); }} 
      className="w-full flex items-center gap-3 pl-10 pr-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors"
    >
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label}
      {badge && (
        <span className="ml-auto w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">1</span>
      )}
    </button>
  );

  const MobileDirectLink = ({ onClick, label }: any) => (
    <button 
      type="button"
      onClick={() => { onClick(); setMobileMenuOpen(false); }} 
      className="w-full flex items-center justify-between px-6 py-5 text-left border-b border-slate-50 active:bg-slate-50 transition-colors"
    >
      <span className="text-sm font-black uppercase tracking-widest text-slate-900">{label}</span>
    </button>
  );

  return (
    <>
      {/* HEADER BAR - Adjusted alignment (items-start) and trimmed height to reduce dead space */}
      <header className={`fixed top-0 left-0 right-0 h-28 md:h-48 z-[5000] transition-all duration-700 px-4 md:px-8 flex items-start pt-3 md:pt-6 justify-between ${scrolled || isDashboard || currentView === 'auth' || mobileMenuOpen ? 'bg-white/70 backdrop-blur-[12px] border-b border-slate-100/50 shadow-sm' : 'bg-transparent'}`}>
        
        <div className="flex items-start gap-4">
            {/* MOBILE: HAMBURGER (LEFT) - Pushed down slightly to align with logo visual center */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              aria-label="Open navigation menu"
              className={`md:hidden p-2 -ml-2 mt-3 rounded-full transition-colors z-[5050] ${isTransparent && !mobileMenuOpen ? 'text-white' : 'text-slate-900 hover:bg-slate-100'}`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </motion.button>

            {/* LOGO (LEFT ALIGNED) - Pulled up with negative margin */}
            <motion.button
              type="button"
              aria-label="Go to home"
              className="relative flex items-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all z-50" 
              onClick={() => {
                if (userProfile?.username) {
                  onNavigate('dashboard');
                } else {
                  onNavigate('landing');
                }
              }}
            >
              {/* Backlight Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/30 blur-[50px] rounded-full pointer-events-none -mt-8 md:-mt-12" />

              {/* Direct IMG for precise size control - Fixed dimensions, pulled up via negative margin */}
              <img 
                 src="https://i.ibb.co/xqxm5rCT/logo-mehri-no-bg.png" 
                 alt="Mehri Logo"
                 className="relative z-10 w-auto object-contain drop-shadow-sm h-40 md:h-64 -mt-10 md:-mt-20 -ml-2 md:-ml-6"
              />
            </motion.button>
        </div>
        
        {/* MOBILE: PROFILE AVATAR (RIGHT) */}
        <div className="md:hidden z-[5050] mt-3">
           {isDashboard || currentView === 'main' ? (
             <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className={`w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs border border-slate-200 shadow-sm ${userProfile?.hasWatch ? 'ring-2 ring-[#A7F3D0] ring-offset-1' : ''}`}
             >
                {getInitials(userName || userProfile?.firstName)}
             </button>
           ) : (
             <div className="w-9 h-9" /> /* Spacer */
           )}
        </div>

        {/* DESKTOP NAVIGATION (HIDDEN ON MOBILE) - Pushed down to center relative to header height */}
        <nav className="hidden md:flex items-center flex-1 w-full pl-6 mt-4 md:mt-6">
          {isDashboard || currentView === 'main' ? (
            <>
              {/* MAIN LINKS */}
              <div className="flex items-center gap-8 ml-6">
                  <div
                    className="relative py-4"
                    onMouseEnter={() => setWorkoutsHover(true)}
                    onMouseLeave={() => setWorkoutsHover(false)}
                    onFocusCapture={() => setWorkoutsHover(true)}
                    onBlurCapture={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setWorkoutsHover(false);
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={workoutsHover}
                      className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-1 transition-colors whitespace-nowrap ${workoutsHover ? 'text-emerald-500' : 'text-slate-900'}`}
                    >
                      Workouts <ChevronDown size={12} className={`transition-transform duration-500 ${workoutsHover ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                    {workoutsHover && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-10 -left-10 pt-4"
                      >
                        <div className="w-64 bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-slate-100 p-6 flex flex-col gap-3">
                          <button type="button" onClick={() => {onNavigate('dashboard'); setWorkoutsHover(false);}} className="w-full text-left px-8 py-4 rounded-[25px] hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Dashboard</button>
                          <button type="button" onClick={() => {onNavigate('stats'); setWorkoutsHover(false);}} className="w-full text-left px-8 py-4 rounded-[25px] hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Stats</button>
                          <button type="button" onClick={() => {onNavigate('goals'); setWorkoutsHover(false);}} className="w-full text-left px-8 py-4 rounded-[25px] hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Goals</button>
                        </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                  
                  <button type="button" onClick={() => onNavigate('routes')} className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-500 transition-colors whitespace-nowrap">Routes</button>
                  <button type="button" onClick={() => onNavigate('challenges')} className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-500 transition-colors whitespace-nowrap">Challenges</button>
                  <button type="button" onClick={() => onNavigate('blogs')} className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-500 transition-colors flex items-center gap-1 whitespace-nowrap">Blogs</button>
                  
                  {/* ALMA HOVER MENU */}
                  <div
                    className="relative py-4"
                    onMouseEnter={() => setAlmaHover(true)}
                    onMouseLeave={() => setAlmaHover(false)}
                    onFocusCapture={() => setAlmaHover(true)}
                    onBlurCapture={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setAlmaHover(false);
                      }
                    }}
                  >
                     <button
                       type="button"
                       onClick={() => onNavigate('alma')}
                       aria-haspopup="menu"
                       aria-expanded={almaHover}
                       className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-1 transition-colors whitespace-nowrap relative ${almaHover ? 'text-emerald-500' : 'text-slate-900'}`}
                     >
                        <Brain size={12}/> Alma
                        {hasAlmaNotification && (
                           <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse shadow-sm border border-white">1</span>
                        )}
                     </button>
                     <AnimatePresence>
                     {almaHover && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-10 -left-10 pt-4"
                        >
                          <div className="w-72 bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-slate-100 p-6 flex flex-col gap-3">
                             <button type="button" onClick={() => {onNavigate('alma'); setAlmaHover(false);}} className="w-full text-left px-6 py-4 rounded-[25px] hover:bg-slate-50 flex items-center gap-4 group transition-all">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#A7F3D0] group-hover:text-slate-900 transition-colors"><MessageSquare size={14}/></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Ask Alma</span>
                             </button>
                             <button type="button" onClick={() => {onNavigate('alma-meals'); setAlmaHover(false);}} className="w-full text-left px-6 py-4 rounded-[25px] hover:bg-slate-50 flex items-center gap-4 group transition-all">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#A7F3D0] group-hover:text-slate-900 transition-colors"><Utensils size={14}/></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Meal Tracker</span>
                             </button>
                             <button type="button" onClick={() => {onNavigate('alma'); setAlmaHover(false);}} className="w-full text-left px-6 py-4 rounded-[25px] hover:bg-slate-50 flex items-center gap-4 group transition-all">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#A7F3D0] group-hover:text-slate-900 transition-colors"><Zap size={14}/></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Daily Insights</span>
                             </button>
                          </div>
                        </motion.div>
                     )}
                     </AnimatePresence>
                  </div>
              </div>

              {/* USER ACTIONS */}
              <div className="flex items-center gap-6 ml-auto shrink-0 pl-4">
                  <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={onShop} className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-500 transition-colors flex items-center gap-1 whitespace-nowrap"><ShoppingBag size={14} className="w-4 h-4"/> Shop</motion.button>
                  
                  <div className="relative flex items-center gap-3" ref={profileMenuRef}>
                    {streak > 0 && (
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-500 ${streak >= 30 ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : streak >= 7 ? 'bg-[#A7F3D0]/20 text-emerald-600 ring-1 ring-[#A7F3D0]' : 'bg-slate-50 text-emerald-500 border border-emerald-100'}`}>
                         <Flame size={12} className={`${streak >= 30 ? 'fill-emerald-500 animate-pulse drop-shadow-sm' : streak >= 7 ? 'fill-emerald-500' : 'text-emerald-500'}`} />
                         <span className="text-[10px] font-black">{streak}</span>
                      </div>
                    )}

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      aria-label="Toggle profile menu"
                      className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs cursor-pointer hover:bg-slate-200 transition-all select-none ${userProfile?.hasWatch ? 'ring-2 ring-[#A7F3D0] ring-offset-2' : ''}`}
                    >
                      {getInitials(userName || userProfile?.firstName)}
                    </motion.button>
                    
                    <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-12 right-0 w-64 bg-slate-900/95 backdrop-blur-xl rounded-[20px] shadow-2xl p-2 border border-slate-800 flex flex-col gap-1 overflow-hidden z-[5010]"
                      >
                         <div className="px-4 py-3 border-b border-slate-800 mb-1">
                            <p className="text-white text-xs font-bold truncate">{userName}</p>
                            <p className="text-slate-500 text-[10px] truncate">{userProfile?.username}</p>
                         </div>
                         <button type="button" onClick={() => { setShowProfileMenu(false); onNavigate('settings'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-3">
                            <User size={14}/> View Profile
                         </button>
                         <button type="button" onClick={() => { setShowProfileMenu(false); onNavigate('settings'); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-3">
                            <Settings size={14}/> Settings
                         </button>
                         <div className="h-px bg-slate-800 my-1"/>
                         <button type="button" onClick={() => { setShowProfileMenu(false); onSignOut(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center gap-3">
                            <LogOut size={14}/> Sign Out
                         </button>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
              </div>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-6">
              <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={onShop} className={`text-xs font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-1 ${isTransparent ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-500'}`}>
                <ShoppingBag size={14}/> Shop
              </motion.button>
              <div className={`w-px h-4 ${isTransparent ? 'bg-white/20' : 'bg-slate-200'}`} />
              <motion.button type="button" whileHover={{ scale: 1.05 }} onClick={() => onNavigate('auth-login')} className={`text-xs font-black uppercase tracking-[0.4em] transition-colors ${isTransparent ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-500'}`}>Sign In</motion.button>
              <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('auth-signup')} className="bg-slate-900 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.5em] shadow-2xl transition-all">Get Started</motion.button>
            </div>
          )}
        </nav>
      </header>

      {/* MOBILE DRAWER NAVIGATION (SLIDE-IN FROM LEFT) */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* 1. Backdrop Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-md" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* 2. Drawer Content */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-[85%] max-w-[320px] bg-white/95 backdrop-blur-xl z-[6001] shadow-2xl flex flex-col font-sans border-r border-slate-50"
          >
            {/* Drawer Header */}
            <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between bg-[#FCFCFC]/80">
                {/* User Info */}
                <div className="flex items-center gap-3" onClick={() => onNavigate('settings')}>
                   <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm shadow-sm ${userProfile?.hasWatch ? 'ring-2 ring-[#A7F3D0] ring-offset-2' : ''}`}>
                      {getInitials(userName || userProfile?.firstName)}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 truncate max-w-[140px]">{userName || 'Athlete'}</span>
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><Flame size={10}/> {streak} Day Streak</span>
                   </div>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 -mr-2 text-slate-300 hover:text-red-500 transition-colors rounded-full active:bg-slate-100"
                >
                   <X size={24}/>
                </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {isDashboard || currentView === 'main' ? (
                 <div className="py-2">
                    
                    {/* WORKOUTS ACCORDION */}
                    <MobileMenuSection 
                       label="Workouts" 
                       isOpen={expandedSections['workouts']} 
                       onToggle={() => toggleSection('workouts')}
                    >
                       <MobileSubLink onClick={() => onNavigate('dashboard')} label="Dashboard" icon={LayoutDashboard} />
                       <MobileSubLink onClick={() => onNavigate('stats')} label="Detailed Stats" icon={BarChart2} />
                       <MobileSubLink onClick={() => onNavigate('goals')} label="Goals" icon={Target} />
                    </MobileMenuSection>

                    {/* ROUTES DIRECT */}
                    <MobileDirectLink onClick={() => onNavigate('routes')} label="Routes" />

                    {/* COMMUNITY ACCORDION */}
                    <MobileMenuSection 
                       label="Community" 
                       isOpen={expandedSections['community']} 
                       onToggle={() => toggleSection('community')}
                    >
                       <MobileSubLink onClick={() => onNavigate('challenges')} label="Challenges" icon={Trophy} />
                       <MobileSubLink onClick={() => onNavigate('blogs')} label="Blogs" icon={Newspaper} />
                    </MobileMenuSection>

                    {/* ALMA ACCORDION */}
                    <MobileMenuSection 
                       label="Alma Intelligence" 
                       isOpen={expandedSections['alma']} 
                       onToggle={() => toggleSection('alma')}
                    >
                       <MobileSubLink onClick={() => onNavigate('alma')} label="Ask Alma" icon={Brain} badge={hasAlmaNotification} />
                       <MobileSubLink onClick={() => onNavigate('alma-meals')} label="Meal Tracker" icon={Utensils} />
                    </MobileMenuSection>

                    <MobileDirectLink onClick={onShop} label="Shop Gear" />
                    <MobileDirectLink onClick={() => onNavigate('settings')} label="Settings" />

                 </div>
               ) : (
                 <div className="p-6 flex flex-col gap-4 mt-20">
                    <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Join the ecosystem</p>
                    <button type="button" onClick={() => { onShop(); setMobileMenuOpen(false); }} className="w-full py-4 bg-emerald-500 text-slate-900 rounded-full font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-transform flex items-center justify-center gap-2">
                      <ShoppingBag size={14}/> Shop Gear
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => { onNavigate('auth-login'); setMobileMenuOpen(false); }} className="w-full py-4 border-2 border-slate-900 text-slate-900 rounded-full font-black uppercase text-[10px] tracking-[0.1em] active:scale-95 transition-transform">Sign In</button>
                      <button type="button" onClick={() => { onNavigate('auth-signup'); setMobileMenuOpen(false); }} className="w-full py-4 bg-slate-900 text-white rounded-full font-black uppercase text-[10px] tracking-[0.1em] active:scale-95 transition-transform">Start</button>
                    </div>
                 </div>
               )}
            </div>

            {/* Drawer Footer */}
            {isDashboard || currentView === 'main' ? (
              <div className="p-6 border-t border-slate-50 bg-[#FCFCFC]/80">
                 <button type="button" onClick={() => { onSignOut(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-colors py-2">
                    <LogOut size={16}/> Sign Out
                 </button>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
};
