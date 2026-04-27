
import { supabase } from './supabaseClient.ts';

// --- RATE LIMITER CONFIGURATION ---
const RATE_LIMIT_WINDOW_MS = 60000; // 1 Minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Implements Fixed Window Counter algorithm using LocalStorage
// Note: Client-side enforcement approximates "Per IP" limiting for the SPA context
const checkClientRateLimit = (): boolean => {
  try {
    const now = Date.now();
    const windowStart = parseInt(localStorage.getItem('mehri_rl_start') || '0');
    const requestCount = parseInt(localStorage.getItem('mehri_rl_count') || '0');

    if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
      // Start new window
      localStorage.setItem('mehri_rl_start', now.toString());
      localStorage.setItem('mehri_rl_count', '1');
      return true;
    } else {
      // Check existing window
      if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
        return false;
      }
      localStorage.setItem('mehri_rl_count', (requestCount + 1).toString());
      return true;
    }
  } catch (e) {
    // Fallback if storage fails
    return true;
  }
};

// --- HELPER UTILS (MATH & FORMATTING) ---
export const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) { return fallback; }
};

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};

export const parseDurationToHours = (durationStr: string) => {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length !== 3) return 0.5;
  const hours = parts[0] + (parts[1] / 60) + (parts[2] / 3600);
  return hours || 0;
};

export const getMETValue = (activity: string, speedKmH?: number) => {
  const activityLower = activity.toLowerCase();

  if (activityLower.includes("run") || activityLower.includes("jog") || activityLower.includes("sprinting")) {
      if (speedKmH && speedKmH > 0) {
          if (speedKmH <= 6.4) return 6.0;
          if (speedKmH <= 8.0) return 8.3;
          if (speedKmH <= 9.7) return 9.8;
          if (speedKmH <= 11.3) return 11.0;
          if (speedKmH <= 12.9) return 11.8;
          if (speedKmH <= 14.5) return 12.8;
          if (speedKmH <= 16.1) return 14.5;
          return 16.0;
      }
      if (activityLower.includes("sprinting")) return 23.0;
      if (activityLower.includes("trail")) return 11.8;
      if (activityLower.includes("jog")) return 7.0;
      return 9.8;
  }

  if (activityLower.includes("walk")) {
      if (speedKmH && speedKmH > 0) {
          if (speedKmH < 3.2) return 2.0;
          if (speedKmH < 4.8) return 2.8;
          if (speedKmH < 5.6) return 3.5;
          if (speedKmH < 6.4) return 4.3;
          if (speedKmH < 7.2) return 5.0;
          return 7.0;
      }
      return 3.5;
  }

  if (activityLower.includes("cycling") || activityLower.includes("bike")) {
      if (speedKmH && speedKmH > 0) {
          if (speedKmH < 16) return 4.0;
          if (speedKmH < 19) return 6.8;
          if (speedKmH < 22) return 8.0;
          if (speedKmH < 26) return 10.0;
          if (speedKmH < 31) return 12.0;
          return 15.0;
      }
      return 8.0;
  }

  if (activityLower.includes("swim")) return 8.3;
  if (activityLower.includes("weight") || activityLower.includes("strength") || isStrengthActivity(activity)) return 5.0;
  if (activityLower.includes("yoga")) return 2.5;
  if (activityLower.includes("boxing")) return 12.8;
  if (activityLower.includes("basketball")) return 8.0;
  if (activityLower.includes("soccer")) return 10.0;
  if (activityLower.includes("tennis")) return 7.3;

  return 6.0;
};

export const isStrengthActivity = (type: string) => {
  const lower = type.toLowerCase();
  return (lower.includes("press") || lower.includes("squat") || lower.includes("deadlift") || lower.includes("curl") || lower.includes("extension") || lower.includes("row") || lower.includes("pull") || lower.includes("push up") || lower.includes("sit up") || lower.includes("crunch") || lower.includes("plank") || lower.includes("lunge") || lower.includes("weight") || lower.includes("strength") || lower.includes("bench") || lower.includes("dip") || lower.includes("raise") || lower.includes("fly"));
};

export const calculateAge = (birthdate: string) => {
  if (!birthdate) return 30; 
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? age : 30;
};

export const calculateBMR = (weightKg: number, heightCm: number, age: number, gender: string) => {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'Male' ? Math.round(base + 5) : Math.round(base - 161);
};

export const calculateEstimatedCalories = (type: string, weightKg: number, distanceKm: number, durationHours: number, profile?: any, modifiers?: any) => {
  const durationMin = durationHours * 60;
  const speedKmH = (distanceKm && durationHours > 0) ? distanceKm / durationHours : 0;
  let met = getMETValue(type, speedKmH);

  let multiplier = 1.0;
  if (modifiers?.surface === "Sand") multiplier = 1.25;

  let baseCalories = met * 3.5 * weightKg / 200 * durationMin;

  // Strength training specific logic
  if (isStrengthActivity(type) || type.toLowerCase().includes("weight")) {
    const sets = parseInt(modifiers?.sets || "0");
    const reps = parseInt(modifiers?.reps || "0");
    const weightLiftedKg = parseFloat(modifiers?.weightLiftedKg || "0");

    if (sets > 0 && reps > 0) {
        // Estimate work done: Calories = (sets * reps * weightLiftedKg * 0.05) + (base calories for duration)
        const workCalories = (sets * reps * weightLiftedKg) * 0.05;
        baseCalories += workCalories;
    }
  }

  if (modifiers?.loadKg) multiplier *= (weightKg + modifiers.loadKg) / weightKg;

  return Math.round(baseCalories * multiplier);
};

export const detectSystemUnits = (): 'imperial' | 'metric' => {
  const saved = localStorage.getItem('mehri_units');
  return saved === 'imperial' ? 'imperial' : 'metric';
};

export const convertDist = (valKm: number | string, units: 'imperial' | 'metric') => {
  const val = Number(valKm);
  if (isNaN(val)) return 0;
  return units === 'metric' ? val : val * 0.621371;
};

export const convertWeight = (valKg: number | string, units: 'imperial' | 'metric') => {
  const val = Number(valKg);
  if (isNaN(val)) return 0;
  return units === 'metric' ? val : val * 2.20462;
};

export const getDistVal = (valKm: number | string, units: 'imperial' | 'metric', precision = 1) => convertDist(valKm, units).toFixed(precision);
export const getDistUnit = (units: 'imperial' | 'metric') => units === 'imperial' ? 'mi' : 'km';
export const getWeightUnit = (units: 'imperial' | 'metric') => units === 'imperial' ? 'lb' : 'kg';

// --- DATABASE CACHE FOR PERSISTENT UI STATE ---
export const getUserCache = (username: string) => {
  try {
    const key = `mehri_data_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
};

export const updateUserCache = (username: string, newData: any) => {
  try {
    const key = `mehri_data_${username}`;
    const current = getUserCache(username) || {};
    const merged = { ...current, ...newData, lastUpdated: Date.now() };
    localStorage.setItem(key, JSON.stringify(merged));
  } catch (e) {}
};

export const calculateStreak = (workouts: any[], restDayOfWeek?: string) => {
  if (!workouts || workouts.length === 0) return 0;
  
  const logs = new Set(workouts.map((w: any) => {
      const val = w.date || '';
      const dateString = (typeof val === 'string' && val.includes('T')) ? val.split('T')[0] : val;
      return dateString;
  }));

  const now = new Date();
  const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const todayStr = toStr(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toStr(yesterday);

  let streak = 0;
  let checkDate = new Date(now);

  if (logs.has(todayStr)) {
      // Current date is logged
  } else if (logs.has(yesterdayStr)) {
      checkDate = yesterday;
  } else {
      return 0;
  }

  while (true) {
      const dateStr = toStr(checkDate);
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (logs.has(dateStr)) {
          streak++;
      } else if (restDayOfWeek && dayName === restDayOfWeek) {
          streak++;
      } else {
          break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

// --- REAL SUPABASE API LAYER ---
export const api = async (action: string, payload: any) => {
  // Apply Client-Side Rate Limiting
  if (!checkClientRateLimit()) {
    console.warn(`[RateLimit] Blocked request: ${action}`);
    return { status: 'error', message: 'Rate limit exceeded (10 req/min). Please wait a moment.' };
  }

  try {
    if (action === 'LOGOUT') { await supabase.auth.signOut(); return { status: 'success' }; }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError && action !== 'LOGIN' && action !== 'REGISTER') {
        return { status: 'error', message: 'Authentication failed. Please login again.' };
    }
    
    const userId = authData?.user?.id;
        if (action === 'REGISTER') {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            username: payload.username,
            full_name: payload.name,
          }
        }
      });
      if (error) return { status: 'error', message: error.message };
      
      const joinDate = new Date().toISOString();
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: payload.email,
          username: payload.username,
          full_name: payload.name,
          units: payload.units,
          join_date: joinDate
        });
        
        return { 
          status: 'success', 
          data: { 
            user: { 
              ...data.user, 
              username: payload.username, 
              auth: { name: payload.name, joinDate: joinDate }, 
              preferences: { units: payload.units } 
            } 
          } 
        };
      }
      return { status: 'error', message: "Registration failed." };
    }

    if (action === 'LOGIN') {
      let emailToUse = payload.login;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(payload.login);

      if (!isEmail) {
          let handle = payload.login.trim();
          if (!handle.startsWith('@')) handle = `@${handle}`;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .ilike('username', handle)
            .maybeSingle();
            
          if (!profileData || !profileData.email) return { status: 'error', message: "Username not found." };
          emailToUse = profileData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse, 
        password: payload.password
      });
      
      if (error) return { status: 'error', message: error.message };
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      if (!profile) return { status: 'error', message: "Profile data missing." };

      return { 
          status: 'success', 
          data: { 
              user: { 
                  ...data.user, 
                  username: profile.username,
                  email: profile.email,
                  auth: { name: profile.full_name, joinDate: profile.join_date || profile.created_at },
                  preferences: { units: profile.units || 'metric' },
                  profile: { firstName: profile.full_name?.split(' ')[0], hasWatch: profile.has_watch },
                  specs: { weight: profile.weight, height: profile.height }
              }
          }
      };
    }

    if (action === 'SYNC_USER') {
      if(!userId) return { status: 'error', message: 'Not logged in' };
      const [p, w, g, r, m, b, c] = await Promise.all([
         supabase.from('profiles').select('*').eq('id', userId).single(),
         supabase.from('workouts').select('*').eq('user_id', userId),
         supabase.from('goals').select('*').eq('user_id', userId),
         supabase.from('routes').select('*').eq('user_id', userId),
         supabase.from('meals').select('*').eq('user_id', userId),
         supabase.from('blogs').select('*').order('created_at', { ascending: false }), 
         supabase.from('user_challenges').select('*').eq('user_id', userId),


      ]);
      const profile = p.data || {};
      
      const formattedBlogs = (b.data || []).map((blog: any) => ({
        ...blog,
        coverImage: blog.cover_image,
        readTime: blog.read_time,
        author: blog.author_name,
        timestamp: new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));

      return {
        status: 'success',
        data: {
          user: {
             username: profile.username,
             email: profile.email,
             auth: { name: profile.full_name, joinDate: profile.join_date || profile.created_at },
             preferences: { units: profile.units, restDay: profile.rest_day, timezone: 'UTC' },
             profile: { 
               firstName: profile.full_name ? profile.full_name.split(' ')[0] : '', 
               lastName: profile.full_name ? profile.full_name.split(' ').slice(1).join(' ') : '',
               hasWatch: profile.has_watch,
               city: profile.city,
               state: profile.state,
               location: profile.location,
               gender: profile.gender,
               birthdate: profile.birthdate,
               friends: profile.friends_count
             },
             specs: { weight: profile.weight, height: profile.height },
             streaks: { current: profile.current_streak }
          },
          workouts: w.data || [], goals: g.data || [], routes: r.data || [], meals: m.data || [],
          blogs: formattedBlogs, challenges: c.data || [],

        }
      };
    }

    if (action === 'SAVE_WORKOUT') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       const { data, error } = await supabase.from('workouts').insert({
          user_id: userId, 
          type: payload.type, 
          date: payload.date, 
          distance: payload.distance, 
          duration: payload.duration, 
          calories: payload.calories, 
          sets: payload.sets, 
          reps: payload.reps, 
          weight_lifted: payload.weight_lifted,
          data: payload.data
       }).select().single();
       
       if (error) { console.error("[SAVE_WORKOUT] Error:", error); return { status: 'error', message: error.message }; }
       return { status: 'success', data };
    }
    
    if (action === 'DELETE_WORKOUT') { await supabase.from('workouts').delete().eq('id', payload.id); return { status: 'success' }; }
    
    if (action === 'SAVE_GOAL') { 
        if(!userId) return { status: 'error', message: 'Not logged in' };
        const { data, error } = await supabase.from('goals').insert({ 
            user_id: userId, 
            title: payload.title, 
            activity_type: payload.activity, 
            target_type: payload.type, 
            target_value: payload.target, 
            start_date: payload.startDate, 
            status: payload.status 
        }).select().single(); 
        
        if (error) return { status: 'error', message: error.message };
        return { status: 'success', data }; 
    }
    
    if (action === 'UPDATE_GOAL_STATUS') { await supabase.from('goals').update({ status: payload.status }).eq('id', payload.id); return { status: 'success' }; }
    if (action === 'DELETE_GOAL') { await supabase.from('goals').delete().eq('id', payload.id); return { status: 'success' }; }
    
    if (action === 'UPDATE_PROFILE') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       const updates: any = {};
       if (payload.profile?.firstName) updates.full_name = payload.profile.firstName + ' ' + (payload.profile.lastName || '');
       if (payload.specs?.weight) updates.weight = payload.specs.weight;
       if (payload.specs?.height) updates.height = payload.specs.height;
       if (payload.preferences?.units) updates.units = payload.preferences.units;
       if (payload.preferences?.restDay) updates.rest_day = payload.preferences.restDay;
       if (payload.profile?.city) updates.city = payload.profile.city;
       if (payload.profile?.state) updates.state = payload.profile.state;
       if (payload.profile?.location) updates.location = payload.profile.location;
       if (payload.profile?.gender) updates.gender = payload.profile.gender;
       if (payload.profile?.birthdate) updates.birthdate = payload.profile.birthdate;
       
       await supabase.from('profiles').update(updates).eq('id', userId);
       return { status: 'success' };
    }

    if (action === 'PUBLISH_BLOG') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       
       // STRICT ADMIN CHECK
       const { data: userData } = await supabase.from('profiles').select('email').eq('id', userId).single();
       if (userData?.email !== 'jajdn777@gmail.com') {
           return { status: 'error', message: 'Unauthorized: Admin privileges required.' };
       }

       const { data, error } = await supabase.from('blogs').insert({
          user_id: userId,
          title: payload.title,
          content: payload.content,
          author_name: payload.author,
          cover_image: payload.coverImage,
          read_time: payload.readTime,
          category: payload.category || 'General',
          likes: 0,
          created_at: new Date().toISOString()
       }).select().single();
       
       if (error) return { status: 'error', message: error.message };
       
       const formatted = {
          ...data,
          coverImage: data.cover_image,
          readTime: data.read_time,
          author: data.author_name,
          timestamp: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
       };
       return { status: 'success', data: formatted };
    }

    if (action === 'LIKE_BLOG') {
       const { error } = await supabase.rpc('increment_blog_likes', { blog_id: payload.id });
       if (error) {
          const { data } = await supabase.from('blogs').select('likes').eq('id', payload.id).single();
          if (data) {
             await supabase.from('blogs').update({ likes: (data.likes || 0) + 1 }).eq('id', payload.id);
          }
       }
       return { status: 'success' };
    }

    if (action === 'DELETE_BLOG') {
       await supabase.from('blogs').delete().eq('id', payload.id);
       return { status: 'success' };
    }

    if (action === 'SAVE_ROUTE') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       
       const { data, error } = await supabase.from('routes').insert({
          user_id: userId,
          name: payload.name,
          distance: payload.distance,
          points: payload.points, // Safe to pass arrays if column is JSONB
       }).select().single();
       
       if (error) return { status: 'error', message: error.message };
       return { status: 'success', data };
    }

    if (action === 'DELETE_ROUTE') {
       await supabase.from('routes').delete().eq('id', payload.id);
       return { status: 'success' };
    }







    if (action === 'SAVE_MEAL') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       const { error } = await supabase.from('meals').insert({
          user_id: userId,
          date: payload.date,
          name: payload.name,
          data: payload.data
       });
       if (error) return { status: 'error', message: error.message };
       return { status: 'success' };
    }

    if (action === 'JOIN_CHALLENGE') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       const { error } = await supabase.from('user_challenges').insert({
          user_id: userId,
          challenge_id: payload.challenge_id,
          title: payload.title,
          status: 'Active',
          joined_date: new Date().toISOString()
       });
       if (error) return { status: 'error', message: error.message };
       return { status: 'success' };
    }

    if (action === 'LEAVE_CHALLENGE') {
       await supabase.from('user_challenges').delete().match({ user_id: userId, challenge_id: payload.challenge_id });
       return { status: 'success' };
    }

    if (action === 'UPDATE_STREAK') {
       if(!userId) return { status: 'error', message: 'Not logged in' };
       await supabase.from('profiles').update({ current_streak: payload.streak }).eq('id', userId);
       return { status: 'success' };
    }

    if (action === 'GOOGLE_AUTH') {
       return { status: 'error', message: 'Google Auth requires backend configuration' };
    }


    // --- ADMIN HANDLERS ---
    if (action === 'ADMIN_GET_ALL') {
       if (payload.adminEmail.toLowerCase() !== 'jajdn777@gmail.com') return { status: 'error', message: 'Unauthorized' };
       
       const [users, blogs, workouts, goals] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('blogs').select('*'),
          supabase.from('workouts').select('*'),
          supabase.from('goals').select('*')
       ]);
       
       return { 
          status: 'success', 
          data: {
             users: users.data || [],
             blogs: blogs.data || [],
             workouts: workouts.data || [],
             goals: goals.data || []
          }
       };
    }

    if (action === 'ADMIN_UPDATE_USER') {
       const { targetUsername, updates } = payload;
       const { data: targetUser } = await supabase.from('profiles').select('id').eq('username', targetUsername).single();
       if (!targetUser) return { status: 'error', message: 'User not found' };
       
       const dbUpdates: any = {};
       if (updates.name) dbUpdates.full_name = updates.name;
       if (updates.weight) dbUpdates.weight = updates.weight;
       if (updates.height) dbUpdates.height = updates.height;
       
       await supabase.from('profiles').update(dbUpdates).eq('id', targetUser.id);
       return { status: 'success' };
    }

    if (action === 'ADMIN_DELETE_USER') {
       const { targetUsername } = payload;
       const { data: targetUser } = await supabase.from('profiles').select('id').eq('username', targetUsername).single();
       if (targetUser) {
          await supabase.auth.admin.deleteUser(targetUser.id); 
          await supabase.from('profiles').delete().eq('id', targetUser.id);
       }
       return { status: 'success' };
    }

    if (action === 'ADMIN_DELETE_BLOG') {
       await supabase.from('blogs').delete().eq('id', payload.blogId);
       return { status: 'success' };
    }

    if (action === 'ADMIN_BROADCAST') {
       await supabase.from('blogs').insert({
          user_id: userId,
          title: 'System Broadcast',
          content: payload.message,
          author_name: 'MEHRI System',
          category: 'Announcement',
          likes: 0,
          read_time: '1 min',
          created_at: new Date().toISOString()
       });
       return { status: 'success' };
    }

    return { status: 'error', message: 'Unknown Action' };
  } catch (err: any) {
    console.error("API Layer Error:", err);
    return { status: 'error', message: err.message };
  }
};
