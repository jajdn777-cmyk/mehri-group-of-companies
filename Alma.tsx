
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Plus, MessageSquare, Settings, Trash2, Check, X, Save, User, Volume2, Menu } from 'lucide-react';
import { getLocalTodayStr, ACTIVITY_CATEGORIES } from './constants.ts';
import { calculateEstimatedCalories, parseDurationToHours, getDistUnit, getWeightUnit, api } from './utils.ts';

const COACH_AVATAR = "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=200&h=200&q=80";

interface Message {
  role: 'user' | 'model' | 'assistant';
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
  memories, setMemories, chats, setChats, routes, userPreferences, userProfile, userHandle, userGoals 
}: any) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'settings'>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemorySaveTick, setShowMemorySaveTick] = useState(false);
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialization Logic
    if (chats && chats.length > 0) {
        if (!activeChatId) {
            // Resume most recent chat
            setActiveChatId(chats[0].id);
        }
    } else {
        // No chats exist at all, create one
        if (chats.length === 0) {
             createNewChat();
        }
    }
  }, [chats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, activeChatId, isLoading]);

  const activeChat = chats.find((c: ChatSession) => c.id === activeChatId);

  const createNewChat = () => {
    // Prevent duplicate empty sessions
    if (chats.length > 0) {
        const latest = chats[0];
        if (latest.messages.length <= 1 && latest.title === 'New Session') {
            setActiveChatId(latest.id);
            setViewMode('chat');
            setShowSidebar(false);
            return;
        }
    }

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
    setShowSidebar(false);
    
    if(usernameToSave) api("SAVE_SESSION", { ...newChat, username: usernameToSave });
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Allow deleting even the last chat, we'll just create a new one automatically via useEffect
    const newChats = chats.filter((c: ChatSession) => c.id !== id);
    setChats(newChats);
    
    if (activeChatId === id) {
        setActiveChatId(newChats.length > 0 ? newChats[0].id : null);
    }
    api("DELETE_SESSION", { id });
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Female')) && v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => { window.speechSynthesis.getVoices(); }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeChat) return;
    
    const usernameToSave = userProfile.username || userHandle;
    const userMsg = input;
    setInput('');
    
    const newMessages = [...activeChat.messages, { role: 'user', text: userMsg } as Message];
    let updatedChat = { ...activeChat, messages: newMessages, lastModified: Date.now() };
    
    setChats(prev => prev.map(c => c.id === activeChatId ? updatedChat : c));
    setIsLoading(true);

    const modelPlaceholder = { role: 'model', text: '' } as Message;
    const messagesWithPlaceholder = [...newMessages, modelPlaceholder];
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...updatedChat, messages: messagesWithPlaceholder } : c));

    // --- TITLE GENERATION (LIGHTWEIGHT FETCH) ---
    // Only generate title if it's the first user message
    let titlePromise = Promise.resolve(activeChat.title);
    if (activeChat.messages.length <= 1) {
        const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
        if (apiKey) {
            titlePromise = fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: 'user', content: `Generate a short, concise 2-4 word title for this chat based on this message: "${userMsg}". Do not use quotes.` }]
                })
            }).then(res => res.json()).then(data => {
                const t = data.choices?.[0]?.message?.content?.trim().replace(/"/g, '') || "Session";
                setChats(prev => prev.map((c: any) => c.id === activeChatId ? { ...c, title: t } : c));
                return t;
            }).catch(() => "Session");
        }
    }

    try {
      // --- PREPARE CONTEXT FOR API ---
      const userContext = {
          name: userName,
          hasWatch: userProfile.hasWatch,
          recentWorkouts: workouts.slice(-3),
          goals: userGoals || [] 
      };

      // Convert messages to standard format
      const apiHistory = newMessages.map(m => ({
          role: m.role === 'model' ? 'assistant' : m.role,
          content: m.text
      }));

      // --- CALL CENTRAL API ---
      const response = await api("ALMA_CHAT", {
          messages: apiHistory,
          userContext: userContext
      });

      if (response.status === 'success' && response.data) {
          const finalContent = response.data.content;
          const loggedWorkout = response.data.loggedWorkout;

          // If AI logged a workout, update the local state immediately
          if (loggedWorkout) {
              setWorkouts((prev: any[]) => [...prev, loggedWorkout]);
          }

          const finalTitle = await titlePromise;
          const finalChatState = { 
              ...updatedChat, 
              title: finalTitle,
              messages: [...newMessages, { role: 'model', text: finalContent }], 
              lastModified: Date.now() 
          };
          
          setChats(prev => prev.map(c => c.id === activeChatId ? finalChatState : c));
          if (usernameToSave) api("SAVE_SESSION", { ...finalChatState, username: usernameToSave });

      } else {
          throw new Error(response.message || "Unknown error");
      }

    } catch (error: any) {
      console.error(error);
      const errMessages = [...newMessages, { role: 'model', text: "Connection error: " + (error.message || "Unknown error") } as Message];
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: errMessages } : c));
    } finally {
      setIsLoading(false);
    }
  };

  const addManualMemory = () => {
    const usernameToSave = userProfile.username || userHandle;
    if (!newMemoryInput.trim()) return;
    const newMems = [...memories, newMemoryInput];
    setMemories(newMems);
    if(usernameToSave) api("SAVE_MEMORIES", { username: usernameToSave, memories: newMems });
    setNewMemoryInput('');
  };

  const removeMemory = (index: number) => {
    const usernameToSave = userProfile.username || userHandle;
    const newMems = [...memories];
    newMems.splice(index, 1);
    setMemories(newMems);
    if(usernameToSave) api("SAVE_MEMORIES", { username: usernameToSave, memories: newMems });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-7rem)] md:h-[calc(100vh-12rem)] w-full max-w-full bg-white rounded-[30px] md:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 font-sans mx-auto mb-20 md:mb-0 relative">
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

      <div 
        className={`md:hidden absolute inset-0 z-[40] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setShowSidebar(false)} 
      />

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
                        {(m.role === 'model' || m.role === 'assistant') ? (<div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200"><img src={COACH_AVATAR} className="w-full h-full object-cover" alt="Coach"/></div>) : (<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs border border-slate-200">You</div>)}
                     </div>
                     <div className="flex-1 pt-1 space-y-1">
                        <div className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-2">
                          {(m.role === 'model' || m.role === 'assistant') ? 'Alma' : 'You'}
                          {(m.role === 'model' || m.role === 'assistant') && m.text && (
                            <button onClick={() => speak(m.text)} className="text-slate-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" title="Read Aloud">
                              <Volume2 size={14}/>
                            </button>
                          )}
                        </div>
                        <div className="text-sm md:text-[15px] leading-6 md:leading-7 text-slate-800 whitespace-pre-wrap font-normal min-h-[20px]">
                            {m.text}
                            {(m.role === 'model' || m.role === 'assistant') && isLoading && i === activeChat.messages.length - 1 && (
                                <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse align-middle"/>
                            )}
                        </div>
                     </div>
                  </div>
                ))}
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
