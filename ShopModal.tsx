import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Heart, Moon, Droplets, Activity, Smartphone, ChevronRight, ChevronLeft, Star, ShieldCheck, Truck } from 'lucide-react';
import { SEO } from './SEO';

const PRODUCT_IMAGES = [
  "https://images2.imgbox.com/f7/29/CtPdqJrc_o.jpeg", // Rose Pink
  "https://images2.imgbox.com/56/17/7wy6uJHG_o.jpeg", // Black
  "https://images2.imgbox.com/3b/e6/QhMzpqDY_o.jpeg", // Black
  "https://images2.imgbox.com/79/ae/QtLKXnOG_o.jpeg", // Black
  "https://images2.imgbox.com/5d/54/yhMJswn3_o.jpeg", // Black
  "https://images2.imgbox.com/5a/61/KpjySc0u_o.jpeg"  // Black
];

const REVIEWS = [
  {
    name: "Shan Haseq",
    rating: 5,
    text: "Amazing quality and accurate results. Tested it against my Apple Watch and the results were identical. This colour looks so good and chic.",
    date: "Oct 2025"
  },
  {
    name: "Mary Valenzuela",
    rating: 5,
    text: "Exceeded my expectations! Battery lasts several days. Accurately tracks heart rate, sleep quality, and workouts. Reliable and delivers way more than I expected.",
    date: "Oct 2025"
  },
  {
    name: "Mahboob Shams",
    rating: 5,
    text: "Lightweight, very comfortable to wear, and the battery lasts several days on a single charge. Stylish design and great value.",
    date: "Sep 2025"
  }
];

export const ShopModal = ({ onClose, onBuy }: any) => {
  const [selectedColor, setSelectedColor] = useState<'Rose Pink' | 'Black'>('Black');
  const [currentImgIndex, setCurrentImgIndex] = useState(1); // Start with Black (index 1)

  const AMAZON_URL = "https://www.amazon.com/dp/B0FH4YTQ78?ref=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&ref_=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&social_share=cm_sw_r_cso_wa_apin_dp_9WM50155ESTE8FG1JDZG&titleSource=true&th=1";

  const handleColorChange = (color: 'Rose Pink' | 'Black') => {
    setSelectedColor(color);
    setCurrentImgIndex(color === 'Rose Pink' ? 0 : 1);
  };

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % PRODUCT_IMAGES.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length);

  return (
    <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-fade-in overflow-hidden">
       <SEO
         title="Shop Mehri Fitness Tracker"
         description="Get the Mehri Fitness Tracker for a special price. 24/7 Heart Rate, SpO2, and Sleep tracking. Lightweight and high-performance."
         product={{
           name: "Mehri Fitness Tracker",
           description: "Elite performance tracking with 24/7 biometric monitoring.",
           image: PRODUCT_IMAGES[1],
           price: "Special Offer",
           currency: "USD",
           availability: "InStock",
           url: AMAZON_URL
         }}
       />

       <motion.div
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         exit={{ y: "100%" }}
         transition={{ type: "spring", damping: 25, stiffness: 200 }}
         className="bg-white md:rounded-[40px] rounded-t-[40px] w-full max-w-6xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row h-[98dvh] lg:h-[850px] md:my-5"
       >
          {/* Header for Mobile */}
          <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-50">
             <h3 className="font-black uppercase tracking-tighter text-xl">MEHRI <span className="text-emerald-500">PRO</span></h3>
             <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-900"><X size={20}/></button>
          </div>

          <button 
            onClick={onClose}
            className="hidden lg:flex absolute top-8 right-8 z-50 p-3 bg-white/80 hover:bg-white rounded-full text-slate-900 transition-all shadow-lg backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* LEFT: VISUALS */}
          <div className="w-full lg:w-1/2 bg-slate-50 relative flex flex-col group h-auto lg:h-full shrink-0 overflow-hidden border-r border-slate-100">
             {/* Background Video for Premium Feel */}
             <div className="absolute inset-0 z-0">
                <video
                  src="/watchvid1.webm"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-10 grayscale"
                />
             </div>

             <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl w-fit"
                >
                  Limited Edition
                </motion.span>
                <motion.span
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="bg-emerald-400 text-slate-900 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg w-fit flex items-center gap-2"
                >
                   <span className="w-2 h-2 bg-slate-900 rounded-full animate-pulse"/> In Stock & Ready to Ship
                </motion.span>
             </div>

             <div className="h-[45vh] lg:h-full w-full relative z-10 flex items-center justify-center p-8 lg:p-12">
                <AnimatePresence mode="wait">
                   <motion.img
                      key={currentImgIndex}
                      initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.5 }}
                      src={PRODUCT_IMAGES[currentImgIndex]}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                      alt="Mehri fitness tracker"
                   />
                </AnimatePresence>

                {/* Image Navigation */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                   <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="p-3 rounded-full bg-white/50 backdrop-blur-md text-slate-900 hover:bg-white transition-all shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0">
                      <ChevronLeft size={24} />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="p-3 rounded-full bg-white/50 backdrop-blur-md text-slate-900 hover:bg-white transition-all shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                      <ChevronRight size={24} />
                   </button>
                </div>
             </div>

             {/* Gallery Scroller */}
             <div className="relative lg:absolute lg:bottom-8 lg:left-8 lg:right-8 mx-6 mb-8 lg:mx-0 lg:mb-0 z-20 bg-white/60 backdrop-blur-2xl p-4 rounded-[30px] border border-white/40 shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center mb-3 px-2">
                   <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Product Showcase</span>
                   <p className="text-[10px] font-bold text-slate-500 tracking-widest">{currentImgIndex + 1} / {PRODUCT_IMAGES.length}</p>
                </div>
                <div 

                  className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar px-2"
                >
                   {PRODUCT_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${currentImgIndex === i ? 'border-emerald-400 scale-105 shadow-lg' : 'border-white/50 hover:border-white opacity-70 hover:opacity-100'}`}
                        onClick={() => setCurrentImgIndex(i)}
                      >
                         <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col overflow-y-auto bg-white custom-scrollbar relative">
             <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-amber-400 text-amber-400" />)}
                   </div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">4.8 Average • 450+ Verified Sales</span>
                </div>
                <h2 className="text-3xl lg:text-5xl lg:text-7xl font-black uppercase text-slate-900 tracking-tighter leading-[0.85] mb-6">
                   MEHRI <br/>
                   <span className="text-emerald-500 italic">TRACKER</span>
                </h2>
                <p className="text-xl font-medium text-slate-500 leading-tight">
                   Everything you need to master your health.
                </p>
             </div>

             <div className="space-y-12 flex-1">
                {/* Value Props */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { icon: Heart, title: "Heart Health", desc: "24/7 Heart rate & Blood Pressure" },
                     { icon: Moon, title: "Better Sleep", desc: "Deep sleep & stress analysis" },
                     { icon: Activity, title: "100+ Sports", desc: "Track every single movement" },
                     { icon: ShieldCheck, title: "Built to Last", desc: "IP68 Waterproof & 10-day battery" },
                   ].map((feat, i) => (
                      <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <feat.icon size={22} />
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm uppercase tracking-wide">{feat.title}</p>
                            <p className="text-xs text-slate-500 font-medium">{feat.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>

                {/* Finish Selection */}
                <div className="space-y-6">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <div className="w-8 h-[1px] bg-slate-200"/> Select Your Style
                   </p>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleColorChange('Black')}
                        className={`flex-1 p-6 rounded-3xl border-2 flex items-center gap-4 transition-all ${selectedColor === 'Black' ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                      >
                         <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 shadow-inner" />
                         <span className="text-sm font-black uppercase tracking-widest">Black</span>
                      </button>
                      <button 
                         onClick={() => handleColorChange('Rose Pink')}
                         className={`flex-1 p-6 rounded-3xl border-2 flex items-center gap-4 transition-all ${selectedColor === 'Rose Pink' ? 'border-pink-300 bg-pink-50 text-slate-900 shadow-2xl scale-[1.02]' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                      >
                         <div className="w-8 h-8 rounded-full bg-pink-300 border border-pink-200 shadow-inner" />
                         <span className="text-sm font-black uppercase tracking-widest">Rose Pink</span>
                      </button>
                   </div>
                </div>

                {/* Testimonials */}
                <div className="space-y-6 pt-4">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <div className="w-8 h-[1px] bg-slate-200"/> Real User Reviews
                   </p>
                   <div className="space-y-4">
                      {REVIEWS.map((rev, i) => (
                         <motion.div
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 relative"
                         >
                            <div className="flex justify-between items-center mb-2">
                               <p className="font-black text-slate-900 text-xs uppercase">{rev.name}</p>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rev.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 italic leading-relaxed font-medium">"{rev.text}"</p>
                            <div className="flex gap-0.5 mt-3">
                               {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-emerald-500 text-emerald-500" />)}
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Footer - Sticky */}
             <div className="mt-16 pt-10 border-t border-slate-100 space-y-6 pb-8 lg:pb-0 sticky bottom-0 bg-white z-20 shadow-[0_-10px_40px_rgba(255,255,255,0.9)]">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <p className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Special Offer</p>
                         <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm">Save 28%</span>
                      </div>
                      <p className="text-sm font-bold text-slate-300 line-through tracking-wide pl-1">Massive Savings</p>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest">
                         <Truck size={14} /> Free Shipping
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Limited Time Offer</p>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                   <motion.a
                      href={AMAZON_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (onBuy) onBuy();
                        onClose();
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-7 bg-slate-900 text-white rounded-[30px] font-black uppercase text-sm tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 relative overflow-hidden group"
                   >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      Get Yours Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </motion.a>

                   <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-6 opacity-30 grayscale brightness-0">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-5" alt="Amazon" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                         Secure 256-bit encrypted checkout
                      </p>
                   </div>
                </div>
             </div>
          </div>
       </motion.div>

       <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
       `}</style>
    </div>
  );
};
