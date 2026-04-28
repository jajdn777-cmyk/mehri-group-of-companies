import React from 'react';
import { Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from './utils.ts';

const CHALLENGE_PRESETS = [
  { id: 'c_2026', title: 'You VS 2026', desc: 'Log 2,026 minutes of activity this year.', img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200' },
  { id: 'c_weekly', title: 'The Weekly 10', desc: 'Complete 10 workouts in a single week.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800' },
  { id: 'c_mountain', title: 'Mountain Mover', desc: 'Accumulate 5,000ft of elevation gain.', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop' },
  { id: 'c_speed', title: 'Speed Demon', desc: 'Run a 5K under 25 minutes.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop' }
];

export const ChallengesView = ({ userChallenges, setUserChallenges, userHandle }: any) => {
  
  const handleJoin = (challenge: any) => {
    if (!userHandle) { alert("Please login to join challenges."); return; }
    
    // Check if already joined
    if (userChallenges.some((uc: any) => uc.challenge_id === challenge.id)) return;

    const newEntry = {
        challenge_id: challenge.id,
        title: challenge.title,
        status: 'Active',
        joined_date: new Date().toISOString()
    };

    api("JOIN_CHALLENGE", { username: userHandle, ...newEntry });
    setUserChallenges([...userChallenges, newEntry]);
  };

  const handleLeave = (challengeId: string) => {
    if (!confirm("Leave this challenge?")) return;
    api("LEAVE_CHALLENGE", { username: userHandle, challenge_id: challengeId });
    setUserChallenges(userChallenges.filter((c: any) => c.challenge_id !== challengeId));
  };

  return (
    <div className="space-y-12 animate-fade-in pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-slate-100 pb-8">
         <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Challenges</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Push your limits with the community</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {CHALLENGE_PRESETS.map((c) => {
           const isJoined = userChallenges.some((uc: any) => uc.challenge_id === c.id);
           return (
             <div key={c.id} className="group relative h-96 rounded-[40px] overflow-hidden shadow-lg cursor-default transition-transform hover:-translate-y-1">
                <img src={c.img} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 transition-opacity duration-300 ${isJoined ? 'bg-emerald-900/80' : 'bg-slate-900/60 group-hover:bg-slate-900/80'}`} />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                   <div className="flex justify-between items-start">
                      {isJoined && <span className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>}
                   </div>
                   
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{c.title}</h3>
                      <p className="text-xs font-medium text-slate-300 mb-6 leading-relaxed">{c.desc}</p>
                      
                      {isJoined ? (
                        <button onClick={() => handleLeave(c.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-white transition-colors">
                           Leave Challenge
                        </button>
                      ) : (
                        <button onClick={() => handleJoin(c)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                           Join <ArrowRight size={12}/>
                        </button>
                      )}
                   </div>
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
};
