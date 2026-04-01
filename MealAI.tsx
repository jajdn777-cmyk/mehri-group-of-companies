import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Camera, Check, X, ArrowRight, Activity, Zap, Info, AlertTriangle } from 'lucide-react';
import { calculateBMR, calculateAge, api } from './utils.ts';
import { getLocalTodayStr } from './constants.ts';

const MealScanner = ({ isScanning }: { isScanning: boolean }) => (
  <div className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${isScanning ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
     <div className="relative w-64 h-64">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#A7F3D0] shadow-[0_0_20px_rgba(167,243,208,0.8)] z-20 animate-[scan_2s_ease-in-out_infinite]" />
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="opacity-80">
           <g transform="translate(100, 100) scale(0.8)">
              <path d="M-8 -35 C-12 -20 -10 0 -5 10 L5 10 C10 0 14 -20 8 -35 Z" fill="#1E293B" />
              <g transform="translate(0, -42)">
                 <ellipse cx="0" cy="0" rx="10" ry="11" fill="#1E293B" />
              </g>
           </g>
        </svg>
        <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Analyzing Biological Inputs...</p>
     </div>
     <style>{`
        @keyframes scan {
           0% { top: 0%; opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { top: 100%; opacity: 0; }
        }
     `}</style>
  </div>
);

const ConfirmationModal = ({ data, onConfirm, onCancel }: any) => (
  <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
     <div className="bg-white rounded-[30px] p-8 max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-500">
           <AlertTriangle size={32}/>
        </div>
        <div>
           <h3 className="text-xl font-black uppercase text-slate-900">Value Alert</h3>
           <p className="text-sm text-slate-500 mt-2 font-medium">AI detected an unusual calorie count for a single meal.</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl">
           <p className="text-3xl font-black text-slate-900">{data.calories} <span className="text-xs text-slate-400 uppercase">kcal</span></p>
        </div>
        <div className="flex gap-3">
           <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200">Reject</button>
           <button onClick={onConfirm} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-500">Confirm</button>
        </div>
     </div>
  </div>
);

export const MealAIView = ({ onNavigate, userMeals, setUserMeals, userSpecs, userProfile, workouts, userHandle }: any) => {
  const [image, setImage] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setImage(ev.target.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!image && !mealName) return;
    setIsScanning(true); setResult(null);
    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_GOOGLE_GENAI_KEY || "AIzaSyAMBFRs1G_JnJxCljMpkRT6NDTsEb7rG6M";
    if (!apiKey) { alert("API Key missing."); setIsScanning(false); return; }
    try {
        const ai = new GoogleGenAI({ apiKey });
        const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;
        const prompt = `ACT AS A VERIFIED NUTRITIONAL DATABASE.
          TASK: Analyze description "${mealName}" and image. Calculate macro breakdowns.
          CONTEXT: User: ${userSpecs.weight}kg. Last Activity: ${lastWorkout ? lastWorkout.type : 'None'}.
          OUTPUT JSON ONLY: { "calories": Number, "protein": Number, "carbs": Number, "fats": Number, "ingredients": ["String"], "mismatch": Boolean, "mismatchComment": "String", "contextualAdvice": "String" }`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: image ? [{ inlineData: { mimeType: image.split(';')[0].split(':')[1], data: image.split(',')[1] } }, { text: prompt }] : [{ text: prompt }] },
            config: { responseMimeType: 'application/json' }
        });
        let jsonText = response.text || "{}";
        jsonText = jsonText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        const data = JSON.parse(jsonText);
        if (data.calories > 2500 || data.calories < 100) { setResult(data); setShowConfirmation(true); } else { setResult(data); }
    } catch (e) { alert("Analysis failed."); } finally { setIsScanning(false); }
  };

  const handleSave = () => {
    if (!result) return;
    const usernameToSave = userProfile.username || userHandle;
    if (!usernameToSave) { alert("Session Error."); return; }
    const newMeal = { id: Date.now(), username: usernameToSave, date: getLocalTodayStr(), name: mealName || "Scanned Meal", data: { ...result, name: mealName || "Scanned Meal" } };
    api("SAVE_MEAL", newMeal); setUserMeals([...userMeals, newMeal]);
    alert("Meal logged."); setImage(null); setMealName(''); setResult(null);
  };

  return (
    <div className="pb-32 animate-fade-in font-sans max-w-7xl mx-auto relative">
       {showConfirmation && <ConfirmationModal data={result} onConfirm={() => setShowConfirmation(false)} onCancel={() => { setShowConfirmation(false); setResult(null); }} />}
       <div className="flex flex-col lg:flex-row justify-between items-end mb-12 border-b border-slate-100 pb-8 gap-8">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#A7F3D0] rounded-xl flex items-center justify-center text-slate-900 shadow-sm"><Activity size={20}/></div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Meal Intelligence</h2>
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">AI-Powered Nutrition Analysis</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
             <div className={`relative h-[500px] bg-slate-50 border-2 border-dashed rounded-[40px] overflow-hidden transition-all group ${image ? 'border-transparent' : 'border-slate-200 hover:border-[#A7F3D0]'}`}>
                {image ? (
                   <>
                      <img src={image} className="w-full h-full object-cover" alt="Meal" />
                      {!isScanning && !result && <button onClick={() => setImage(null)} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-slate-900 hover:bg-red-50 hover:text-red-500 transition-colors backdrop-blur-sm"><X size={20}/></button>}
                   </>
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors">
                      <Camera size={48} className="mb-4 opacity-50"/><p className="text-xs font-black uppercase tracking-[0.2em]">Drag Food Photo Here</p>
                   </div>
                )}
                {!image && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />}
                {isScanning && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10"><MealScanner isScanning={isScanning} /></div>}
             </div>
             <div className="flex gap-4">
                <input type="text" placeholder="Meal Name (e.g. Grilled Salmon)" className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-[#A7F3D0] transition-colors" value={mealName} onChange={(e) => setMealName(e.target.value)} disabled={isScanning} />
                <button onClick={handleScan} disabled={isScanning || (!image && !mealName)} className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                   {isScanning ? 'Scanning...' : 'Analyze'}
                </button>
             </div>
          </div>
          <div className="relative">
             {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6 border-2 border-dashed border-slate-100 rounded-[40px] p-10">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Activity size={32}/></div>
                   <div><h3 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Awaiting Input</h3><p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">Upload a photo or enter a meal name to let the AI analyze your nutrition.</p></div>
                </div>
             ) : (
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-50 p-10 space-y-8 animate-scale-in">
                   <div className="flex justify-between items-start">
                      <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Analysis Complete</p><h3 className="text-3xl font-black text-slate-900 uppercase leading-none">{mealName || "Scanned Meal"}</h3>{result.ingredients && <p className="text-xs text-slate-400 font-medium mt-2 max-w-sm italic">{result.ingredients.slice(0, 3).join(', ')}{result.ingredients.length > 3 ? '...' : ''}</p>}</div>
                      <div className="text-right"><p className="text-4xl font-black text-slate-900">{result.calories}</p><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calories</p></div>
                   </div>
                   {result.mismatch && <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-4 items-start"><div className="bg-white p-2 rounded-full text-orange-400 shadow-sm"><Info size={16}/></div><div><p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Reality Check</p><p className="text-sm text-orange-700 font-serif italic">"{result.mismatchComment}"</p></div></div>}
                   <div className="space-y-6">
                      {[{ label: 'Protein', val: result.protein, max: 50 }, { label: 'Carbs', val: result.carbs, max: 100 }, { label: 'Fats', val: result.fats, max: 40 }].map(m => (
                         <div key={m.label}><div className="flex justify-between text-xs font-bold text-slate-900 mb-2"><span>{m.label}</span><span>{m.val}g</span></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#A7F3D0] transition-all duration-1000 ease-out" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%` }} /></div></div>
                      ))}
                   </div>
                   <div className="pt-8 border-t border-slate-50">
                      <div className="flex gap-4"><div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-[#A7F3D0] shrink-0 shadow-lg"><Zap size={20} fill="#A7F3D0" /></div><div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Calorie AI says</p><p className="text-lg font-serif text-slate-800 leading-relaxed italic">"{result.contextualAdvice}"</p></div></div>
                   </div>
                   <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl hover:scale-[1.02]">Add to Day</button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
