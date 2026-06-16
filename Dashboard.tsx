
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ArrowRight, Zap, Trash2, Search, ChevronDown, MapPin, Calculator as CalcIcon, X, Dumbbell, Target, Footprints, Timer, Flame, Activity, ToggleLeft, ToggleRight, Info, Calendar, RefreshCw, CheckCircle2, Lock, Heart, Moon, Waves, Mountain, Weight, ChevronLeft, ChevronRight, BarChart } from 'lucide-react';
import { getLocalTodayStr, ROUTE_APPLICABLE_TYPES, ACTIVITY_CATEGORIES } from './constants.ts';
import { formatDuration, parseDurationToHours, isStrengthActivity, calculateEstimatedCalories, calculateBMR, calculateAge, convertDist, convertWeight, getDistUnit, getWeightUnit, getDistVal, calculateStreak, api } from './utils.ts';
import { StatsView } from './Stats.tsx';
import { StreakOverlay } from './StreakOverlay.tsx';
import { GoalCelebration } from './GoalCelebration.tsx';

// --- NEW COMPONENT: Biometrics Locked Widget for Dashboard ---
const LockedBiometricsWidget = () => (
  <div className="bg-slate-900 rounded-[30px] md:rounded-[50px] relative overflow-hidden group shadow-2xl min-h-[250px] md:min-h-[300px] border border-slate-800 mx-1 md:mx-0">
    <img 
      src="https://images2.imgbox.com/56/17/7wy6uJHG_o.jpeg" 
      onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=800'}
      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 grayscale brightness-50" 
      alt="Sensor Array" 
    />
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
    
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 space-y-6">
       <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center backdrop-blur-md border border-slate-700 shadow-2xl ring-1 ring-[#A7F3D0]/20">
          <Lock size={28} className="text-[#A7F3D0]" />
       </div>
       <div>
          <h3 className="text-xl font-black uppercase text-white tracking-tight leading-none">Biometrics Locked</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Link Mehri fitness tracker to unlock</p>
       </div>
       
       <div className="flex gap-3 opacity-40 select-none scale-90">
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-full">
             <Heart size={14} className="text-red-400"/>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-full">
             <Moon size={14} className="text-indigo-400"/>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-full">
             <Waves size={14} className="text-blue-400"/>
          </div>
       </div>
    </div>
  </div>
);

// --- NEW COMPONENT: Empty State for Workouts ---
const EmptyWorkoutState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 bg-white rounded-[40px] border border-slate-100 shadow-sm mx-4 md:mx-0">
     <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
        <BarChart size={40} className="text-slate-300" />
     </div>
     <div className="space-y-2 max-w-md px-4">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">No Data Recorded</h3>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">
           Your dashboard is waiting for input. Log your first activity to initialize the Mehri fitness tracker analytics engine.
        </p>
     </div>
     <button 
        onClick={onAdd}
        className="px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-500 hover:text-slate-900 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3"
     >
        <Plus size={16}/> Initialize Protocol
     </button>
  </div>
);

export const LogModal = ({ date, routes, userSpecs, userProfile, userPreferences, onClose, onSubmit }: any) => {
  const [form, setForm] = useState({ 
    name: '', 
    type: '', 
    distance: '', 
    duration: '00:30:00', 
    calories: '',
    sets: '',
    reps: '',
    weightLifted: '',
    surface: 'Road',
    loadAdded: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const units = userPreferences.units;
  const distUnit = getDistUnit(units);
  const weightUnit = getWeightUnit(units);

  const isStrength = useMemo(() => isStrengthActivity(form.type), [form.type]);
  const isRouteApplicable = useMemo(() => ROUTE_APPLICABLE_TYPES.includes(form.type) && !isStrength, [form.type, isStrength]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return ACTIVITY_CATEGORIES;
    const filtered: Record<string, string[]> = {};
    Object.keys(ACTIVITY_CATEGORIES).forEach(category => {
      const matches = ACTIVITY_CATEGORIES[category].filter(act => 
        act.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matches.length > 0) filtered[category] = matches;
    });
    return filtered;
  }, [searchTerm]);

  const calculateBurn = () => {
    if (!form.type) { alert("Please select an activity type first."); return; }
    
    const weightKg = parseFloat(userSpecs?.weight || "70");
    let distKm = parseFloat(form.distance || "0");
    if (units === 'imperial') distKm = distKm * 1.60934; 

    const hours = parseDurationToHours(form.duration);
    const age = calculateAge(userProfile?.birthdate);
    const gender = userProfile?.gender || 'Female'; 

    let loadKg = parseFloat(form.loadAdded || "0");
    if (units === 'imperial') loadKg = loadKg * 0.453592;

    let weightLiftedKg = parseFloat(form.weightLifted || "0");
    if (units === "imperial") weightLiftedKg = weightLiftedKg * 0.453592;

    const burn = calculateEstimatedCalories(
      form.type, 
      weightKg, 
      distKm, 
      hours, 
      { age, gender },
      {
        surface: form.surface,
        loadKg,
        sets: form.sets,
        reps: form.reps,
        weightLiftedKg
      }
    );
    setForm({ ...form, calories: burn.toString() });
  };

  useEffect(() => {
    if (form.type && (form.distance || (form.sets && form.reps))) {
      calculateBurn();
    }
  }, [form.distance, form.type, form.surface, form.loadAdded, form.sets, form.reps, form.weightLifted, form.duration]);

  const handleRouteSelect = (route: any) => {
    const displayDist = getDistVal(route.distance, units, 2);
    setForm({ 
      ...form, 
      distance: displayDist,
    });
    setIsRouteDropdownOpen(false);
  };

  const handleFinalSubmit = async () => {
    if (!form.name || !form.type) return;
    setIsSaving(true);
    try {
        let finalDistanceKm = parseFloat(form.distance || '0');
        if (units === 'imperial') finalDistanceKm = finalDistanceKm * 1.60934;

        await onSubmit({
            ...form,
            distance: finalDistanceKm.toString(),
            data: {
               surface: form.surface,
               loadAdded: form.loadAdded
            }
        });
    } catch (e) {
        console.error(e);
        alert("Failed to submit workout. Technical error occurred.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-5xl rounded-[40px] md:rounded-[50px] shadow-2xl overflow-y-auto max-h-[90vh] relative animate-scale-in flex flex-col">
        
        <div className="sticky top-0 left-0 right-0 bg-white z-20 px-6 py-6 md:p-10 border-b border-slate-100 flex justify-between items-start">
           <div>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-slate-900 tracking-tighter">Add Workout</h3>
              <p className="text-xs md:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Target Date: {date}</p>
           </div>
           <button
             onClick={onClose}
             aria-label="Close modal"
             className="p-2 -mr-2 text-slate-300 hover:text-red-500 transition-colors"
           >
             <X size={28}/>
           </button>
        </div>

        <div className="p-6 md:p-10 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-4">Activity Name</label>
              <input className="w-full bg-slate-50 p-5 rounded-[25px] font-bold border-none text-base focus:ring-2 ring-emerald-500/20" placeholder={isStrength ? "e.g. Chest Day" : "e.g. Morning Run"} value={form.name} onChange={e=>setForm({...form, name: e.target.value})} autoFocus />
            </div>

            <div className="space-y-2 relative z-[60]">
              <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-4">Activity Type</label>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors active:scale-[0.98] focus-visible:ring-2 ring-emerald-500 outline-none"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-slate-900">{form.type || "Select Category..."}</span>
                  <ChevronDown size={20} className="text-slate-400" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[25px] shadow-2xl z-[100] overflow-hidden h-64 flex flex-col">
                    <div className="p-3 border-b border-slate-50 bg-white">
                      <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2">
                        <Search size={14} className="text-slate-400 mr-2"/><input className="bg-transparent w-full font-bold text-base md:text-xs outline-none" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()}/>
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-2 flex-1 bg-white">
                      {Object.keys(filteredCategories).map(category => (
                        <div key={category} className="mb-3">
                          <div className="px-3 py-1 text-[10px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 rounded-lg mb-1">{category}</div>
                          <div className="grid grid-cols-1 gap-1">
                            {filteredCategories[category].map(act => (
                              <button key={act} className={`text-left px-4 py-3 md:py-2 rounded-lg text-sm md:text-xs font-bold transition-colors ${form.type === act ? 'bg-emerald-400 text-slate-900' : 'hover:bg-slate-50 text-slate-600'}`} onClick={() => { setForm({...form, type: act, distance: '', sets: '', reps: ''}); setIsDropdownOpen(false); }}>{act}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isRouteApplicable && (
              <div className="space-y-2 animate-fade-in relative z-[50]">
                <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-4">Load Route</label>
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isRouteDropdownOpen}
                    className={`w-full p-5 rounded-[25px] font-bold text-base flex items-center justify-between cursor-pointer border-2 transition-all focus-visible:ring-2 ring-emerald-500 outline-none ${routes.length > 0 ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-200' : 'bg-slate-50 border-transparent opacity-50 cursor-not-allowed'}`}
                    onClick={() => routes.length > 0 && setIsRouteDropdownOpen(!isRouteDropdownOpen)}
                  >
                    <span className="text-slate-900 flex items-center gap-2 truncate"><MapPin size={16}/> {routes.find((r:any) => getDistVal(r.distance, units, 2) === form.distance)?.name || (routes.length > 0 ? "Pick a Saved Route" : "No Saved Routes")}</span>
                    <ChevronDown size={20} className="text-slate-400" />
                  </button>
                  {isRouteDropdownOpen && routes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[25px] shadow-2xl z-[100] overflow-hidden p-2">
                      {routes.map((route: any) => (
                        <button key={route.id} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex justify-between items-center" onClick={() => handleRouteSelect(route)}>
                           <span>{route.name}</span>
                           <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md text-[10px]">{getDistVal(route.distance, units, 2)} {distUnit}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col justify-between z-0">
            <div className="space-y-6">
              {isStrength ? (
                <div className="grid grid-cols-3 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-3">Sets</label>
                      <input type="number" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base text-center" placeholder="0" value={form.sets} onChange={e=>setForm({...form, sets: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-3">Reps</label>
                      <input type="number" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base text-center" placeholder="0" value={form.reps} onChange={e=>setForm({...form, reps: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-3">{weightUnit}</label>
                      <input type="number" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base text-center" placeholder="0" value={form.weightLifted} onChange={e=>setForm({...form, weightLifted: e.target.value})} />
                    </div>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in">
                   <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-4">Distance ({distUnit})</label>
                   <input type="number" step="0.01" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base" placeholder="0.00" value={form.distance} onChange={e=>setForm({...form, distance: e.target.value})} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-4">Duration</label>
                   <input className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base" placeholder="HH:MM:SS" value={form.duration} onChange={e=>setForm({...form, duration: e.target.value})} />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs md:text-[10px] font-black uppercase text-slate-400 ml-4">Calories</label>
                  <div className="relative flex gap-2">
                    <input type="number" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base" placeholder="0" value={form.calories} onChange={e=>setForm({...form, calories: e.target.value})} />
                    <button
                      type="button"
                      aria-label="Auto-calculate calories"
                      onClick={calculateBurn}
                      className="bg-slate-900 text-white px-4 rounded-[20px] hover:bg-emerald-500 transition-colors flex items-center justify-center shrink-0 focus-visible:ring-2 ring-emerald-500 outline-none"
                      title="Auto-Calculate"
                    >
                      <CalcIcon size={18}/>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                 <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs md:text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 flex items-center gap-1 mb-3">
                    {showAdvanced ? "Hide Precision Factors" : "Show Precision Factors"} <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}/>
                 </button>
                 
                 {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 animate-fade-in">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-1"><Mountain size={10}/> Surface</label>
                          <select 
                             className="w-full bg-white p-3 rounded-xl font-bold text-xs outline-none text-base md:text-xs"
                             value={form.surface}
                             onChange={e => setForm({...form, surface: e.target.value})}
                          >
                             <option value="Road">Road/Pavement</option>
                             <option value="Treadmill">Treadmill</option>
                             <option value="Trail">Trail (Uneven)</option>
                             <option value="Sand">Sand/Soft</option>
                             <option value="Track">Track</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-1"><Weight size={10}/> Added Load ({weightUnit})</label>
                          <input 
                             type="number" 
                             className="w-full bg-white p-3 rounded-xl font-bold outline-none text-base md:text-xs"
                             placeholder="Vest/Pack Weight"
                             value={form.loadAdded}
                             onChange={e => setForm({...form, loadAdded: e.target.value})}
                          />
                       </div>
                    </div>
                 )}
              </div>
            </div>

            <button onClick={handleFinalSubmit} disabled={!form.name || !form.type || isSaving} className="w-full py-6 bg-slate-900 text-white rounded-[25px] font-black uppercase text-xs md:text-[11px] tracking-[0.4em] shadow-xl transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50 hover:bg-emerald-500 flex items-center justify-center sticky bottom-0 md:relative">
               {isSaving ? "Saving..." : "Log Activity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardView = ({ workouts, setWorkouts, userGoals, setUserGoals, routes, userSpecs, userProfile, userPreferences, userHandle, onForceSync, userMeals = [], onNavigate }: any) => {
  // --- RESILIENCE CHECK ---
  // If we don't have a user profile yet, we are likely in a hydration/auth transition.
  // Show a "Warm up" state instead of crashing or showing default empty data.
  if (!userProfile?.username && !userHandle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-8 animate-pulse">
        <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center">
           <RefreshCw size={32} className="text-slate-300 animate-spin" />
        </div>
        <div className="space-y-3 text-center">
          <div className="h-6 w-48 bg-slate-100 rounded-full mx-auto" />
          <div className="h-3 w-64 bg-slate-50 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg pt-12">
           <div className="h-32 bg-slate-50 rounded-[30px]" />
           <div className="h-32 bg-slate-50 rounded-[30px]" />
           <div className="h-32 bg-slate-50 rounded-[30px]" />
        </div>
      </div>
    );
  }

  const [tab, setTab] = useState<'monthly' | 'stats'>('monthly');
  const [precisionMode, setPrecisionMode] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebratingGoal, setCelebratingGoal] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);











  
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => getLocalTodayStr(), [now]);
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'All' | 'Run'>('All');

  const [viewDate, setViewDate] = useState(new Date()); 
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const currentViewMonth = viewDate.getMonth();
    const currentViewYear = viewDate.getFullYear();
    const todayDate = new Date(todayStr);
    const todayMonth = todayDate.getMonth();
    const todayYear = todayDate.getFullYear();

    if (currentViewMonth !== todayMonth || currentViewYear !== todayYear) {
       setViewDate(todayDate);
    }
  }, [todayStr]);

  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  
  const jumpToToday = () => {
    const d = new Date(); 
    setViewDate(d);
    setSelectedDay(getLocalTodayStr());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    if(onForceSync) await onForceSync();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const isPast = selectedDay < todayStr;
  const isFuture = selectedDay > todayStr;
  const isLoggable = selectedDay === todayStr; 
  
  const units = userPreferences.units;
  const distUnit = getDistUnit(units);

  const currentStreak = useMemo(() => calculateStreak(workouts, userPreferences.restDay), [workouts, userPreferences.restDay]);
  
  const hasLoggedToday = useMemo(() => {
      return workouts.some((w: any) => w.date === todayStr);
  }, [workouts, todayStr]);

  useEffect(() => {
    if (userHandle && currentStreak > 0) {
        const timer = setTimeout(() => {
            api("UPDATE_STREAK", { username: userHandle, streak: currentStreak });
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [currentStreak, userHandle]);

  const calculateGoalProgress = (goal: any) => {
    const gStatus = goal.status || goal.data?.status || 'Active';
    const gTarget = Number(goal.target || goal.target_value || 1);
    const gType = (goal.type || goal.target_type || 'count').toLowerCase();
    const gActivityRaw = goal.activity || goal.activity_type || 'Any Activity';
    const gActivity = gActivityRaw.toLowerCase().trim();
    
    // Normalize to midnight for strict day comparison
    const gStartRaw = goal.startDate || goal.start_date || goal.created_at || getLocalTodayStr();
    const gDate = new Date(gStartRaw);
    gDate.setHours(0,0,0,0);
    const goalStartTime = gDate.getTime();

    if (gStatus === 'Completed') return { current: gTarget, percent: 100, unitLabel: 'Completed', isComplete: true, target: gTarget };

    const relevantWorkouts = workouts.filter((w: any) => {
      if (!w) return false;
      
      // Normalize workout date to midnight
      const wDate = new Date(w.date || w.created_at);
      wDate.setHours(0,0,0,0);
      const workoutTime = wDate.getTime();

      // STRICT CHECK: Workout must be SAME DAY or AFTER goal creation
      const isAfterGoal = workoutTime >= goalStartTime;

      const wType = (w.type || "").toLowerCase().trim();
      const isTypeMatch = gActivity === 'any activity' || 
                          wType === gActivity || 
                          wType.includes(gActivity) || 
                          gActivity.includes(wType); 

      return isAfterGoal && isTypeMatch;
    });

    let current = 0;
    let unitLabel = '';

    if (gType === 'distance') {
      const currentKm = relevantWorkouts.reduce((acc: number, w: any) => acc + (Number(w.distance) || 0), 0);
      current = Number(getDistVal(currentKm, units, 1));
      unitLabel = distUnit;
    } else if (gType === 'duration') {
      current = relevantWorkouts.reduce((acc: number, w: any) => acc + parseDurationToHours(w.duration || '00:00:00'), 0);
      unitLabel = 'hrs';
    } else {
      current = relevantWorkouts.length;
      unitLabel = 'workouts';
    }
    
    const currentVal = Number(current.toFixed(1));
    const percent = Math.min(100, (currentVal / gTarget) * 100);
    const isComplete = percent >= 100;

    return { current: currentVal, percent, unitLabel, isComplete, target: gTarget };
  };

  useEffect(() => {
    // REACTIVE CELEBRATION LOGIC
    // Runs whenever workouts or goals change to instantly trigger celebration
    userGoals.forEach((g: any) => {
      const gStatus = g.status || 'Active';
      if (gStatus === 'Active') {
        const stats = calculateGoalProgress(g);
        if (stats.isComplete) {
          setCelebratingGoal(g);
          const updated = { ...g, status: 'Completed' };
          api("UPDATE_GOAL_STATUS", { id: g.id, status: 'Completed' });
          setUserGoals((prev: any[]) => prev.map((pg: any) => pg.id === g.id ? updated : pg));
        }
      }
    });
  }, [workouts, userGoals]);

  const dailyMetrics = useMemo(() => {
    const dayRelevant = workouts.filter((w: any) => w.date === selectedDay && (activityFilter === 'All' || w.type === activityFilter));
    const activeCals = dayRelevant.reduce((a: number, b: any) => a + (parseFloat(b.calories) || 0), 0);
    const distKm = dayRelevant.reduce((a: number, b: any) => a + (parseFloat(b.distance) || 0), 0);
    const displayDist = getDistVal(distKm, units, 2);
    const durSeconds = dayRelevant.reduce((a: number, b: any) => {
      const parts = (b.duration || '00:00:00').split(':').map(Number);
      return a + (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
    }, 0);

    const weightKg = parseFloat(userSpecs?.weight || '70');
    const heightCm = parseFloat(userSpecs?.height || '175');
    const age = calculateAge(userProfile?.birthdate);
    const bmr = calculateBMR(weightKg, heightCm, age, userProfile?.gender || 'Male');
    const totalBurn = bmr + activeCals;

    return { 
       dist: displayDist, 
       activeCals: activeCals.toFixed(0), 
       bmr: bmr.toFixed(0),
       totalBurn: totalBurn.toFixed(0),
       duration: formatDuration(durSeconds), 
       count: dayRelevant.length 
    };
  }, [workouts, activityFilter, selectedDay, userSpecs, userProfile, units]);

  const handleWorkoutSubmit = async (f: any) => {
    try {
        const usernameToSave = userProfile.username || userHandle;
        if (!usernameToSave) {
            alert("Session Error: Please refresh the page to sync your account.");
            return;
        }

        const sanitizedPayload = { 
            username: usernameToSave,
            date: selectedDay, 
            name: f.name,
            type: f.type,
            distance: f.distance ? parseFloat(f.distance) : 0,
            duration: f.duration || '00:30:00',
            calories: f.calories ? parseFloat(f.calories) : 0,
            sets: f.sets ? parseInt(f.sets) : null,
            reps: f.reps ? parseInt(f.reps) : null,
            weight_lifted: f.weightLifted ? parseFloat(f.weightLifted) : null,
            data: { ...f, date: selectedDay } 
        };
        
        const oldStreak = calculateStreak(workouts, userPreferences.restDay);
        
        const res = await api("SAVE_WORKOUT", sanitizedPayload);
        
        if (res.status === 'success' && res.data) {
            // Note: res.data from api includes the `id` from the database
            const updatedWorkouts = [...workouts, res.data];
            setWorkouts(updatedWorkouts);
            setShowLogModal(false);

            const newStreak = calculateStreak(updatedWorkouts, userPreferences.restDay);
            if (newStreak >= 1 && newStreak > oldStreak) {
               setShowStreakCelebration(true);
            }
        } else {
            alert(`Database Error: ${res.message || "Could not save workout. Please try again."}`);
        }
    } catch (err) {
        console.error("Critical Workout Submission Failure:", err);
        alert("A system error occurred while saving your workout. Please check your connection and try again.");
    }
  };

  const handleDeleteWorkout = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this workout? This cannot be undone.")) return;
    
    try {
        const res = await api("DELETE_WORKOUT", { id });
        if (res.status === 'success') {
            setWorkouts((prev: any[]) => prev.filter(w => String(w.id) !== String(id)));
        } else {
            alert("Failed to delete workout from database.");
        }
    } catch (e) {
        console.error("Delete Error:", e);
        alert("An error occurred while deleting.");
    }
  };

  const deleteGoal = async (e: React.MouseEvent, goalId: number) => {
    e.stopPropagation(); 
    if (!window.confirm('Delete this goal permanently?')) return;
    
    const res = await api("DELETE_GOAL", { id: goalId });
    if (res.status === 'success') {
        setUserGoals((prev: any[]) => prev.filter((g: any) => String(g.id) !== String(goalId)));
    } else {
        alert("Failed to delete goal.");
    }
  };

  const handleDayChange = (offset: number) => {
    const [y, m, d] = selectedDay.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + offset);
    const newStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    setSelectedDay(newStr);
  };

  return (
    <div className="space-y-6 md:space-y-12 animate-fade-in pb-32 max-w-7xl mx-auto font-sans">


      {showStreakCelebration && (
        <StreakOverlay streak={currentStreak} userName={userProfile?.firstName || "Athlete"} onClose={() => setShowStreakCelebration(false)} />
      )}
      {celebratingGoal && createPortal(
        <GoalCelebration goal={celebratingGoal} onClose={() => setCelebratingGoal(null)} />,
        document.body
      )}

      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sticky top-24 md:relative bg-white/95 backdrop-blur-xl md:bg-transparent z-40 py-4 px-4 md:px-0 border-b border-slate-100 md:border-none shadow-sm md:shadow-none">
        {tab === 'monthly' ? (
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-[0.05em] text-slate-900">Dashboard</h1>
        ) : <div className="h-10 md:h-12"/>}
        
        <div className={`flex gap-4 w-full md:w-auto justify-between md:justify-end ${tab !== 'monthly' ? 'md:ml-auto' : ''}`}>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            aria-label="Sync data"
            className={`p-2 rounded-full hover:bg-slate-50 transition-all ${isSyncing ? 'animate-spin text-emerald-500' : 'text-slate-300'}`}
            title="Force Sync Data"
          >
             <RefreshCw size={16}/>
          </button>
          <div className="flex gap-4 md:gap-8 border-l border-slate-100 pl-4">
            <button onClick={() => setTab('monthly')} className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest pb-2 md:pb-4 border-b-4 transition-all ${tab === 'monthly' ? 'border-[#A7F3D0] text-slate-900' : 'border-transparent text-slate-300 hover:text-slate-50'}`}>Monthly View</button>
            <button onClick={() => setTab('stats')} className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest pb-2 md:pb-4 border-b-4 transition-all ${tab === 'stats' ? 'border-[#A7F3D0] text-slate-900' : 'border-transparent text-slate-300 hover:text-slate-50'}`}>Detailed Stats</button>
          </div>
        </div>
      </div>

      {tab === 'monthly' ? (
        <div className="space-y-6 md:space-y-10 px-2 md:px-0">
          {/* Main Dashboard Panel */}
          {workouts.length > 0 ? (
            <div className="bg-white/70 backdrop-blur-2xl rounded-[20px] md:rounded-[40px] border border-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-4 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden">
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] self-center">Activity: {selectedDay}</p>
                   <button
                     onClick={() => setPrecisionMode(!precisionMode)}
                     role="switch"
                     aria-checked={precisionMode}
                     className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-[#A7F3D0] transition-colors focus-visible:ring-2 ring-emerald-500 rounded-lg outline-none ring-offset-2"
                   >
                      {precisionMode ? <ToggleRight size={24} className="text-[#A7F3D0]" aria-hidden="true"/> : <ToggleLeft size={24} aria-hidden="true"/>}
                      Precision View
                   </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="flex bg-slate-50/80 rounded-2xl p-1 backdrop-blur-sm border border-slate-100 w-full md:w-auto">
                    <button onClick={() => setActivityFilter('All')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activityFilter === 'All' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>All</button>
                    <button onClick={() => setActivityFilter('Run')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activityFilter === 'Run' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Run</button>
                  </div>
                  <button 
                    onClick={() => isLoggable && setShowLogModal(true)} 
                    disabled={!isLoggable}
                    className="group bg-slate-900 text-white px-8 py-4 md:py-3 rounded-2xl text-xs md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full md:w-auto active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} className="transition-transform group-hover:rotate-90" /> {isLoggable ? 'Add Workout' : (isPast ? 'Past (Locked)' : 'Future (Locked)')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 relative z-10">
                 <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.03)] p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col justify-center hover:scale-[1.02] transition-transform duration-300 group relative overflow-hidden col-span-2 md:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Current Streak</p>
                       <Flame size={16} className={`${hasLoggedToday ? 'text-emerald-500 fill-emerald-500' : 'text-[#A7F3D0]'} drop-shadow-sm group-hover:text-emerald-500 transition-colors`} />
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                       {currentStreak} <span className="text-xs text-slate-400 font-bold ml-1">days</span>
                    </p>
                    <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                       {hasLoggedToday ? (
                         <div className="h-full bg-emerald-500 w-full" />
                       ) : (
                         <div className="h-full bg-orange-300 w-full animate-pulse" style={{ width: '50%' }} />
                       )}
                    </div>
                    {!hasLoggedToday && <p className="text-[8px] font-bold text-orange-400 mt-1 uppercase tracking-wide">Pending today's log</p>}
                 </div>

                 {[
                   { label: precisionMode ? "Total Expenditure" : "Active Burn", val: precisionMode ? dailyMetrics.totalBurn : dailyMetrics.activeCals, unit: "kcal", icon: Flame },
                   { label: "Day Distance", val: dailyMetrics.dist, unit: distUnit, icon: Footprints },
                   { label: "Day Duration", val: dailyMetrics.duration, unit: "", icon: Timer }
                 ].map((stat, i) => (
                   <div key={i} className={`bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.03)] p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col justify-center hover:scale-[1.02] transition-transform duration-300 group ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                         <stat.icon size={16} className="text-[#A7F3D0] drop-shadow-sm group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val} <span className="text-xs text-slate-400 font-bold ml-1">{stat.unit}</span></p>
                   </div>
                 ))}
              </div>
            </div>
          ) : (
            <EmptyWorkoutState onAdd={() => setShowLogModal(true)} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-12">
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              
              {userGoals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
                  {userGoals.filter((g: any) => (g.status || g.data?.status) !== 'Completed').map((goal: any) => {
                    const stats = calculateGoalProgress(goal);
                    return (
                      <div key={goal.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                               <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-1">Active Goal</p>
                               <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">{goal.title}</h4>
                            </div>
                            <button
                              onClick={(e) => deleteGoal(e, goal.id)}
                              aria-label="Delete goal"
                              className="text-slate-300 hover:text-red-500 transition-colors z-20 p-2 rounded-full hover:bg-slate-50"
                            >
                                <Trash2 size={16}/>
                            </button>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                               <span>Progress</span>
                               <span>{stats.percent.toFixed(0)}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                               <div className="h-full bg-emerald-400 transition-all duration-1000 relative z-10" style={{ width: `${stats.percent}%` }} />
                               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite_linear]" />
                            </div>
                            <p className="text-right text-xs font-bold text-slate-900 mt-2">
                               {stats.current} <span className="text-slate-400">/ {stats.target} {stats.unitLabel}</span>
                            </p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-white rounded-[30px] md:rounded-[50px] border border-slate-100 p-4 md:p-12 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
                
                <div className="flex justify-between items-center mb-6 md:mb-10">
                  <div className="flex items-center gap-4">
                     <h3 className="text-lg md:text-2xl font-black uppercase text-slate-900 tracking-[0.02em]">{monthLabel}</h3>
                     <button onClick={jumpToToday} className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors" title="Jump to Current Month">Today</button>
                  </div>
                  <div className="hidden md:flex gap-4">
                    <button
                      onClick={prevMonth}
                      aria-label="Previous month"
                      className="text-slate-300 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-50"
                    >
                      <ArrowRight className="rotate-180"/>
                    </button>
                    <button
                      onClick={nextMonth}
                      aria-label="Next month"
                      className="text-slate-300 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-50"
                    >
                      <ArrowRight/>
                    </button>
                  </div>
                </div>

                <div className="md:hidden mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => handleDayChange(-1)} className="p-2 bg-slate-50 rounded-full"><ChevronLeft size={20}/></button>
                        <span className="text-sm font-black uppercase tracking-widest text-slate-500">
                            {new Date(selectedDay.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
                        </span>
                        <button onClick={() => handleDayChange(1)} className="p-2 bg-slate-50 rounded-full"><ChevronRight size={20}/></button>
                    </div>
                    <div className="bg-slate-900 text-white p-6 rounded-[30px] shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={80}/></div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Selected Day</p>
                       <h2 className="text-4xl font-black">{parseInt(selectedDay.split('-')[2])}</h2>
                       <div className="mt-4 flex flex-wrap gap-2">
                          {workouts.filter((w:any) => w.date === selectedDay).length > 0 ? (
                              workouts.filter((w:any) => w.date === selectedDay).map((log:any) => (
                                <div key={log.id} className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                   <CheckCircle2 size={12}/> {log.type}
                                </div>
                              ))
                          ) : (
                              <p className="text-slate-500 text-xs italic">No activity logged.</p>
                          )}
                       </div>
                       
                       <button 
                         onClick={() => isLoggable && setShowLogModal(true)} 
                         disabled={!isLoggable} 
                         className={`mt-6 w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLoggable ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                       >
                         {isLoggable ? 'Log Activity Here' : (isPast ? 'Locked (Past)' : 'Locked (Future)')}
                       </button>
                    </div>
                </div>

                <div className="hidden md:grid grid-cols-7 gap-1 md:gap-4">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="text-center font-black uppercase text-slate-300 text-[8px] md:text-[10px] py-2 tracking-widest">{d}</div>)}
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={'pad' + i} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = new Date(year, month, i + 1);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const dStr = `${y}-${m}-${day}`;
                    
                    const dayLogs = workouts.filter((w: any) => w.date === dStr && (activityFilter === 'All' || w.type === activityFilter));
                    const locked = dStr < todayStr;
                    const future = dStr > todayStr;
                    const active = selectedDay === dStr;
                    const isToday = dStr === todayStr;
                    const isStreak = dayLogs.length > 0;

                    return (
                      <div
                        key={i}
                        role="button"
                        tabIndex={locked ? -1 : 0}
                        aria-label={`${new Date(y, month, i + 1).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}${isToday ? ', Today' : ''}${dayLogs.length > 0 ? `, ${dayLogs.length} workout${dayLogs.length === 1 ? '' : 's'}` : ', No workouts'}`}
                        onClick={() => !locked && setSelectedDay(dStr)}
                        onKeyDown={(e) => {
                          if (!locked && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            setSelectedDay(dStr);
                          }
                        }}
                        className={`group min-h-[80px] md:min-h-[140px] rounded-[16px] md:rounded-[24px] p-2 md:p-4 transition-all duration-300 relative flex flex-col gap-1 md:gap-2 border-2 focus-visible:ring-2 ring-emerald-500 outline-none ${
                        locked 
                          ? 'bg-slate-50/40 border-transparent opacity-40 cursor-not-allowed grayscale' 
                          : future 
                            ? 'bg-white border-dashed border-slate-200 opacity-60'
                            : active 
                              ? 'bg-white border-transparent ring-2 md:ring-4 ring-[#A7F3D0]/50 shadow-2xl scale-[1.03] z-20' 
                              : 'bg-white border-slate-50 hover:border-slate-100 hover:scale-[1.02] hover:shadow-xl cursor-pointer z-0'
                      }`}>
                        {!locked && !future && isStreak && (
                            <div className="absolute inset-4 rounded-full bg-[#A7F3D0]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        )}

                        <div className="flex justify-between items-start relative z-10">
                           <span className={`font-black text-sm md:text-xl flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full ${
                             isToday ? 'bg-[#A7F3D0] text-slate-900 shadow-md ring-2 ring-emerald-200' 
                             : isStreak ? 'bg-[#A7F3D0]/30 text-emerald-800' 
                             : active ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-400'
                           }`}>
                             {i + 1}
                           </span>
                        </div>
                        
                        <div className="flex flex-col gap-1 md:gap-1.5 overflow-hidden relative z-10">
                           {dayLogs.map((log: any) => {
                             const isStrengthLog = log.sets && log.reps;
                             const displayVal = isStrengthLog ? `${log.sets}x${log.reps}` : getDistVal(log.distance, units, 1);
                             return (
                               <div key={log.id} className={`${isStrengthLog ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900' : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md'} rounded-full px-2 py-1 md:px-3 md:py-1.5 text-[6px] md:text-[8px] font-black uppercase truncate flex items-center gap-1 hover:scale-105 transition-transform group/pill relative`}>
                                 {isStrengthLog ? <Dumbbell size={8} className="text-slate-900 md:w-[10px] md:h-[10px]"/> : <span className="text-[#A7F3D0] text-[8px] md:text-[10px]">🏃</span>} 
                                 {displayVal}
                                 {isToday && (
                                   <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(log.id); }}
                                      aria-label="Delete workout"
                                      className="absolute -right-1 -top-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/pill:opacity-100 focus-visible:opacity-100 transition-opacity z-50"
                                   >
                                      <X size={8}/>
                                   </button>
                                 )}
                               </div>
                             );
                           })}
                        </div>
                        {isToday && (
                          <>
                            <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50 opacity-60 hidden md:flex">
                               <div className="flex gap-1">
                                  <Heart size={10} className="text-slate-300" />
                                  <Moon size={10} className="text-slate-300" />
                                  <Activity size={10} className="text-slate-300" />
                               </div>
                               <Lock size={10} className="text-slate-400" />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedDay(dStr); setShowLogModal(true); }} className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-8 md:h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 opacity-0 hover:bg-[#A7F3D0] hover:text-slate-900 transition-all group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 ring-emerald-500 outline-none shadow-sm"><Plus size={12} className="md:w-3.5 md:h-3.5"/></button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DAY ACTIVITY LIST (NEW) */}
              {workouts.filter((w: any) => w.date === selectedDay).length > 0 && (
                <div className="bg-white rounded-[30px] border border-slate-100 p-8 shadow-sm animate-fade-in">
                   <h3 className="text-xl font-black uppercase text-slate-900 mb-6 flex items-center gap-3">
                      <Activity size={20} className="text-emerald-500"/> Day Activity List
                   </h3>
                   <div className="space-y-4">
                      {workouts.filter((w: any) => w.date === selectedDay).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${log.sets ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-[#A7F3D0]'}`}>
                                 {log.sets ? <Dumbbell size={20}/> : <Activity size={20}/>}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-sm">{log.type}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.duration} • {log.calories} kcal</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <p className="text-lg font-black text-slate-900">
                                    {log.sets ? `${log.sets}x${log.reps}` : `${getDistVal(log.distance, units, 2)} ${distUnit}`}
                                 </p>
                              </div>
                              <button 
                                onClick={() => handleDeleteWorkout(log.id)} 
                                aria-label="Delete workout"
                                className="p-2 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 size={18}/>
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
            <div className="space-y-8 hidden md:block">
              <LockedBiometricsWidget />
              
              <div className="bg-slate-900 p-8 md:p-10 rounded-[30px] md:rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
                <Zap size={60} className="absolute -bottom-6 -right-6 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                <h4 className="text-lg font-black uppercase text-emerald-400 mb-2 tracking-wide">Sync Platform</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Mehri fitness tracker detected</p>
                <button className="w-full py-4 bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/20 transition-all magnetic-btn">Check Connection</button>
              </div>
            </div>
          </div>
        </div>
      ) : <StatsView workouts={workouts} userPreferences={userPreferences} />}
      {showLogModal && <LogModal date={selectedDay} routes={routes} userSpecs={userSpecs} userProfile={userProfile} userPreferences={userPreferences} onClose={() => setShowLogModal(false)} onSubmit={handleWorkoutSubmit} />}
    </div>
  );
};
