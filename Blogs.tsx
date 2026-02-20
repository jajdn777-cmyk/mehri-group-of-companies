import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// SAFETY: Only importing the most basic icons to prevent module resolution crashes
import { ArrowLeft, X, Plus, Search } from 'lucide-react';
import { api } from './utils.ts';

const env = (import.meta as any).env || {};
const ADMIN_EMAIL = env.VITE_ADMIN_EMAIL;
const UNSPLASH_ACCESS_KEY = env.VITE_UNSPLASH_ACCESS_KEY;

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  username?: string;
  category: string;
  timestamp: string;
  readTime: string;
  coverImage?: string | null;
  likes: number;
}

/**
 * ZERO-DEPENDENCY BLOG EDITOR
 * - No complex libraries.
 * - No animation libraries.
 * - No external logic dependencies.
 * - Pure React + contentEditable.
 */
const BlogEditor = ({ onClose, onPublish, userName }: any) => {
  const [title, setTitle] = useState(localStorage.getItem('mehri_draft_title') || '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [page, setPage] = useState(1);
  
  // Ref for the editor div
  const editorRef = useRef<HTMLDivElement>(null);

  // Force body lock on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Attempt to restore draft
    const saved = localStorage.getItem('mehri_draft_content');
    if (saved && editorRef.current) {
        editorRef.current.innerHTML = saved;
    }

    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Native ExecCommand (Stable, Robust)
  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    saveDraft();
  };

  const saveDraft = () => {
    if (editorRef.current) {
        localStorage.setItem('mehri_draft_content', editorRef.current.innerHTML);
    }
    localStorage.setItem('mehri_draft_title', title);
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) exec('createLink', url);
  };

  const searchUnsplash = async (isNext = false) => {
    if (!query.trim()) return;
    setLoadingMedia(true);
    const nextPage = isNext ? page + 1 : 1;
    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?page=${nextPage}&per_page=12&query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await res.json();
        if (isNext) {
            setResults(prev => [...prev, ...(data.results || [])]);
            setPage(nextPage);
        } else {
            setResults(data.results || []);
            setPage(1);
        }
    } catch (e) {
        console.error("Unsplash Error", e);
    } finally {
        setLoadingMedia(false);
    }
  };

  const insertImage = (url: string) => {
    // Insert image with specific executive styling
    const imgHtml = `<img src="${url}&auto=format&q=80" style="width:100%; border-radius:10px; margin: 20px 0; display:block; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" />`;
    exec('insertHTML', imgHtml + '<p><br></p>');
  };

  const handlePublishClick = () => {
    if (!title.trim() || !editorRef.current) { alert("Title and content are required."); return; }
    
    const contentHtml = editorRef.current.innerHTML;
    const wordCount = editorRef.current.innerText.split(/\s+/).length;
    
    // Extract first image for cover
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    const firstImg = tempDiv.querySelector('img');

    onPublish({
      title: title.toUpperCase(),
      content: contentHtml,
      readTime: `${Math.ceil(wordCount / 200)} MIN READ`,
      coverImage: firstImg ? firstImg.src : null,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    });

    // Clear draft
    localStorage.removeItem('mehri_draft_content');
    localStorage.removeItem('mehri_draft_title');
  };

  // ATOMIC WRAPPER: Fixed, High Z-Index, Opaque Background
  return (
    <div 
      className="fixed inset-0 z-[99999] bg-[#001f3f] flex flex-col font-sans text-white overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {/* HEADER */}
      <div className="h-20 bg-slate-950 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-[#c5a059]"><ArrowLeft size={24}/></button>
            <div>
               <p className="text-[10px] font-black uppercase text-[#c5a059] tracking-[0.3em]">Editor Protocol</p>
               <p className="text-xs text-slate-400 font-bold">{userName}</p>
            </div>
         </div>
         <button onClick={handlePublishClick} className="bg-[#c5a059] text-slate-900 px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white transition-colors">
            Publish
         </button>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
         {/* EDITOR CANVAS */}
         <div className="flex-1 overflow-y-auto bg-[#001f3f] p-8 flex justify-center">
            <div className="w-full max-w-3xl space-y-8 pb-40">
               <input 
                  className="w-full bg-transparent text-5xl font-black text-white placeholder:text-white/20 border-none outline-none uppercase tracking-tighter"
                  placeholder="TITLE HERE..."
                  value={title}
                  onChange={e => { setTitle(e.target.value); saveDraft(); }}
               />

               {/* TOOLBAR */}
               <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-white/10 flex gap-2 flex-wrap">
                  {['Bold', 'Italic', 'H1', 'H2'].map(cmd => (
                     <button 
                        key={cmd} 
                        onClick={() => exec(cmd === 'H1' ? 'formatBlock' : cmd === 'H2' ? 'formatBlock' : cmd.toLowerCase(), cmd === 'H1' ? 'H1' : cmd === 'H2' ? 'H2' : undefined)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-[#c5a059]"
                     >
                        {cmd}
                     </button>
                  ))}
                  <button onClick={handleLink} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-[#c5a059]">Link</button>
                  <div className="w-px bg-white/10 mx-1" />
                  <button onClick={() => exec('justifyLeft')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300">L</button>
                  <button onClick={() => exec('justifyCenter')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300">C</button>
               </div>

               {/* CONTENT AREA */}
               <div 
                  ref={editorRef}
                  contentEditable
                  className="w-full min-h-[500px] text-lg text-slate-300 font-serif leading-relaxed outline-none"
                  onInput={saveDraft}
               />
            </div>
         </div>

         {/* UNSPLASH SIDEBAR */}
         <div className="w-80 bg-slate-950 border-l border-white/10 flex flex-col shrink-0">
            <div className="p-4 border-b border-white/10">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                  <input 
                     className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white outline-none focus:border-[#c5a059]"
                     placeholder="Search Unsplash..."
                     value={query}
                     onChange={e => setQuery(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && searchUnsplash()}
                  />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2 content-start">
               {results.map((img: any) => (
                  <button key={img.id} onClick={() => insertImage(img.urls.regular)} className="relative aspect-square rounded-lg overflow-hidden group">
                     <img src={img.urls.small} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                        <Plus size={20} className="text-white"/>
                     </div>
                  </button>
               ))}
               {results.length > 0 && (
                  <button onClick={() => searchUnsplash(true)} className="col-span-2 py-3 bg-white/5 text-xs font-bold text-slate-400 hover:text-white rounded-lg mt-4">Load More</button>
               )}
               {loadingMedia && <p className="col-span-2 text-center text-[10px] text-slate-500 py-4 animate-pulse">Loading...</p>}
            </div>
         </div>
      </div>
      
      {/* CSS RESET FOR EDITOR CONTENT */}
      <style>{`
         [contenteditable] h1 { font-size: 2.5em; font-weight: 900; color: white; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.1; text-transform: uppercase; }
         [contenteditable] h2 { font-size: 1.75em; font-weight: 800; color: #c5a059; margin-top: 1em; margin-bottom: 0.5em; text-transform: uppercase; }
         [contenteditable] p { margin-bottom: 1em; color: #cbd5e1; }
         [contenteditable] a { color: #c5a059; text-decoration: underline; }
         [contenteditable]:empty:before { content: "Start writing..."; color: #475569; }
      `}</style>
    </div>
  );
};

// -- READER COMPONENT --
const BlogReader = ({ post, onClose, onLike, onDelete, currentUserId }: any) => {
  const [hasLiked, setHasLiked] = useState(false);
  
  useEffect(() => {
    // Check local like status
    try {
        const liked = JSON.parse(localStorage.getItem('mehri_liked_posts') || '[]');
        if (liked.includes(post.id)) setHasLiked(true);
    } catch(e) {}
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [post.id]);

  const handleLike = () => {
    if (hasLiked) return;
    setHasLiked(true);
    onLike(post.id);
    // Visual feedback usually handled by parent state update, simplified here
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-white overflow-y-auto animate-fade-in font-sans">
       <div className="sticky top-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 z-50">
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full"><ArrowLeft size={24} className="text-slate-900"/></button>
          <div className="flex items-center gap-4">
             {post.username === currentUserId && (
                <button onClick={() => onDelete(post.id)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
             )}
          </div>
       </div>
       <div className="max-w-3xl mx-auto pt-16 pb-32 px-6">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-none">{post.title}</h1>
          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-slate-100">
             <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">{post.author?.charAt(0)}</div>
             <div>
                <p className="text-xs font-black uppercase text-slate-900 tracking-widest">{post.author}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.timestamp} • {post.readTime}</p>
             </div>
          </div>
          {post.coverImage && <img src={post.coverImage} className="w-full aspect-video rounded-[30px] object-cover mb-12 shadow-xl" />}
          <div className="prose prose-lg prose-slate max-w-none font-serif" dangerouslySetInnerHTML={{ __html: post.content }} />
       </div>
    </div>
  );
};

export const BlogsView = ({ blogs = [], setBlogs, userName, userPreferences, userHandle, userProfile }: any) => {
  const [viewMode, setViewMode] = useState<'feed' | 'editor' | 'reading'>('feed');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');

  const handlePublish = async (data: any) => {
    const tempId = Date.now();
    const newPost = { 
        id: tempId, 
        author: userName || 'Anonymous', 
        username: userHandle, 
        category: 'Insight', 
        likes: 0, 
        ...data 
    };
    setBlogs([newPost, ...blogs]);
    setViewMode('feed');
    try {
        await api("PUBLISH_BLOG", { ...newPost, username: userHandle });
    } catch(e) { console.error(e); }
  };

  const handleLike = async (id: number) => {
    const liked = JSON.parse(localStorage.getItem('mehri_liked_posts') || '[]');
    if (liked.includes(id)) return;
    
    setBlogs(blogs.map((b: any) => b.id === id ? { ...b, likes: (b.likes || 0) + 1 } : b));
    liked.push(id);
    localStorage.setItem('mehri_liked_posts', JSON.stringify(liked));
    await api("LIKE_BLOG", { id });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this story?")) {
      setBlogs(blogs.filter((b: any) => b.id !== id));
      if (activePost?.id === id) setViewMode('feed');
      await api("DELETE_BLOG", { id });
    }
  };

  const filtered = blogs.filter((b: any) => 
    b.title?.toLowerCase().includes(search.toLowerCase()) || 
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-40 min-h-screen">
       {viewMode === 'editor' && (
          createPortal(<BlogEditor onClose={() => setViewMode('feed')} onPublish={handlePublish} userName={userName} />, document.body)
       )}
       
       {viewMode === 'reading' && activePost && (
          createPortal(<BlogReader post={activePost} onClose={() => setViewMode('feed')} onLike={handleLike} onDelete={handleDelete} currentUserId={userHandle} />, document.body)
       )}

       {/* FEED HEADER */}
       <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-12 pt-4 sticky top-0 bg-[#FCFCFC]/90 backdrop-blur-md z-30 px-2 md:px-0">
          <div className="space-y-3">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Executive Narratives</p>
             <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-none">The <span className="text-emerald-500">Insights.</span></h2>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80 group">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"/>
                <input className="w-full bg-white border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 font-bold text-xs uppercase tracking-widest outline-none focus:border-emerald-300 transition-all shadow-sm" placeholder="Filter..." value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             {userProfile?.email === ADMIN_EMAIL && (
                <button onClick={() => setViewMode('editor')} className="bg-slate-900 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-2 whitespace-nowrap">
                   <Plus size={16}/> New Story
                </button>
             )}
          </div>
       </div>

       {/* FEED CONTENT */}
       <div className="max-w-4xl mx-auto space-y-24">
          {filtered.length === 0 ? (
            <div className="py-40 text-center opacity-50">
               <p className="font-black uppercase text-xs tracking-[0.4em] text-slate-300">Awaiting Primary Transmission...</p>
            </div>
          ) : filtered.map((post: any) => (
            <article key={post.id} onClick={() => { setActivePost(post); setViewMode('reading'); }} className="group cursor-pointer">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">{post.author?.charAt(0)}</div>
                  <p className="text-xs font-black uppercase text-slate-900 tracking-widest">{post.author}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.timestamp}</span>
               </div>
               <div className="space-y-6">
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9] group-hover:text-emerald-600 transition-colors">{post.title}</h3>
                  {post.coverImage && <img src={post.coverImage} className="w-full aspect-[2/1] object-cover rounded-[30px] shadow-lg group-hover:shadow-2xl transition-all" />}
                  <p className="text-slate-500 font-serif text-lg leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content?.replace(/<[^>]+>/g, '') || '' }} />
                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                     Read Story <ArrowLeft className="rotate-180" size={14}/>
                  </div>
               </div>
            </article>
          ))}
       </div>
    </div>
  );
};