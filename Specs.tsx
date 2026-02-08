
import React, { useState, useEffect } from 'react';
import { getWeightUnit } from './utils.ts';

export const SpecsSection = ({ specs, onComplete, userPreferences }: any) => {
  const [displayWeight, setDisplayWeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [displayHeightCm, setDisplayHeightCm] = useState('');
  
  const units = userPreferences.units;
  const weightUnit = getWeightUnit(units);

  useEffect(() => {
    // Only autofill if they are NOT the default placeholders ("70" and "175")
    const isDefaultWeight = specs.weight === '70' || !specs.weight;
    const isDefaultHeight = specs.height === '175' || !specs.height;

    if (!isDefaultWeight) {
        const currentWeightKg = parseFloat(specs.weight);
        if (units === 'imperial') {
            setDisplayWeight((currentWeightKg * 2.20462).toFixed(0));
        } else {
            setDisplayWeight(currentWeightKg.toString());
        }
    }

    if (!isDefaultHeight) {
        const currentHeightCm = parseFloat(specs.height);
        if (units === 'imperial') {
            const totalInches = currentHeightCm / 2.54;
            setHeightFt(Math.floor(totalInches / 12).toString());
            setHeightIn(Math.round(totalInches % 12).toString());
        } else {
            setDisplayHeightCm(currentHeightCm.toString());
        }
    }
  }, [units, specs]);

  const handleConfirm = () => {
     let finalWeightKg = displayWeight;
     let finalHeightCm = displayHeightCm;

     if (units === 'imperial') {
        finalWeightKg = (parseFloat(displayWeight) * 0.453592).toFixed(1);
        const totalInches = (parseInt(heightFt || '0') * 12) + parseInt(heightIn || '0');
        finalHeightCm = (totalInches * 2.54).toFixed(0);
     }
     
     // Basic validation to prevent empty submission
     if (!finalWeightKg || (!finalHeightCm && units === 'metric') || (units === 'imperial' && !heightFt)) {
         alert("Please enter your details.");
         return;
     }
     
     onComplete({ weight: finalWeightKg, height: finalHeightCm });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-[#A7F3D0] z-[6000] flex items-center justify-center animate-fade-in font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[150px] opacity-60 pointer-events-none" />
        
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 md:p-16 shadow-2xl w-full max-w-3xl text-center space-y-12 relative z-10 m-4">
            <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Your Specs</h2>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Calibrate your bio-metrics</p>
            </div>
            
            <div className={`grid ${units === 'imperial' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 md:gap-8`}>
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Weight ({weightUnit})</label>
                    <input 
                        type="number" 
                        placeholder={units === 'imperial' ? "150" : "70"} 
                        className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 text-2xl font-black rounded-[20px] px-4 md:px-8 py-6 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-center"
                        value={displayWeight}
                        onChange={e => setDisplayWeight(e.target.value)}
                    />
                </div>
                
                {units === 'imperial' ? (
                  <>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Height (ft)</label>
                        <input 
                            type="number" 
                            placeholder="5" 
                            className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 text-2xl font-black rounded-[20px] px-4 md:px-8 py-6 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-center"
                            value={heightFt}
                            onChange={e => setHeightFt(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Height (in)</label>
                        <input 
                            type="number" 
                            placeholder="10" 
                            className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 text-2xl font-black rounded-[20px] px-4 md:px-8 py-6 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-center"
                            value={heightIn}
                            onChange={e => setHeightIn(e.target.value)}
                        />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Height (cm)</label>
                      <input 
                          type="number" 
                          placeholder="175" 
                          className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 text-2xl font-black rounded-[20px] px-4 md:px-8 py-6 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-center"
                          value={displayHeightCm}
                          onChange={e => setDisplayHeightCm(e.target.value)}
                      />
                  </div>
                )}
            </div>

            <button 
                onClick={handleConfirm} 
                className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:scale-[1.02] transition-all"
            >
                Confirm Data
            </button>
        </div>
    </div>
  );
};
