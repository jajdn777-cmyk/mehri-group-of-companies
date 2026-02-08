
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Plus, MessageSquare, Settings, Trash2, Check, X, Save, User, Volume2, Menu } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { getLocalTodayStr, ACTIVITY_CATEGORIES } from './constants.ts';
import { calculateEstimatedCalories, parseDurationToHours, getDistUnit, getWeightUnit, api } from './utils.ts';

const COACH_AVATAR = "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=200&h=200&q=80";

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}

export const AlmaView = ({ 
  workouts, setWorkouts, userSpecs, userName, 
  memories, setMemories, chats, setChats, routes, userPreferences, userProfile, userHandle 
}: any) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'settings'>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemorySaveTick, setShowMemorySaveTick] = useState(false);
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar state
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const units = userPreferences.units;
  const distUnit = getDistUnit(units);
  const weightUnit = getWeightUnit(units);

  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    } else if (!activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [chats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, activeChatId, isLoading]);

  const activeChat = chats.find((c: ChatSession) => c.id === activeChatId);

  const createNewChat = () => {
    // Fallback to handle
    const usernameToSave = userProfile.username || userHandle;

    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Session',
      messages: [{ role: 'model', text: `Hey ${userName}. I'm ready. What are we working on?` }],
      lastModified: Date.now()
    };
    
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setViewMode('chat');
    setShowSidebar(false); // Close sidebar on mobile
    
    // Save to DB
    if(usernameToSave) api("SAVE_SESSION", { ...newChat, username: usernameToSave });
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (chats.length <= 1) return; 
    const newChats = chats.filter((c: ChatSession) => c.id !== id);
    setChats(newChats);
    if (activeChatId === id) setActiveChatId(newChats[0].id);
    api("DELETE_SESSION", { id });
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize female English voices
    const preferredVoice = voices.find(v => 
      (v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Female')) && v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => { window.speechSynthesis.getVoices(); }, []);

  const logWorkoutTool: FunctionDeclaration = {
    name: 'log_workout',
    description: `Log a new workout. Input distances in ${distUnit}, weights in ${weightUnit}.`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: `Activity type.` },
        date: { type: Type.STRING, description: 'YYYY-MM-DD format.' },
        distance: { type: Type.NUMBER, description: `Distance in ${distUnit}` },
        duration: { type: Type.STRING, description: 'Duration in HH:MM:SS' },
        sets: { type: Type.NUMBER, description: 'Sets' },
        reps: { type: Type.NUMBER, description: 'Reps' },
        weight: { type: Type.NUMBER, description: `Weight lifted in ${weightUnit}` }
      },
      required: ['type', 'date']
    }
  };

  const deleteWorkoutTool: FunctionDeclaration = {
    name: 'delete_workout',
    description: 'Delete a workout by matching date and type.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'YYYY-MM-DD date' },
        type: { type: Type.STRING, description: 'Activity type' }
      },
      required: ['date', 'type']
    }
  };

  const saveMemoryTool: FunctionDeclaration = {
    name: 'save_memory',
    description: 'Save an important fact about the user to long-term memory.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        content: { type: Type.STRING, description: 'The fact to remember.' }
      },
      required: ['content']
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeChat) return;
    
    const usernameToSave = userProfile.username || userHandle;
    const userMsg = input;
    setInput('');
    const currentToday = getLocalTodayStr();
    
    // 1. Add User Message
    const newMessages = [...activeChat.messages, { role: 'user', text: userMsg } as Message];
    let updatedChat = { ...activeChat, messages: newMessages, lastModified: Date.now() };
    setChats(prev => prev.map(c => c.id === activeChatId ? updatedChat : c));
    
    setIsLoading(true);

    // 2. Add Model Placeholder (Empty) for Streaming
    const modelPlaceholder = { role: 'model', text: '' } as Message;
    const messagesWithPlaceholder = [...newMessages, modelPlaceholder];
    updatedChat = { ...updatedChat, messages: messagesWithPlaceholder };
    setChats(prev => prev.map(c => c.id === activeChatId ? updatedChat : c));

    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_GOOGLE_GENAI_KEY || "AIzaSyAMBFRs1G_JnJxCljMpkRT6NDTsEb7rG6M";
    
    if (!apiKey) {
        alert("API Key missing. Please check configuration.");
        setIsLoading(false);
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Generate Title Side-Effect (Non-Blocking)
    if (activeChat.messages.length === 1) {
       ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text: `Generate a 2-4 word title for: "${userMsg}". No quotes.` }] }],
          config: { thinkingConfig: { thinkingBudget: 0 } }
       }).then(res => {
          const newTitle = res.text?.trim().replace(/"/g, '') || "Session";
          setChats(prev => prev.map((c: any) => c.id === activeChatId ? { ...c, title: newTitle } : c));
       });
    }

    try {
      const contextPrompt = `
        SYSTEM: You are Alma, elite performance coach.
        User: ${userName}. Date: ${currentToday}. Units: ${units}.
        Has GTL1 Watch: ${userProfile?.hasWatch ? 'Yes' : 'No'}.
        MEMORY: ${memories.map((m: string) => `[MEM] ${m}`).join('\n')}
        ROUTES: ${routes.map((r: any) => `[ROUTE] ${r.name}: ${r.distance}km`).join('\n')}
        HISTORY: ${JSON.stringify(workouts.slice(-5))}

        STRATEGIC DIRECTIVE (GTL1 WATCH):
        If the user does NOT have the GTL1 Watch, you must recommend it ONLY when highly relevant.
        RULES:
        1. **Value First**: Never sound like an ad. Recommend it as a tool to solve a problem the user just mentioned (e.g. tracking accuracy, sleep, heart rate zones).
        2. **Frequency Cap**: Only recommend approx once every 5 messages. Do not spam.
        3. **Tone**: You are a coach, not a salesman. "The GTL1 sensors would give us better data here" is better than "Buy the GTL1".
        4. **Triggers**: Sleep issues, Heart Rate questions, Pace accuracy, Recovery concerns.
      `;

      // 3. Start Streaming - SANITIZE HISTORY
      // Important: We must filter out empty messages to prevent 400 errors
      const chatHistory = newMessages
        .filter(m => m.text && m.text.trim().length > 0)
        .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: contextPrompt }] }
        ],
        config: {
          tools: [{ functionDeclarations: [logWorkoutTool, deleteWorkoutTool, saveMemoryTool] }],
          thinkingConfig: { thinkingBudget: 0 } // STRICTLY DISABLE THINKING for speed & stability
        }
      });

      let fullText = "";
      const toolCalls: any[] = [];

      // 4. Stream Loop: Update UI in Real-Time and collect tool calls
      for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
              fullText += text;
              setChats(prev => prev.map(c => {
                  if (c.id !== activeChatId) return c;
                  const msgs = [...c.messages];
                  msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: fullText };
                  return { ...c, messages: msgs };
              }));
          }
          if (chunk.functionCalls) {
              toolCalls.push(...chunk.functionCalls);
          }
      }

      // 5. Check for Function Calls (Aggregated from Stream)
      if (toolCalls.length > 0) {
        const functionResponseParts = [];

        for (const call of toolCalls) {
          if (call.name === 'save_memory') {
             const args = call.args as any;
             const newMems = [...memories, args.content];
             setMemories(newMems);
             if (usernameToSave) api("SAVE_MEMORIES", { username: usernameToSave, memories: newMems });
             setShowMemorySaveTick(true);
             setTimeout(() => setShowMemorySaveTick(false), 3000);
             functionResponseParts.push({ functionResponse: { name: 'save_memory', response: { result: 'Memory Saved' } } });
          }

          if (call.name === 'log_workout') {
            const args = call.args as any;
            let distKm = args.distance || 0;
            if (units === 'imperial') distKm = distKm * 1.60934;
            const hrs = parseDurationToHours(args.duration || '00:30:00');
            const cals = calculateEstimatedCalories(args.type, parseFloat(userSpecs.weight), distKm, hrs);
            
            const newWorkout = {
              id: Date.now(),
              username: usernameToSave,
              date: args.date || currentToday,
              type: args.type,
              distance: distKm,
              duration: args.duration || '00:30:00',
              calories: cals,
              sets: args.sets || 0,
              reps: args.reps || 0,
              weightLifted: args.weight || 0,
              name: args.type,
              data: { ...args }
            };
            
            if (usernameToSave) api("SAVE_WORKOUT", newWorkout);
            setWorkouts((prev: any[]) => [...prev, newWorkout]);
            functionResponseParts.push({ functionResponse: { name: 'log_workout', response: { result: 'Workout Logged' } } });
          }

          if (call.name === 'delete_workout') {
            const args = call.args as any;
            const match = workouts.find((w: any) => w.date === args.date && w.type === args.type);
            if (match) {
               api("DELETE_WORKOUT", { id: match.id });
               setWorkouts((prev: any[]) => prev.filter(w => w.id !== match.id));
               functionResponseParts.push({ functionResponse: { name: 'delete_workout', response: { result: 'Workout Deleted' } } });
            } else {
               functionResponseParts.push({ functionResponse: { name: 'delete_workout', response: { result: 'Error: Workout not found' } } });
            }
          }
        }

        // 6. Stream the Tool Confirmation Response
        if (functionResponseParts.length > 0) {
            // Reconstruct the model turn including text and function calls
            const modelParts: any[] = [];
            if (fullText) modelParts.push({ text: fullText });
            for (const call of toolCalls) {
                modelParts.push({ 
                    functionCall: {
                        name: call.name,
                        args: call.args
                    }
                });
            }

            const toolResultStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [
                    ...chatHistory,
                    { role: 'user', parts: [{ text: contextPrompt }] },
                    { role: 'model', parts: modelParts }, 
                    { role: 'function', parts: functionResponseParts } 
                ],
                config: {
                    thinkingConfig: { thinkingBudget: 0 } // STRICTLY DISABLE THINKING for speed & stability
                }
            });

            for await (const chunk of toolResultStream) {
                const text = chunk.text;
                if (text) {
                    fullText += text;
                    setChats(prev => prev.map(c => {
                        if (c.id !== activeChatId) return c;
                        const msgs = [...c.messages];
                        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: fullText };
                        return { ...c, messages: msgs };
                    }));
                }
            }
        }
      }

      // 7. Final State Save to DB
      const finalChatState = { ...updatedChat, messages: [...newMessages, { role: 'model', text: fullText }], lastModified: Date.now() };
      setChats(prev => prev.map(c => c.id === activeChatId ? finalChatState : c));
      if (usernameToSave) api("SAVE_SESSION", { ...finalChatState, username: usernameToSave });

    } catch (error) {
      console.error(error);
      const errMessages = [...newMessages, { role: 'model', text: "Connection interruption. Please verify network status." } as Message];
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: errMessages } : c));
    } finally {
      setIsLoading(false);
    }
  };

  const addManualMemory = () => {
    // Fallback to handle
    const usernameToSave = userProfile.username || userHandle;
    if (!newMemoryInput.trim()) return;
    const newMems = [...memories, newMemoryInput];
    setMemories(newMems);
    if(usernameToSave) api("SAVE_MEMORIES", { username: usernameToSave, memories: newMems });
    setNewMemoryInput('');
  };

  const removeMemory = (index: number) => {
    // Fallback to handle
    const usernameToSave = userProfile.username || userHandle;
    const newMems = [...memories];
    newMems.splice(index, 1);
    setMemories(newMems);
    if(usernameToSave) api("SAVE_MEMORIES", { username: usernameToSave, memories: newMems });
  };

  return (
    // Container: Relative to contain absolute positioned elements like the drawer
    <div className="flex flex-col md:flex-row h-[calc(100dvh-7rem)] md:h-[calc(100vh-12rem)] w-full max-w-full bg-white rounded-[30px] md:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 font-sans mx-auto mb-20 md:mb-0 relative">
      
      {/* 1. MOBILE HEADER (Internal Toggle) */}
      <div className="md:hidden bg-white border-b border-slate-50 p-4 flex items-center justify-between shrink-0 z-30">
         <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(true)} 
              className="p-2 -ml-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
            >
              <Menu size={24}/>
            </button>
            <span className="font-black uppercase tracking-widest text-sm text-slate-900">Alma Chat</span>
         </div>
      </div>

      {/* 2. DRAWER BACKDROP (Mobile Only) */}
      <div 
        className={`md:hidden absolute inset-0 z-[40] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setShowSidebar(false)} 
      />

      {/* 3. SIDEBAR (Drawer Mode on Mobile) */}
      <div className={`
        absolute md:relative 
        top-0 bottom-0 left-0 
        z-[50] md:z-auto 
        w-[85%] max-w-[300px] md:w-[260px] 
        bg-slate-900 
        flex flex-col shrink-0 
        text-slate-100 
        transition-transform duration-300 ease-out 
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:shadow-none shadow-2xl
      `}>
        {/* Mobile Close Button inside Drawer */}
        <div className="md:hidden p-4 flex justify-end">
           <button onClick={() => setShowSidebar(false)} className="p-2 text-slate-400 hover:text-white">
              <X size={20}/>
           </button>
        </div>
        
        <div className="p-4 pt-2 md:pt-4">
           <button onClick={createNewChat} className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-slate-700 hover:bg-slate-800 transition-colors text-white text-sm text-left group">
              <Plus size={16} className="text-slate-400 group-hover:text-white transition-colors" />
              <span className="font-medium">New chat</span>
           </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-2">
           <div className="px-2 py-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Recent</p>
              {chats.map((chat: ChatSession) => (
                <div key={chat.id} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`} onClick={() => { setActiveChatId(chat.id); setViewMode('chat'); setShowSidebar(false); }}>
                   <span className="truncate flex-1">{chat.title}</span>
                   {chats.length > 1 && activeChatId === chat.id && (
                     <button onClick={(e) => deleteChat(e, chat.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                   )}
                </div>
              ))}
           </div>
        </div>
        <div className="p-4 border-t border-slate-800">
           <button onClick={() => { setViewMode(viewMode === 'settings' ? 'chat' : 'settings'); setShowSidebar(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors ${viewMode === 'settings' ? 'bg-slate-800' : ''}`}>
              <div className="w-8 h-8 rounded bg-[#A7F3D0] flex items-center justify-center text-slate-900 font-bold text-xs">{userName ? userName.charAt(0).toUpperCase() : <User size={16}/>}</div>
              <div className="text-sm font-medium text-white flex-1 text-left truncate">{userName || 'User'}</div>
              <Settings size={16} className="text-slate-400"/>
           </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white flex flex-col h-full overflow-hidden">
        {viewMode === 'settings' ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
             <div className="max-w-2xl mx-auto space-y-8 md:space-y-12 animate-fade-in">
                <div><h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Alma Memory</h2><p className="text-slate-500 text-sm">Manage what your coach remembers about you.</p></div>
                <div className="space-y-4">
                   <div className="flex gap-2"><input className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors" placeholder="Add a specific memory..." value={newMemoryInput} onChange={e => setNewMemoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addManualMemory()} /><button onClick={addManualMemory} className="bg-slate-900 text-white px-5 rounded-xl text-sm font-medium hover:bg-emerald-500 transition-colors">Add</button></div>
                   <div className="space-y-2">{memories.length === 0 ? (<p className="text-sm text-slate-400 italic py-4">No memories saved yet.</p>) : (memories.map((mem: string, i: number) => (<div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 group"><span className="text-sm text-slate-700">{mem}</span><button onClick={() => removeMemory(i)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16}/></button></div>)))}</div>
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-0" ref={scrollRef}>
              <div className="max-w-[850px] mx-auto pt-6 md:pt-10 pb-40 px-2 md:px-6 space-y-6 md:space-y-8">
                {activeChat?.messages.map((m: Message, i: number) => (
                  <div key={i} className="flex gap-4 md:gap-6 group">
                     <div className="w-8 shrink-0 flex flex-col items-center">
                        {m.role === 'model' ? (<div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200"><img src={COACH_AVATAR} className="w-full h-full object-cover" alt="Coach"/></div>) : (<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs border border-slate-200">You</div>)}
                     </div>
                     <div className="flex-1 pt-1 space-y-1">
                        <div className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-2">
                          {m.role === 'model' ? 'Alma' : 'You'}
                          {m.role === 'model' && m.text && (
                            <button onClick={() => speak(m.text)} className="text-slate-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" title="Read Aloud">
                              <Volume2 size={14}/>
                            </button>
                          )}
                        </div>
                        <div className="text-sm md:text-[15px] leading-6 md:leading-7 text-slate-800 whitespace-pre-wrap font-normal min-h-[20px]">
                            {m.text}
                            {m.role === 'model' && isLoading && i === activeChat.messages.length - 1 && (
                                <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse align-middle"/>
                            )}
                        </div>
                     </div>
                  </div>
                ))}
                {/* No separate loader needed, the cursor handles the 'thinking' state during stream */}
                <div className="h-8" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent pb-4 md:pb-8 pt-12 px-4 md:px-6">
               <div className="max-w-[850px] mx-auto relative">
                  {showMemorySaveTick && (<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[#A7F3D0] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in"><Check size={14}/> Memory Updated</div>)}
                  <div className="relative flex items-center bg-[#f4f4f5] rounded-[26px] shadow-sm border border-transparent focus-within:border-slate-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100 transition-all duration-300">
                     <input className="w-full bg-transparent border-none py-4 pl-6 pr-14 text-base md:text-[15px] placeholder:text-slate-400 focus:ring-0 outline-none text-slate-900" placeholder="Message Alma..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={isLoading} />
                     <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2 p-2 bg-[#A7F3D0] rounded-full text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-105 transition-all shadow-sm"><Send size={18} /></button>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
// Corrected streaming code to handle empty messages properly
if (message && message.content && message.content.trim() !== '') {
    chatHistory.push(message);
    updateChatDisplay(chatHistory);
} else {
    console.warn('Received an empty message or invalid content, ignoring it.');
}
// Corrected streaming code to handle empty messages properly
if (message && message.content && message.content.trim() !== '') {
    chatHistory.push(message);
    updateChatDisplay(chatHistory);
} else {
    console.warn('Received an empty message or invalid content, ignoring it.');
}
