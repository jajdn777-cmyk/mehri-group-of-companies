
import React, { useState, useMemo } from 'react';
import { Trophy, Calendar, Filter, ArrowRight, Activity, Zap, Timer, Flame, Dumbbell, X, Lock, Heart, Moon, Waves } from 'lucide-react';
import { ACTIVITY_CATEGORIES, getLocalTodayStr } from './constants.ts';
import { parseDurationToHours, formatDuration, calculateAge, getDistVal, getDistUnit, convertDist } from './utils.ts';

const LifetimeStatsModal = ({ workouts, userPreferences, onClose }: any) => {
  const units = userPreferences.units;
  const distUnit = getDistUnit(units);

  const stats = useMemo(() => {
    const grouped: Record<string, { count: number, dist: number, dur: number, cal: number }> = {};
    let total = { count: 0, dist: 0, dur: 0, cal: 0 };

    workouts.forEach((w: any) => {
      const type = w.type || 'Other';
      if (!grouped[type]) grouped[type] = { count: 0, dist: 0, dur: 0, cal: 0 };
      
      const dist = parseFloat(w.distance) || 0;
      const cal = parseFloat(w.calories) || 0;
      const dur = parseDurationToHours(w.duration || '00:00:00');

      grouped[type].count += 1;
      grouped[type].dist += dist;
      grouped[type].dur += dur;
      grouped[type].cal += cal;

      total.count += 1;
      total.dist += dist;
      total.dur += dur;
      total.cal += cal;
    });

    return { grouped, total };
  }, [workouts]);

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 md:p-6 bg-slate-900/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[30px] md:rounded-[60px] w-full max-w-6xl flex flex-col shadow-2xl overflow-hidden relative my-8 md:my-0 h-auto md:h-[85vh] min-h-[50vh]">
        <button onClick={onClose} aria-label="Close modal" className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-slate-900 transition-colors z-20"><X size={28} md-size={32}/></button>
        
        <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50">
           <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">My Lifetime Stats</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Aggregated data across all time</p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-10">
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Distance</p>
                 <p className="text-2xl md:text-3xl font-black text-slate-900">{getDistVal(stats.total.dist, units, 1)} <span className="text-[10px] md:text-xs text-slate-400">{distUnit}</span></p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Time</p>
                 <p className="text-2xl md:text-3xl font-black text-slate-900">{(stats.total.dur / 24).toFixed(1)} <span className="text-[10px] md:text-xs text-slate-400">days</span></p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Energy</p>
                 <p className="text-2xl md:text-3xl font-black text-slate-900">{(stats.total.cal).toLocaleString()} <span className="text-[10px] md:text-xs text-slate-400">kcal</span></p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Workouts</p>
                 <p className="text-2xl md:text-3xl font-black text-slate-900">{stats.total.count}</p>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-auto p-6 md:p-12">
          {/* MOBILE: CARD STACK */}
          <div className="md:hidden space-y-4">
             {(Object.entries(stats.grouped) as [string, { count: number, dist: number, dur: number, cal: number }][]).sort((a,b) => b[1].count - a[1].count).map(([type, data]) => (
                <div key={type} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"><Activity size={18}/></span>
                      <span className="font-black text-slate-900 text-lg">{type}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Count</p><p className="font-bold text-slate-700">{data.count}</p></div>
                      <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Dist</p><p className="font-bold text-slate-700">{getDistVal(data.dist, units, 1)} {distUnit}</p></div>
                      <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time</p><p className="font-bold text-slate-700">{data.dur.toFixed(1)}h</p></div>
                      <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Cal</p><p className="font-bold text-slate-700">{data.cal.toLocaleString()}</p></div>
                   </div>
                </div>
             ))}
          </div>

          {/* DESKTOP: TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-6 text-[10px] font-black uppercase text-slate-400 tracking-widest pl-4">Activity Type</th>
                  <th className="pb-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Number</th>
                  <th className="pb-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Distance ({distUnit})</th>
                  <th className="pb-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Duration (hr)</th>
                  <th className="pb-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right pr-4">Calories</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(stats.grouped) as [string, { count: number, dist: number, dur: number, cal: number }][]).sort((a,b) => b[1].count - a[1].count).map(([type, data]) => (
                  <tr key={type} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-6 pl-4 font-black text-slate-900 text-sm flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#A7F3D0] group-hover:text-slate-900 transition-colors"><Activity size={14}/></span>
                      {type}
                    </td>
                    <td className="py-6 text-right font-bold text-slate-600">{data.count}</td>
                    <td className="py-6 text-right font-bold text-slate-600">{getDistVal(data.dist, units, 1)}</td>
                    <td className="py-6 text-right font-bold text-slate-600">{data.dur.toFixed(1)}</td>
                    <td className="py-6 text-right pr-4 font-bold text-slate-600">{data.cal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const BiometricsSection = () => (
  <div className="relative w-full h-64 md:h-80 rounded-[30px] md:rounded-[40px] overflow-hidden shadow-xl group cursor-not-allowed border border-slate-800">
    {/* Sensor Background Updated to provided link */}
    <img 
      src="https://images2.imgbox.com/56/17/7wy6uJHG_o.jpeg" 
      onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=800'}
      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 grayscale brightness-50" 
      alt="Sensor Array" 
    />
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]" />
    
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8 z-10 space-y-4 md:space-y-6">
       <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800/80 rounded-full flex items-center justify-center backdrop-blur-md border border-slate-700 shadow-2xl ring-1 ring-[#A7F3D0]/20">
          <Lock size={28} md-size={36} className="text-[#A7F3D0]" />
       </div>
       <div>
          <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight leading-none">Biometrics Locked</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-2 md:mt-3">Link Mehri fitness tracker to visualize deep health metrics</p>
       </div>
       
       <div className="flex gap-2 md:gap-4 opacity-40 select-none scale-90 md:scale-100">
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 md:px-5 md:py-3 rounded-full">
             <Heart size={14} className="text-red-400"/> <span className="text-[10px] md:text-xs font-bold text-white tracking-widest uppercase">HRV</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 md:px-5 md:py-3 rounded-full">
             <Moon size={14} className="text-indigo-400"/> <span className="text-[10px] md:text-xs font-bold text-white tracking-widest uppercase">REM</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 md:px-5 md:py-3 rounded-full">
             <Waves size={14} className="text-blue-400"/> <span className="text-[10px] md:text-xs font-bold text-white tracking-widest uppercase">SpO2</span>
          </div>
       </div>
    </div>
  </div>
);


const NetEnergyDial = ({ metrics }: any) => {
    const isDeficit = metrics.net < 0;
    const absNet = Math.abs(metrics.net);
    const percentage = Math.min((absNet / 1000) * 100, 100);

    return (
        <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[30px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={100}/></div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">Net Energy<br/>Balance</h3>

            <div className="flex flex-col items-center justify-center py-4 relative z-10">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                        <circle
                            cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                            strokeDasharray={502.4}
                            strokeDashoffset={502.4 - (502.4 * percentage) / 100}
                            className={`${isDeficit ? 'text-emerald-400' : 'text-orange-400'} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black">{absNet.toFixed(0)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isDeficit ? 'Deficit' : 'Surplus'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 relative z-10 border-t border-white/10 pt-8">
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Intake</p>
                    <p className="text-sm font-bold">{metrics.intake} <span className="text-[8px] text-slate-500">kcal</span></p>
                </div>
                <div className="text-center border-x border-white/10">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Active</p>
                    <p className="text-sm font-bold">{metrics.activeBurn} <span className="text-[8px] text-slate-500">kcal</span></p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">BMR</p>
                    <p className="text-sm font-bold">{metrics.bmr.toFixed(0)} <span className="text-[8px] text-slate-500">kcal</span></p>
                </div>
            </div>
        </div>
    );
};

export const StatsView = ({ workouts, userPreferences, userMeals = [], userSpecs = {}, userProfile = {} }: any) => {
  const [range, setRange] = useState('Week');
  const [startDay, setStartDay] = useState('Sunday');
  const [typeFilter, setTypeFilter] = useState('All Activity');
  const [showLifetime, setShowLifetime] = useState(false);
  const dailyMetrics = useMemo(() => {
    const today = getLocalTodayStr();
    const weight = parseFloat(userSpecs.weight) || 70;
    const height = parseFloat(userSpecs.height) || 175;
    const birthdate = userProfile.birthdate || '1990-01-01';
    const gender = userProfile.gender || 'male';

    const age = calculateAge(birthdate);
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender.toLowerCase() === 'male') bmr += 5;
    else bmr -= 161;

    const todayWorkouts = workouts.filter((w: any) => w.date === today);
    const activeBurn = todayWorkouts.reduce((sum: number, w: any) => sum + (parseFloat(w.calories) || 0), 0);

    const todayMeals = userMeals.filter((m: any) => m.date === today);
    const intake = todayMeals.reduce((sum: number, m: any) => sum + (m.data?.calories || 0), 0);

    const totalOut = bmr + activeBurn;
    const net = intake - totalOut;

    return { bmr, activeBurn, intake, net, totalOut };
  }, [workouts, userMeals, userSpecs, userProfile]);



  const units = userPreferences.units;
  const distUnit = getDistUnit(units);

  // --- Filtering Logic ---
  const filteredWorkouts = useMemo(() => {
    let relevant = [...workouts];
    
    if (typeFilter !== 'All Activity') {
      relevant = relevant.filter((w: any) => w.type === typeFilter);
    }

    const today = new Date(getLocalTodayStr());
    const cutoff = new Date(today);
    
    if (range === 'Week') cutoff.setDate(today.getDate() - 7);
    if (range === 'Month') cutoff.setMonth(today.getMonth() - 1);
    if (range === 'Year') cutoff.setFullYear(today.getFullYear() - 1);

    relevant = relevant.filter((w: any) => new Date(w.date) >= cutoff && new Date(w.date) <= today);
    return relevant;
  }, [workouts, range, typeFilter]);

  // --- Aggregation Logic ---
  const summary = useMemo(() => {
    let distKm = 0, dur = 0, cal = 0, count = 0;
    filteredWorkouts.forEach((w: any) => {
      distKm += parseFloat(w.distance) || 0;
      cal += parseFloat(w.calories) || 0;
      dur += parseDurationToHours(w.duration || '00:00:00');
      count++;
    });
    return { dist: getDistVal(distKm, units, 1), dur, cal, count };
  }, [filteredWorkouts, units]);

  const chartData = useMemo(() => {
    const bins = Array(7).fill(0).map(() => ({ dist: 0, dur: 0, cal: 0, count: 0 }));
    
    filteredWorkouts.forEach((w: any) => {
      const dayIndex = new Date(w.date).getDay();
      bins[dayIndex].dist += convertDist(parseFloat(w.distance) || 0, units);
      bins[dayIndex].dur += parseDurationToHours(w.duration || '00:00:00');
      bins[dayIndex].cal += (parseFloat(w.calories) || 0);
      bins[dayIndex].count += 1;
    });

    return bins;
  }, [filteredWorkouts, units]);

  // --- Top Performances Logic ---
  const records = useMemo(() => {
    const sortedByDist = [...workouts].sort((a,b) => parseFloat(b.distance) - parseFloat(a.distance));
    const sortedByCal = [...workouts].sort((a,b) => parseFloat(b.calories) - parseFloat(a.calories));
    
    const getFastest = (minKm: number) => {
      const candidates = workouts.filter((w: any) => (parseFloat(w.distance) || 0) >= minKm);
      if (candidates.length === 0) return null;
      
      const withPace = candidates.map((w: any) => {
        const hours = parseDurationToHours(w.duration || '00:00:00');
        const km = parseFloat(w.distance);
        const pace = hours / km; // hours per km
        return { ...w, pace, hours };
      });
      
      withPace.sort((a: any, b: any) => a.pace - b.pace);
      const best = withPace[0];
      
      const estimatedTimeHours = best.pace * minKm;
      const h = Math.floor(estimatedTimeHours);
      const m = Math.floor((estimatedTimeHours - h) * 60);
      const s = Math.round(((estimatedTimeHours - h) * 60 - m) * 60);
      return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    return {
      farthest: sortedByDist[0] ? getDistVal(parseFloat(sortedByDist[0].distance), units, 2) + ` ${distUnit}` : '-',
      mostEnergy: sortedByCal[0] ? parseFloat(sortedByCal[0].calories).toFixed(0) + ' kcal' : '-',
      fastest1k: getFastest(1) || '-',
      fastest5k: getFastest(5) || '-',
      fastest10k: getFastest(10) || '-',
      halfMarathon: getFastest(21.0975) || '-',
      marathon: getFastest(42.195) || '-'
    };
  }, [workouts, units, distUnit]);

  const SimpleBarChart = ({ title, dataKey, unit }: any) => {
    const max = Math.max(...chartData.map(d => d[dataKey]), 1);
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between h-64">
        <div className="flex justify-between items-start mb-4">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h4>
           <span className="text-[10px] font-black text-[#A7F3D0] bg-slate-900 px-2 py-1 rounded">{unit}</span>
        </div>
        <div className="flex-1 flex items-end justify-between gap-1 md:gap-2">
          {chartData.map((d: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full h-32 flex items-end">
                <div 
                  className="w-full bg-[#A7F3D0] rounded-sm transition-all duration-1000 group-hover:bg-slate-900" 
                  style={{ height: `${(d[dataKey] / max) * 100}%` }} 
                />
              </div>
              <span className="text-[8px] md:text-[9px] font-black text-slate-300 group-hover:text-slate-900 transition-colors">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const flattenCategories = Object.values(ACTIVITY_CATEGORIES).flat();
  const allActivities = Array.from(new Set(flattenCategories)).sort();

  return (
    <div className="animate-fade-in space-y-8 md:space-y-12 pb-32 px-4 md:px-0">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 md:gap-8">
         <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">Detailed Stats</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Deep dive into your performance metrics</p>
         </div>
         <div className="bg-white p-2 rounded-[25px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
               <select value={range} onChange={(e) => setRange(e.target.value)} className="w-full appearance-none bg-slate-50 hover:bg-slate-100 pl-4 pr-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-900 outline-none cursor-pointer transition-colors">
                  <option>Week</option><option>Month</option><option>Year</option>
               </select>
               <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/>
            </div>
            <div className="relative group flex-1 md:flex-none">
               <select value={startDay} onChange={(e) => setStartDay(e.target.value)} className="w-full appearance-none bg-slate-50 hover:bg-slate-100 pl-4 pr-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-900 outline-none cursor-pointer transition-colors">
                  <option>Sunday</option><option>Monday</option>
               </select>
               <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/>
            </div>
            <div className="relative group flex-1 md:flex-none">
               <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full appearance-none bg-slate-50 hover:bg-slate-100 pl-4 pr-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-900 outline-none cursor-pointer transition-colors min-w-[150px]">
                  <option>All Activity</option>
                  {allActivities.map(a => <option key={a}>{a}</option>)}
               </select>
               <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         {[
           { label: 'Distance', val: summary.dist, unit: distUnit },
           { label: 'Duration', val: (summary.dur / 24).toFixed(1), unit: 'days' },
           { label: 'Calories', val: summary.cal.toLocaleString(), unit: 'kcal' },
           { label: 'Workouts', val: summary.count, unit: 'qty' }
         ].map((item, i) => (
           <div key={i} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{item.label}</p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{item.val} <span className="text-xs md:text-sm text-slate-400 font-bold uppercase ml-1">{item.unit}</span></p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
         <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <SimpleBarChart title="Distance" dataKey="dist" unit={distUnit.toUpperCase()} />
            <SimpleBarChart title="Duration" dataKey="dur" unit="HRS" />
            <SimpleBarChart title="Calories" dataKey="cal" unit="KCAL" />
            <SimpleBarChart title="Volume" dataKey="count" unit="QTY" />
         </div>

         <div className="space-y-8">
            <NetEnergyDial metrics={dailyMetrics} />
            <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[30px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={100}/></div>
               <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">Top<br/>Performances</h3>
               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Farthest Run</span>
                     <span className="text-lg md:text-xl font-black">{records.farthest}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Most Energy</span>
                     <span className="text-lg md:text-xl font-black">{records.mostEnergy}</span>
                  </div>
                  <div className="space-y-3 pt-2">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fastest Splits (Est.)</p>
                     {[
                       { l: '1k', v: records.fastest1k },
                       { l: '5k', v: records.fastest5k },
                       { l: '10k', v: records.fastest10k },
                       { l: 'Half', v: records.halfMarathon },
                       { l: 'Full', v: records.marathon },
                     ].map((r) => (
                       <div key={r.l} className="flex justify-between text-xs md:text-sm">
                          <span className="font-bold text-slate-400">{r.l}</span>
                          <span className="font-mono font-bold">{r.v}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setShowLifetime(true)}
              className="w-full py-6 border-2 border-[#A7F3D0] text-slate-900 rounded-[30px] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#A7F3D0] hover:text-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
               View Lifetime Stats <ArrowRight size={14}/>
            </button>
         </div>
      </div>

      <BiometricsSection />

      {showLifetime && <LifetimeStatsModal workouts={workouts} userPreferences={userPreferences} onClose={() => setShowLifetime(false)} />}
    </div>
  );
};

const ChevronDown = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
