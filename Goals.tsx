
import React, { useState, useMemo } from 'react';
import { Plus, Target, X, ChevronDown, Search, ArrowRight, Trophy, Trash2, CheckCircle2, Loader2, Flag } from 'lucide-react';
import { ACTIVITY_CATEGORIES, getLocalTodayStr } from './constants.ts';
import { getDistUnit, parseDurationToHours, getDistVal, api } from './utils.ts';

const CreateGoalModal = ({ onClose, onSubmit, userPreferences }: any) => {
  const [activity, setActivity] = useState('');
  const [goalType, setGoalType] = useState<'count' | 'distance' | 'duration'>('count');
  const [target, setTarget] = useState('');
  const [durationDetails, setDurationDetails] = useState({ h: '00', m: '30', s: '00' });
  const [startDate, setStartDate] = useState(getLocalTodayStr());
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const distUnit = getDistUnit(userPreferences?.units || 'metric');

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

  const getSummary = () => {
    const actStr = activity || "Any Activity";
    const startStr = startDate || "today";
    if (goalType === 'distance') return `Complete ${target || 0} ${distUnit} of ${actStr} starting on ${startStr}.`;
    if (goalType === 'duration') return `Complete ${durationDetails.h}h ${durationDetails.m}m of ${actStr} starting on ${startStr}.`;
    return `Complete ${target || 0} workouts of ${actStr} starting on ${startStr}.`;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Validation
    if (!activity) { alert("Please select an activity."); return; }
    if (goalType !== 'duration' && (!target || parseFloat(target) <= 0)) { alert("Please enter a valid target greater than 0."); return; }
    
    let finalTarget = parseFloat(target);
    if (goalType === 'duration') {
      finalTarget = parseInt(durationDetails.h) + (parseInt(durationDetails.m) / 60) + (parseInt(durationDetails.s) / 3600);
      if (finalTarget <= 0) { alert("Duration must be greater than 0."); return; }
    }
    
    setIsSubmitting(true);
    try {
        await onSubmit({
          activity: activity || 'Any Activity',
          type: goalType,
          target: finalTarget,
          startDate: startDate,
          status: 'Active',
          title: activity ? `${goalType === 'distance' ? 'Distance' : goalType === 'duration' ? 'Duration' : 'Frequency'} Goal: ${activity}` : 'Custom Goal'
        });
    } catch (e) {
        console.error(e);
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[50px] shadow-2xl w-full max-w-4xl relative overflow-visible animate-scale-in my-8">
        <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-300 hover:text-emerald-500 transition-colors"><X size={28}/></button>
        <h3 className="text-3xl md:text-4xl font-black uppercase text-slate-900 tracking-tighter mb-8">Create A Goal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-3 relative md:z-50">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Activity</label>
            <div className="relative">
              <div className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-base flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className={activity ? "text-slate-900" : "text-slate-400"}>{activity || "Select Activity..."}</span>
                <ChevronDown size={20} className="text-slate-400" />
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[25px] shadow-2xl overflow-hidden h-64 flex flex-col z-[100]">
                  <div className="p-3 border-b border-slate-50 bg-white">
                    <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2">
                      <Search size={14} className="text-slate-400 mr-2"/>
                      <input className="bg-transparent w-full font-bold text-xs outline-none" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                    </div>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar p-2 flex-1">
                     <button className="w-full text-left px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 text-emerald-600 mb-2" onClick={() => { setActivity('Any Activity'); setIsDropdownOpen(false); }}>★ Any Activity</button>
                    {Object.keys(filteredCategories).map(category => (
                      <div key={category} className="mb-3">
                        <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 rounded-lg mb-1">{category}</div>
                        {filteredCategories[category].map(act => (
                          <button key={act} className="w-full text-left px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 text-slate-600" onClick={() => { setActivity(act); setIsDropdownOpen(false); }}>{act}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3 z-40">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Goal Type</label>
            <div className="flex gap-2">
               {['count', 'distance', 'duration'].map(t => (
                 <button key={t} onClick={() => setGoalType(t as any)} className={`flex-1 py-5 rounded-[25px] font-black uppercase text-[10px] tracking-widest transition-all ${goalType === t ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                   {t === 'count' ? '# Workouts' : t}
                 </button>
               ))}
            </div>
          </div>
          <div className="space-y-3 z-30">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{goalType === 'distance' ? `Target Distance (${distUnit})` : goalType === 'duration' ? 'Target Duration' : 'Number of Workouts'}</label>
            {goalType === 'duration' ? (
              <div className="flex gap-2">
                 <input className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-center" placeholder="HH" value={durationDetails.h} onChange={e => setDurationDetails({...durationDetails, h: e.target.value})} />
                 <span className="self-center font-black text-slate-300">:</span>
                 <input className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-center" placeholder="MM" value={durationDetails.m} onChange={e => setDurationDetails({...durationDetails, m: e.target.value})} />
                 <span className="self-center font-black text-slate-300">:</span>
                 <input className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-center" placeholder="SS" value={durationDetails.s} onChange={e => setDurationDetails({...durationDetails, s: e.target.value})} />
              </div>
            ) : (
              <input type="number" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-lg" placeholder={goalType === 'distance' ? "e.g. 50" : "e.g. 10"} value={target} onChange={e => setTarget(e.target.value)} />
            )}
          </div>
          <div className="space-y-3 z-30">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Start Date</label>
            <input type="date" className="w-full bg-slate-50 p-5 rounded-[25px] font-bold text-slate-900" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
           <p className="text-center text-slate-500 font-bold mb-8 text-sm">{getSummary()}</p>
           <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-6 bg-emerald-400 text-slate-900 rounded-[25px] font-black uppercase text-[11px] tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <><ArrowRight size={16}/> Create Goal</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export const GoalsView = ({ userGoals, setUserGoals, onNavigate, userPreferences, userProfile, userHandle, workouts }: any) => {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'Active' | 'Completed'>('Active');
  const distUnit = getDistUnit(userPreferences?.units || 'metric');

  const calculateGoalProgress = (goal: any) => {
    // 1. Normalize Goal Properties
    const gStatus = goal.status || goal.data?.status || 'Active';
    const gTarget = Number(goal.target || goal.target_value || 1);
    const gType = (goal.type || goal.target_type || 'count').toLowerCase();
    const gActivityRaw = goal.activity || goal.activity_type || 'Any Activity';
    const gActivity = gActivityRaw.toLowerCase().trim();
    
    // Normalization for date: use created_at for strict timeline enforcement
    // Normalize to the START of the day (00:00:00) to prevent time-of-day mismatches
    const gStartRaw = goal.startDate || goal.start_date || goal.created_at || getLocalTodayStr();
    const gDate = new Date(gStartRaw);
    gDate.setHours(0,0,0,0);
    const goalStartTime = gDate.getTime();

    if (gStatus === 'Completed') return { current: gTarget, percent: 100, unitLabel: 'Completed', isComplete: true, target: gTarget };

    const relevantWorkouts = (workouts || []).filter((w: any) => {
      // 2. Strict Filter: Workout must be valid
      if (!w) return false;

      // 3. STRICT Date/Time Check: Only count workouts created AFTER or ON goal creation day
      const wDate = new Date(w.date || w.created_at);
      wDate.setHours(0,0,0,0); // Normalize to start of day
      const workoutTime = wDate.getTime();
      
      const isAfterGoal = workoutTime >= goalStartTime;

      // 4. Activity Type Matching (Case-insensitive, Trimmed)
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
      current = Number(getDistVal(currentKm, userPreferences?.units || 'metric', 1));
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

  const addPreset = (count: number) => {
    const usernameToSave = userProfile?.username || userHandle;
    if (!usernameToSave) { alert("Session Error: Please refresh."); return; }
    const newGoal = {
      id: Date.now(),
      username: usernameToSave,
      title: `${count} Workouts / Week`,
      activity: 'Any Activity',
      type: 'count',
      target: count,
      startDate: getLocalTodayStr(),
      status: 'Active',
      data: { activity: 'Any Activity', type: 'count', target: count }
    };
    api("SAVE_GOAL", newGoal);
    setUserGoals([newGoal, ...userGoals]);
    onNavigate('dashboard');
  };

  const handleCustomSubmit = async (goalData: any) => {
    const usernameToSave = userProfile?.username || userHandle;
    if (!usernameToSave) { alert("Session Error: Please refresh."); return; }
    const newGoal = {
      id: Date.now(),
      username: usernameToSave,
      ...goalData,
      data: { ...goalData }
    };
    await api("SAVE_GOAL", newGoal);
    setUserGoals([newGoal, ...userGoals]);
    setShowCreate(false);
    onNavigate('dashboard');
  };

  const deleteGoal = async (id: number) => {
    if(!window.confirm("Are you sure you want to delete this goal permanently?")) return;
    
    const res = await api("DELETE_GOAL", { id });
    if (res.status === 'success') {
        setUserGoals((prev: any[]) => prev.filter((g:any) => String(g.id) !== String(id)));
    } else {
        alert("Failed to delete goal.");
    }
  }

  const markCompleted = (goal: any) => {
      const updated = { ...goal, status: 'Completed' };
      api("UPDATE_GOAL_STATUS", { id: goal.id, status: 'Completed' });
      setUserGoals((prev: any[]) => prev.map((g: any) => g.id === goal.id ? updated : g));
  };

  const visibleGoals = (userGoals || []).filter((g: any) => (g.status || 'Active') === filter);

  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in pb-32 px-4 md:px-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-100 pb-8 gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 leading-none">Achieve Your <span className="text-emerald-500">Best.</span></h1>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Stay on target with a weekly goal.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-emerald-400 text-slate-900 px-10 py-5 rounded-[30px] font-black uppercase text-[10px] tracking-[0.3em] hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3">
          <Plus size={18} /> Create A Goal
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
           <div className="flex gap-4">
              <button onClick={() => setFilter('Active')} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filter === 'Active' ? 'text-emerald-500' : 'text-slate-300'}`}>Active</button>
              <button onClick={() => setFilter('Completed')} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filter === 'Completed' ? 'text-emerald-500' : 'text-slate-300'}`}>Completed</button>
           </div>
        </div>
        
        {visibleGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {visibleGoals.map((g: any) => {
               const stats = calculateGoalProgress(g);
               return (
               <div key={g.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-lg flex flex-col justify-between h-56 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Target size={80} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${g.status === 'Completed' ? 'text-emerald-500' : 'text-emerald-500'}`}>{g.status || 'Active'}</p>
                       {filter === 'Active' && stats.isComplete && (
                          <button onClick={() => markCompleted(g)} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-200 transition-colors flex items-center gap-1">
                             <CheckCircle2 size={12}/> Mark Done
                          </button>
                       )}
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 max-w-[80%] leading-none">{g.title}</h4>
                  </div>
                  
                  <div className="space-y-2 mt-4 relative z-10">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${stats.percent}%` }} />
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-xs font-bold text-slate-400">{g.activity}</p>
                        <p className="text-xl font-black text-slate-900">{stats.current} <span className="text-[10px] text-slate-400 uppercase">/ {g.target} {stats.unitLabel}</span></p>
                        <button onClick={(e) => {e.stopPropagation(); deleteGoal(g.id);}} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all z-20"><Trash2 size={16}/></button>
                    </div>
                  </div>
               </div>
             )})}
          </div>
        ) : (
          <div className="w-full py-20 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><Flag size={24}/></div>
            <div>
               <p className="text-slate-900 font-black uppercase tracking-widest text-lg">No Goals Set</p>
               <p className="text-slate-400 text-xs font-medium mt-1">Define a target to start tracking your progress.</p>
            </div>
            {filter === 'Active' && (
                <button onClick={() => setShowCreate(true)} className="mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 underline">Create First Goal</button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-black uppercase text-slate-900 tracking-tight">Suggested Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Just Getting Started", desc: "Any Activity 2 times / week", count: 2 },
            { title: "Take It Up A Notch", desc: "Any Activity 3 times / week", count: 3 },
            { title: "Kick It Into High Gear", desc: "Any Activity 4 times / week", count: 4 }
          ].map((preset, i) => (
            <div key={i} className="bg-white p-8 md:p-10 rounded-[40px] md:rounded-[50px] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all hover:-translate-y-1">
               <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                  <Trophy size={20} />
               </div>
               <div className="space-y-2 flex-1">
                  <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">{preset.title}</h4>
                  <p className="text-sm font-medium text-slate-500">{preset.desc}</p>
               </div>
               <button onClick={() => addPreset(preset.count)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-400 transition-colors">Set Goal</button>
            </div>
          ))}
        </div>
      </div>

      {showCreate && <CreateGoalModal onClose={() => setShowCreate(false)} onSubmit={handleCustomSubmit} userPreferences={userPreferences} />}
    </div>
  );
};
