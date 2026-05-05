
import React, { useState, useEffect, useId } from 'react';
import { User, CreditCard, Monitor, ArrowRight, Save, Clock, MapPin, Ruler, Weight, UserCircle, Calendar, ShieldAlert } from 'lucide-react';
import { getDistVal, getDistUnit, convertDist, api } from './utils.ts';
import { AdminView } from './Admin.tsx';
import { ADMIN_EMAIL } from './constants.ts';

const calculateTotalDistance = (workouts: any[], units: 'imperial' | 'metric') => {
  const km = workouts.reduce((acc: number, w: any) => acc + (parseFloat(w.distance) || 0), 0);
  return getDistVal(km, units, 1);
};

export const SettingsView = ({ 
  userProfile, setUserProfile, 
  userPreferences, setUserPreferences,
  userSpecs, setUserSpecs,
  workouts,
  blogs,
  onShop,
  userHandle
}: any) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'display'>('profile');
  const genderId = useId();
  const restDayId = useId();
  const timezoneId = useId();
  const [form, setForm] = useState(userProfile);
  const [specsForm, setSpecsForm] = useState(userSpecs);
  const [showAdmin, setShowAdmin] = useState(false);
  
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  
  const units = userPreferences.units;

  useEffect(() => {
    if (userSpecs.height) {
      const cm = parseInt(userSpecs.height);
      const totalInches = cm / 2.54;
      setHeightFt(Math.floor(totalInches / 12).toString());
      setHeightIn(Math.round(totalInches % 12).toString());
    }
  }, []);

  const handleSave = () => {
    let finalHeightCm = specsForm.height;
    let finalWeightKg = specsForm.weight;

    if (units === 'imperial') {
      finalWeightKg = (parseFloat(specsForm.weight) * 0.453592).toFixed(1);
      const totalInches = (parseInt(heightFt || '0') * 12) + parseInt(heightIn || '0');
      finalHeightCm = (totalInches * 2.54).toFixed(0);
    }
    
    // API UPDATE
    api("UPDATE_PROFILE", { 
        username: userProfile.username,
        profile: form,
        specs: { weight: finalWeightKg, height: finalHeightCm },
        preferences: userPreferences
    });

    setUserProfile(form);
    setUserSpecs({ weight: finalWeightKg, height: finalHeightCm });
    alert("Profile Updated Successfully in Database.");
  };

  const navItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'display', label: 'Display', icon: Monitor },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      {showAdmin && (
        <AdminView 
          onClose={() => setShowAdmin(false)} 
          adminEmail={userProfile.email} 
          currentBlogs={blogs} 
          currentWorkouts={workouts}
          currentUser={userProfile}
        />
      )}
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-fade-in min-h-[80vh] px-4 md:px-0 mb-32">
        {/* LEFT NAV */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-6 md:space-y-8">
          <div className="space-y-2 mb-4 md:mb-8">
            <h2 className="text-3xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 font-serif">Settings</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Manage your bio-core</p>
          </div>
          
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group whitespace-nowrap shrink-0 lg:shrink focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-[#A7F3D0]' : 'text-slate-400 group-hover:text-slate-900'} />
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>

          {/* ADMIN GOD MODE BUTTON */}
          {userProfile.email === ADMIN_EMAIL && (
             <button 
               type="button"
               onClick={() => setShowAdmin(true)} 
               className="w-full mt-4 md:mt-8 bg-slate-900 text-[#A7F3D0] border border-[#A7F3D0]/20 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-[0_0_15px_rgba(167,243,208,0.1)] group focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none"
             >
                <ShieldAlert size={18} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">Admin Command</span>
             </button>
          )}
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-white rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm p-6 md:p-14 relative overflow-hidden">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8 md:space-y-12 animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 md:pb-12 border-b border-slate-100">
                  <div className="space-y-1">
                     <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Member Since</p>
                     <p className="text-lg md:text-xl font-bold text-slate-900 font-serif">{formatDate(form.joinDate)}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Friends</p>
                     <p className="text-lg md:text-xl font-bold text-slate-900 font-serif">{form.friends}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">All Time Dist</p>
                     <p className="text-lg md:text-xl font-bold text-slate-900 font-serif">{calculateTotalDistance(workouts, units)} {getDistUnit(units)}</p>
                  </div>
               </div>

               <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <InputGroup label="First Name *" value={form.firstName} onChange={v => setForm({...form, firstName: v})} />
                     <InputGroup label="Last Name *" value={form.lastName} onChange={v => setForm({...form, lastName: v})} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <InputGroup label="Username" value={form.username} disabled={true} />
                     <InputGroup label="Email" value={form.email} disabled={true} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <InputGroup label="Birthdate *" type="date" value={form.birthdate} onChange={v => setForm({...form, birthdate: v})} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:gap-8">
                     {units === 'imperial' ? (
                       <>
                          <InputGroup label="Weight (lb)" type="number" value={specsForm.weight} onChange={v => setSpecsForm({...specsForm, weight: v})} />
                          <InputGroup label="Height (ft)" type="number" value={heightFt} onChange={setHeightFt} />
                          <InputGroup label="Height (in)" type="number" value={heightIn} onChange={setHeightIn} />
                       </>
                     ) : (
                       <>
                          <InputGroup label="Weight (kg)" type="number" value={specsForm.weight} onChange={v => setSpecsForm({...specsForm, weight: v})} />
                          <div className="col-span-2">
                             <InputGroup label="Height (cm)" type="number" value={specsForm.height} onChange={v => setSpecsForm({...specsForm, height: v})} />
                          </div>
                       </>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <div className="space-y-2">
                        <label htmlFor={genderId} className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest cursor-pointer">Gender *</label>
                        <div className="relative">
                           <select id={genderId} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl px-5 py-4 focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none appearance-none font-sans">
                              <option value="">Select...</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Non-binary">Non-binary</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                           </select>
                           <div className="absolute right-4 top-4 pointer-events-none text-slate-400">▼</div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                     <InputGroup label="City" value={form.city} onChange={v => setForm({...form, city: v})} />
                     <InputGroup label="State" value={form.state} onChange={v => setForm({...form, state: v})} />
                     <InputGroup label="Location" placeholder="e.g. Gym" value={form.location} onChange={v => setForm({...form, location: v})} />
                  </div>
                  
                  <div className="p-4 md:p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Calendar size={18}/></div>
                        <label htmlFor={restDayId} className="cursor-pointer">
                           <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Weekly Rest Day</p>
                           <p className="text-xs text-slate-400 mt-1">Protects your streak on this day</p>
                        </label>
                     </div>
                     <div className="relative w-full md:w-auto md:min-w-[200px]">
                        <select id={restDayId} value={userPreferences.restDay || ""} onChange={e => setUserPreferences({...userPreferences, restDay: e.target.value})} className="w-full bg-white border-none text-slate-900 text-xs font-bold rounded-xl px-4 py-3 focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none appearance-none font-sans">
                           <option value="">None</option>
                           <option value="Monday">Monday</option>
                           <option value="Tuesday">Tuesday</option>
                           <option value="Wednesday">Wednesday</option>
                           <option value="Thursday">Thursday</option>
                           <option value="Friday">Friday</option>
                           <option value="Saturday">Saturday</option>
                           <option value="Sunday">Sunday</option>
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
                     </div>
                  </div>
               </div>

               <div className="pt-4 md:pt-8">
                  <button type="button" onClick={handleSave} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-500 transition-colors shadow-lg flex items-center justify-center gap-3 focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none"><Save size={16}/> Save Changes</button>
               </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-12 animate-fade-in flex flex-col items-center text-center py-10">
               <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-[#A7F3D0] shadow-2xl mb-4"><CreditCard size={40} /></div>
               <div className="space-y-4 max-w-lg"><h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 font-serif">Tracker Access</h3><p className="text-lg text-slate-500 font-medium leading-relaxed font-sans">Your tracker experience begins with the watch. Unlock real-time bio-metric synchronization and biometric analysis.</p></div>
               <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 w-full max-w-xl">
                  <div className="flex justify-between items-center mb-6"><span className="text-xs font-black uppercase tracking-widest text-slate-400">Current Plan</span><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Free Tier</span></div>
                  <div className="h-px bg-slate-200 w-full mb-6" />
                  <button type="button" onClick={onShop} className="w-full py-5 bg-[#A7F3D0] text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-3 focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none">Subscribe & Get Tracker <ArrowRight size={16}/></button>
               </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-12 animate-fade-in max-w-2xl">
               <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-4">
                     <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Ruler size={18}/></div><div><p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Measurement Units</p><p className="text-xs text-slate-400 mt-1">Weight, distance, height</p></div></div>
                     <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button type="button" onClick={() => setUserPreferences({...userPreferences, units: 'imperial'})} className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none ${units === 'imperial' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Imperial</button>
                        <button type="button" onClick={() => setUserPreferences({...userPreferences, units: 'metric'})} className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none ${units === 'metric' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Metric</button>
                     </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Clock size={18}/></div>
                        <label htmlFor={timezoneId} className="cursor-pointer">
                           <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Time Zone</p>
                           <p className="text-xs text-slate-400 mt-1">Local time display</p>
                        </label>
                     </div>
                     <div className="relative w-full md:w-auto md:min-w-[200px]">
                        <select id={timezoneId} value={userPreferences.timezone} onChange={e => setUserPreferences({...userPreferences,timezone: e.target.value})} className="w-full bg-white border-none text-slate-900 text-xs font-bold rounded-xl px-4 py-3 focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none appearance-none font-sans">
                           {["America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney", "UTC"].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

const InputGroup = ({ label, type = "text", value, onChange, placeholder, disabled = false }: any) => {
  const id = useId();
  return (
    <div className="space-y-2 w-full">
      <label htmlFor={id} className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest cursor-pointer">{label}</label>
      <input
        id={id}
        type={type}
        className={`w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl px-5 py-4 focus-visible:ring-2 ring-emerald-500 ring-offset-2 outline-none transition-all font-sans ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};
