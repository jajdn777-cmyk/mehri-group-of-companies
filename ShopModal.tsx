import React, { useState, useRef } from 'react';
import { X, Check, ArrowRight, Heart, Moon, Droplets, Activity, Smartphone, ChevronRight, ChevronLeft } from 'lucide-react';

const PRODUCT_IMAGES = [
  "https://images2.imgbox.com/f7/29/CtPdqJrc_o.jpeg",
  "https://images2.imgbox.com/56/17/7wy6uJHG_o.jpeg",
  "https://images2.imgbox.com/3b/e6/QhMzpqDY_o.jpeg",
  "https://images2.imgbox.com/79/ae/QtLKXnOG_o.jpeg",
  "https://images2.imgbox.com/5d/54/yhMJswn3_o.jpeg",
  "https://images2.imgbox.com/5a/61/KpjySc0u_o.jpeg"
];

// Fallback images if the provided links fail
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800"
];

export const ShopModal = ({ onClose, onBuy }: any) => {
  const [selectedColor, setSelectedColor] = useState<'Pink' | 'Black'>('Black');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in overflow-hidden">
       <div className="bg-white md:rounded-[40px] rounded-t-[40px] w-full max-w-6xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row h-[95dvh] lg:h-[800px] md:my-10 animate-slide-up md:animate-scale-in">
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 bg-white/50 hover:bg-white rounded-full text-slate-900 transition-all shadow-sm"
          >
            <X size={24} />
          </button>

          {/* LEFT: IMAGERY */}
          <div className="w-full lg:w-1/2 bg-slate-100 relative group h-[40vh] lg:h-full shrink-0">
             <div className="absolute top-6 left-6 z-20 flex gap-2">
                <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">GTL-1 Series</span>
                <span className="bg-emerald-400 text-slate-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">In Stock</span>
             </div>

             <div className="h-full w-full overflow-hidden relative">
                 <img 
                    src={selectedColor === 'Pink' ? PRODUCT_IMAGES[0] : PRODUCT_IMAGES[5]} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    alt="MEHRI Watch GTL1"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
             </div>

             {/* THUMBNAIL SCROLLER - overscroll-behavior-x contain prevents page swipe */}
             <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/50">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Gallery</span>
                   <div className="flex gap-2">
                      <button onClick={() => scroll('left')} className="p-1 hover:bg-slate-200 rounded-full"><ChevronLeft size={14}/></button>
                      <button onClick={() => scroll('right')} className="p-1 hover:bg-slate-200 rounded-full"><ChevronRight size={14}/></button>
                   </div>
                </div>
                <div 
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto custom-scrollbar scroll-smooth pb-2"
                  style={{ overscrollBehaviorX: 'contain' }}
                >
                   {PRODUCT_IMAGES.map((img, i) => (
                      <button key={i} className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-transparent hover:border-slate-900 transition-all" onClick={() => setSelectedColor(i < 3 ? 'Pink' : 'Black')}>
                         <img src={img} className="w-full h-full object-cover" alt="Product Thumb" />
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col overflow-y-auto">
             <div className="mb-8">
                <h2 className="text-4xl lg:text-6xl font-black uppercase text-slate-900 tracking-tighter leading-none mb-4">GTL-1 <br/><span className="text-slate-400">Titanium</span></h2>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                   <div className="flex text-emerald-500"><Check size={16}/> <Check size={16}/> <Check size={16}/> <Check size={16}/> <Check size={16}/></div>
                   <span>450+ Verified Reviews</span>
                </div>
             </div>

             <div className="space-y-6 flex-1">
                <p className="text-lg font-medium text-slate-600 leading-relaxed">
                   The hardware foundation of the MEHRI ecosystem. Aerospace-grade titanium housing, sapphire crystal display, and the most advanced bio-sensors we've ever engineered.
                </p>

                <div className="grid grid-cols-2 gap-4">
                   {[
                     { icon: Heart, label: "Real-time HRV", desc: "Heart Rate Variability" },
                     { icon: Droplets, label: "SpO2 Sensing", desc: "Blood Oxygen" },
                     { icon: Moon, label: "Sleep Staging", desc: "REM / Deep / Light" },
                     { icon: Smartphone, label: "Mehri Group Sync", desc: "Instant Pairing" },
                   ].map((feat, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <feat.icon size={20} className="text-emerald-500 mb-2" />
                         <p className="font-bold text-slate-900 text-sm">{feat.label}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{feat.desc}</p>
                      </div>
                   ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select Finish</p>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setSelectedColor('Black')}
                        className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedColor === 'Black' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 shadow-sm" />
                         <span className="text-xs font-bold uppercase">Obsidian Black</span>
                      </button>
                      <button 
                         onClick={() => setSelectedColor('Pink')}
                         className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedColor === 'Pink' ? 'border-pink-200 bg-pink-50 text-slate-900' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-pink-300 border border-pink-200 shadow-sm" />
                         <span className="text-xs font-bold uppercase">Rose Gold</span>
                      </button>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 pb-20 md:pb-0">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-3xl font-black text-slate-900">$43.99</p>
                      <p className="text-xs font-bold text-slate-400 line-through">$89.99</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Free Shipping</p>
                      <p className="text-[10px] text-slate-400">2-3 Business Days</p>
                   </div>
                </div>
                <a 
                   href="https://a.co/d/f49Dhaq"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-6 bg-[#A7F3D0] text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95"
                   onClick={onClose}
                >
                   Purchase Device <ArrowRight size={16} />
                </a>
                <p className="text-center text-[10px] text-slate-400">
                   Secure checkout via Amazon. 1-Year Warranty included.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};