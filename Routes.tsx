import React, { useState, useRef, useEffect } from 'react';
import { Route as RouteIcon, Save, RefreshCcw, Trash2, Map, Navigation, Locate, Crosshair } from 'lucide-react';
import { getDistVal, getDistUnit, api } from './utils.ts';

declare var L: any;

export const RoutesView = ({ routes, setRoutes, userPreferences, userProfile, userHandle }: any) => {
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [routeName, setRouteName] = useState('');
  const [currentPoints, setCurrentPoints] = useState<any[]>([]);
  const [currentDistanceKm, setCurrentDistanceKm] = useState(0);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const units = userPreferences.units;
  const distUnit = getDistUnit(units);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map-container', {
          dragging: true,
          tap: true
      }).setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      
      mapRef.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setCurrentPoints(prev => [...prev, [lat, lng]]);
      });

      handleLocate();
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && currentPoints.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(currentPoints);
      } else {
        polylineRef.current = L.polyline(currentPoints, { color: '#10b981', weight: 5 }).addTo(mapRef.current);
      }

      let distMeters = 0;
      for (let i = 1; i < currentPoints.length; i++) {
        const p1 = L.latLng(currentPoints[i-1][0], currentPoints[i-1][1]);
        const p2 = L.latLng(currentPoints[i][0], currentPoints[i][1]);
        distMeters += p1.distanceTo(p2);
      }
      setCurrentDistanceKm(parseFloat((distMeters / 1000).toFixed(2)));
    }
  }, [currentPoints]);

  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const latlng: [number, number] = [latitude, longitude];
        setUserLocation(latlng);
        
        if (mapRef.current) {
          mapRef.current.setView(latlng, 15);
          
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(latlng);
          } else {
            userMarkerRef.current = L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#3b82f6", 
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(mapRef.current).bindPopup("You are here");
          }
        }
      }, (error) => {
        console.warn("Geolocation error:", error);
      });
    } else {
      alert("Geolocation is not available");
    }
  };

  const addMyLocationPoint = () => {
    if (userLocation) {
      setCurrentPoints(prev => [...prev, userLocation]);
    } else {
      handleLocate();
    }
  };

  const saveRoute = async () => {
    if (!routeName) { alert('Please name your route before saving.'); return; }
    if (currentPoints.length < 2) { alert('Please draw at least 2 points on the map.'); return; }
    
    const usernameToSave = userProfile.username || userHandle;

    if (!usernameToSave) {
        alert("Session Error: Please refresh the page.");
        return;
    }

    const newRoute = {
      id: Date.now(),
      username: usernameToSave,
      name: routeName,
      distance: currentDistanceKm, 
      points: currentPoints,
      data: { distance: currentDistanceKm, points: currentPoints }
    };
    
    const res = await api("SAVE_ROUTE", newRoute);

    if (res.status === 'success') {
      setRoutes([...routes, newRoute]);
      setRouteName('');
      setCurrentPoints([]);
      setCurrentDistanceKm(0);
      if (polylineRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      alert("Route saved to database!");
    } else {
      alert(`Failed to save route: ${res.message || "Unknown error"}`);
    }
  };

  const deleteRoute = (id: number) => {
    if (confirm('Delete this route?')) {
      api("DELETE_ROUTE", { id });
      setRoutes(routes.filter((r:any) => r.id !== id));
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in pb-32 px-4 md:px-0">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div className="w-full lg:w-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">Route Planner</h2>
          <p className="text-slate-400 mt-2 font-medium text-sm md:text-base">Click on the map to plot your path. Save to use in workouts.</p>
        </div>
        
        <div className="bg-white p-4 rounded-[20px] md:rounded-[30px] shadow-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-4 px-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 justify-between md:justify-start">
             <div className="text-right">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Distance</p>
                <p className="text-2xl font-black text-emerald-500">{getDistVal(currentDistanceKm, units, 2)} <span className="text-xs text-slate-400">{distUnit}</span></p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Points</p>
                <p className="text-xl font-bold text-slate-700">{currentPoints.length}</p>
             </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
             <input 
               className="w-full bg-slate-50 border-none rounded-xl px-6 py-3 font-bold text-base md:text-sm outline-none focus:ring-2 ring-emerald-500/20" 
               placeholder="Name your route..." 
               value={routeName}
               onChange={e => setRouteName(e.target.value)}
             />
          </div>

          <div className="flex items-center gap-2 justify-end">
             <button onClick={handleLocate} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0" title="Locate Me">
                <Locate size={18}/>
             </button>
             {userLocation && (
               <button onClick={addMyLocationPoint} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0" title="Add Current Location">
                  <Crosshair size={18}/>
               </button>
             )}
             
             <button onClick={saveRoute} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                <Save size={16}/> Save
             </button>
             
             <button onClick={() => { setCurrentPoints([]); setCurrentDistanceKm(0); if (polylineRef.current) { mapRef.current.removeLayer(polylineRef.current); polylineRef.current = null; } }} className="bg-slate-100 text-slate-400 px-4 py-3 rounded-xl hover:text-red-500 transition-all shrink-0" title="Reset Map">
                <RefreshCcw size={16}/>
             </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        <div className="lg:col-span-3">
          <div className="relative h-[300px] md:h-[600px] w-full rounded-[40px] md:rounded-[60px] border-4 border-white shadow-xl overflow-hidden z-0">
             <div id="map-container" className="h-full w-full relative z-0" />
             
             {currentPoints.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                 <div className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-full shadow-lg border border-slate-100 flex items-center gap-3">
                    <Map size={20} className="text-slate-400"/>
                    <span className="text-sm font-bold text-slate-600">Click map to draw</span>
                 </div>
               </div>
             )}
          </div>
        </div>
        
        <div className="space-y-8">
           <div className="bg-white p-6 md:p-8 rounded-[40px] md:rounded-[50px] border border-slate-100 shadow-sm space-y-6 h-full flex flex-col">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                 <Navigation size={20} className="text-emerald-500"/>
                 <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Saved Routes</h3>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px] md:max-h-[500px]">
                 {routes.length > 0 ? routes.map((r: any) => (
                   <div key={r.id} className="p-5 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 group cursor-default">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <p className="font-black text-slate-900 text-sm leading-tight">{r.name}</p>
                            <div className="flex items-center gap-2">
                               <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">{getDistVal(r.distance, units, 2)} {distUnit}</span>
                               <span className="text-[9px] text-slate-400 uppercase font-bold">{r.points.length} pts</span>
                            </div>
                         </div>
                         <button onClick={() => deleteRoute(r.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"><Trash2 size={14}/></button>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-20 flex flex-col items-center opacity-40">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <RouteIcon className="text-slate-400" size={24}/>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No routes saved</p>
                      <p className="text-[10px] text-slate-400 mt-2 max-w-[150px]">Draw on the map and click 'Save' to see them here.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};