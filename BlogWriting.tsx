
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Search, Plus, X, 
  Bold, Italic, Quote, Link as LinkIcon,
  Video, Camera, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from './supabaseClient.ts';
import { ADMIN_EMAIL } from './constants.ts';

// Safely access env with fallback
const env = (import.meta as any).env || {};
const UNSPLASH_ACCESS_KEY = env.VITE_UNSPLASH_ACCESS_KEY || '1d9v_ms8MN4-yNNluvqVEu-xB679PBMYlkhPkv-6koU';

export const BlogWriting = ({ onClose, userName, userProfile }: any) => {
  const [title, setTitle] = useState('');
  
  // Unsplash State
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  
  // Toolbar State
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, h2: false, h3: false, quote: false });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Side Menu State (+ Button)
  const [sideMenuPos, setSideMenuPos] = useState<number | null>(null); 
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const savedRange = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Check
  if (userProfile?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Restricted Access</h1>
          <p className="mt-2 text-slate-500 font-bold uppercase tracking-widest text-xs">Executive Clearance Required</p>
          <button onClick={onClose} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-bold uppercase text-xs tracking-widest">Return to Feed</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Load Draft
    const savedContent = localStorage.getItem('mehri_draft_content');
    const savedTitle = localStorage.getItem('mehri_draft_title');
    if (editorRef.current && savedContent) editorRef.current.innerHTML = savedContent;
    if (savedTitle) {
        setTitle(savedTitle);
        setTimeout(autoResizeTitle, 100);
    }
    
    document.body.style.overflow = 'hidden';
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => { 
        document.body.style.overflow = 'unset';
        document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const autoResizeTitle = () => {
    if (titleRef.current) {
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed || !editorRef.current?.contains(selection.anchorNode)) {
      setShowToolbar(false);
      setShowLinkInput(false);
    } else {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        h2: document.queryCommandValue('formatBlock') === 'h2',
        h3: document.queryCommandValue('formatBlock') === 'h3',
        quote: document.queryCommandValue('formatBlock') === 'blockquote',
      });

      setToolbarPos({
        top: rect.top - 50,
        left: rect.left + (rect.width / 2)
      });
      setShowToolbar(true);
    }

    if (selection && selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
      const anchorNode = selection.anchorNode;
      let parentBlock = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode as HTMLElement;
      
      while (parentBlock && parentBlock.parentElement !== editorRef.current) {
         parentBlock = parentBlock.parentElement as HTMLElement;
      }

      if (parentBlock && (parentBlock.innerText === '\n' || parentBlock.innerText === '' || parentBlock.innerHTML === '<br>')) {
         const rect = parentBlock.getBoundingClientRect();
         setSideMenuPos(rect.top); 
      } else {
         setSideMenuPos(null);
         setIsSideMenuExpanded(false);
         setShowVideoInput(false);
      }
    }
  };

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        savedRange.current = selection.getRangeAt(0);
    }
  };

  const restoreCursorPosition = () => {
      if (savedRange.current) {
          const selection = window.getSelection();
          if (selection) {
              selection.removeAllRanges();
              selection.addRange(savedRange.current);
          }
      } else {
          editorRef.current?.focus();
      }
  };

  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    saveDraft();
    handleSelectionChange(); 
  };

  const toggleBlock = (tag: string) => {
    const currentTag = document.queryCommandValue('formatBlock');
    if (currentTag === tag) {
      exec('formatBlock', 'p'); 
    } else {
      exec('formatBlock', tag);
    }
  };

  const applyLink = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      restoreCursorPosition();
      exec('createLink', linkUrl);
      setShowLinkInput(false);
      setLinkUrl('');
      setShowToolbar(false);
    }
  };

  const saveDraft = () => {
    if (editorRef.current) localStorage.setItem('mehri_draft_content', editorRef.current.innerHTML);
    localStorage.setItem('mehri_draft_title', title);
  };

  const insertHtmlAtCaret = (html: string) => {
    restoreCursorPosition();
    document.execCommand('insertHTML', false, html);
    setSideMenuPos(null);
    setIsSideMenuExpanded(false);
    setShowVideoInput(false);
    saveDraft();
  };

  const insertImage = (url: string) => {
    const html = `
      <figure contenteditable="false" style="margin: 2em 0 1.5em; width: 100%;">
        <img src="${url}" style="width: 100%; border-radius: 4px; display: block;" loading="lazy" />
        <figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-family: sans-serif;" contenteditable="true">Type caption for image (optional)</figcaption>
      </figure>
      <p><br></p>
    `;
    insertHtmlAtCaret(html);
    setIsSideBarOpen(false);
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) insertImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleYouTubeEmbed = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = videoUrl.match(regExp);
        
        if (match && match[2].length === 11) {
            const embedUrl = `//www.youtube.com/embed/${match[2]}`;
            const html = `
              <figure contenteditable="false" style="margin: 2em 0 1.5em; width: 100%;">
                 <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 4px;">
                    <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>
                 </div>
                 <figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-family: sans-serif;" contenteditable="true">Video caption (optional)</figcaption>
              </figure>
              <p><br></p>
            `;
            insertHtmlAtCaret(html);
        } else {
            alert("Invalid YouTube URL");
        }
        setVideoUrl('');
    }
  };

  const searchUnsplash = async (pageNum: number) => {
    if (!query) return;
    setLoadingImages(true);
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?page=${pageNum}&per_page=12&query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
      const data = await res.json();
      setImages(data.results || []);
      setPage(pageNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingImages(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !editorRef.current) { alert("Content missing."); return; }
    
    setIsPublishing(true);
    const content = editorRef.current.innerHTML;
    const author_name = 'Mehri Group';

    try {
        const { error } = await supabase.from('blogs').insert([{
            title: title.toUpperCase(),
            content: content,
            author_name: author_name
        }]);

        if (error) throw error;

        localStorage.removeItem('mehri_draft_content');
        localStorage.removeItem('mehri_draft_title');
        
        onClose();
    } catch (err: any) {
        console.error('Publishing failed:', err);
        alert('Failed to publish: ' + err.message);
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex font-sans text-slate-900">
      
      {/* 1. FLOATING FORMAT TOOLBAR */}
      {showToolbar && (
        <div 
            className="fixed z-[10000] bg-slate-900 text-white rounded-md shadow-2xl flex items-center px-1 py-1 gap-0.5 animate-scale-in -translate-x-1/2 transition-all duration-200"
            style={{ top: toolbarPos.top, left: toolbarPos.left }}
            onMouseDown={(e) => e.preventDefault()} 
        >
            {showLinkInput ? (
                <div className="flex items-center px-2 py-1">
                    <input 
                        className="bg-transparent border-none text-white text-xs outline-none placeholder:text-slate-500 w-40"
                        placeholder="Paste link and press Enter..."
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={applyLink}
                        autoFocus
                    />
                    <button onClick={() => setShowLinkInput(false)} className="text-slate-400 hover:text-white ml-2"><X size={14}/></button>
                </div>
            ) : (
                <>
                    <button onClick={() => exec('bold')} className={`p-2 hover:text-emerald-400 transition-colors ${activeFormats.bold ? 'text-emerald-400' : 'text-white'}`}><Bold size={16}/></button>
                    <button onClick={() => exec('italic')} className={`p-2 hover:text-emerald-400 transition-colors ${activeFormats.italic ? 'text-emerald-400' : 'text-white'}`}><Italic size={16}/></button>
                    <div className="w-px h-4 bg-white/20 mx-1"/>
                    <button onClick={() => toggleBlock('H2')} className={`p-2 hover:text-emerald-400 transition-colors text-sm font-black ${activeFormats.h2 ? 'text-emerald-400' : 'text-white'}`}>T</button>
                    <button onClick={() => toggleBlock('H3')} className={`p-2 hover:text-emerald-400 transition-colors text-xs font-black ${activeFormats.h3 ? 'text-emerald-400' : 'text-white'}`}>t</button>
                    <div className="w-px h-4 bg-white/20 mx-1"/>
                    <button onClick={() => toggleBlock('blockquote')} className={`p-2 hover:text-emerald-400 transition-colors ${activeFormats.quote ? 'text-emerald-400' : 'text-white'}`}><Quote size={16}/></button>
                    <button onClick={() => { setShowLinkInput(true); }} className="p-2 hover:text-emerald-400 transition-colors"><LinkIcon size={16}/></button>
                </>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}

      {/* 2. SIDE MENU (PLUS BUTTON) */}
      {sideMenuPos !== null && (
         <div 
            className="absolute left-[calc(50%-380px)] z-[5000] flex items-center gap-2 transition-all duration-300"
            style={{ top: sideMenuPos - 6 }} 
         >
            <button 
                onClick={() => setIsSideMenuExpanded(!isSideMenuExpanded)} 
                className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all ${isSideMenuExpanded ? 'rotate-45 border-slate-900 text-slate-900' : ''}`}
            >
                <Plus size={18} />
            </button>

            {isSideMenuExpanded && (
                <div className="flex items-center gap-3 animate-fade-in-right origin-left">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 bg-white shadow-sm" title="Upload Image">
                        <Camera size={18}/>
                    </button>
                    <button onClick={() => { setIsSideBarOpen(true); saveCursorPosition(); }} className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 bg-white shadow-sm" title="Unsplash">
                        <Search size={18}/>
                    </button>
                    <button onClick={() => { setShowVideoInput(true); setIsSideMenuExpanded(false); }} className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 bg-white shadow-sm" title="Embed Video">
                        <Video size={18}/>
                    </button>
                </div>
            )}

            {showVideoInput && (
                <div className="absolute left-12 bg-white border border-slate-200 rounded-lg shadow-xl p-1 flex items-center animate-fade-in">
                    <input 
                        className="p-2 text-xs w-60 outline-none" 
                        placeholder="Paste YouTube URL and enter..." 
                        value={videoUrl} 
                        onChange={e => setVideoUrl(e.target.value)}
                        onKeyDown={handleYouTubeEmbed}
                        autoFocus 
                    />
                    <button onClick={() => setShowVideoInput(false)} className="p-1 hover:bg-slate-100 rounded"><X size={14}/></button>
                </div>
            )}
         </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLocalImageUpload} />

      {/* LEFT: EDITOR CANVAS */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar bg-white">
        
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur flex justify-between items-center px-6 py-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                <ArrowLeft size={24}/>
            </button>
            <div className="flex items-center gap-4">
                <button 
                  onClick={handlePublish} 
                  disabled={isPublishing}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPublishing && <Loader2 size={12} className="animate-spin"/>} Publish
                </button>
            </div>
        </div>

        <div className="w-full max-w-[740px] mx-auto px-6 pb-40 mt-10">
           <textarea 
             ref={titleRef}
             value={title}
             onChange={(e) => { setTitle(e.target.value); autoResizeTitle(); saveDraft(); }}
             className="w-full text-4xl md:text-[42px] font-black text-slate-900 placeholder:text-slate-300 outline-none border-none bg-transparent resize-none overflow-hidden leading-tight mb-8 font-sans tracking-tight"
             placeholder="Title"
             rows={1}
           />
           <div 
             ref={editorRef}
             contentEditable 
             className="editor-content outline-none empty:before:content-['Tell_your_story...'] empty:before:text-slate-300 empty:before:absolute relative min-h-[300px]"
             onInput={saveDraft}
             onMouseUp={() => { saveCursorPosition(); handleSelectionChange(); }}
             onKeyUp={() => { saveCursorPosition(); handleSelectionChange(); }}
           />
        </div>
      </div>

      {/* RIGHT: ASSET BROWSER */}
      <div className={`fixed top-0 right-0 bottom-0 w-[350px] bg-white border-l border-slate-100 shadow-2xl transform transition-transform duration-300 z-[6000] flex flex-col ${isSideBarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Unsplash Library</h3>
              <button onClick={() => setIsSideBarOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={20}/></button>
           </div>
           
           <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                 <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-emerald-500 transition-colors"
                   placeholder="Search..."
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && searchUnsplash(1)}
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loadingImages ? (
                 <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"/></div>
              ) : (
                 <div className="grid grid-cols-2 gap-3">
                    {images.map((img: any) => (
                       <button key={img.id} onClick={() => insertImage(img.urls.regular)} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100">
                          <img src={img.urls.small} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Plus size={24} className="text-white"/>
                          </div>
                       </button>
                    ))}
                 </div>
              )}
              
              {images.length > 0 && (
                 <div className="flex justify-center gap-4 mt-6 pb-6">
                    <button onClick={() => searchUnsplash(page - 1)} disabled={page === 1} className="p-2 bg-white border border-slate-200 rounded-full disabled:opacity-50 hover:border-emerald-500 transition-colors"><ChevronLeft size={16}/></button>
                    <span className="self-center text-xs font-bold text-slate-400">Page {page}</span>
                    <button onClick={() => searchUnsplash(page + 1)} className="p-2 bg-white border border-slate-200 rounded-full hover:border-emerald-500 transition-colors"><ChevronRight size={16}/></button>
                 </div>
              )}
           </div>
      </div>

      <style>{`
         .editor-content {
            font-family: 'Charter', 'Georgia', 'Times New Roman', serif;
            font-size: 21px;
            line-height: 1.58;
            letter-spacing: -0.003em;
            color: rgba(0, 0, 0, 0.84);
         }
         
         .editor-content > p:first-of-type::first-letter {
            float: left;
            font-size: 68px;
            line-height: 60px;
            padding-top: 4px;
            padding-right: 8px;
            padding-left: 3px;
            font-weight: 900;
            font-family: 'Space Grotesk', sans-serif;
            color: #111827;
         }

         .editor-content p { margin-bottom: 24px; }
         .editor-content h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; margin-top: 56px; margin-bottom: 12px; line-height: 1.1; letter-spacing: -0.02em; color: #111827; }
         .editor-content h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 26px; margin-top: 38px; margin-bottom: 10px; line-height: 1.2; color: #1f2937; }
         .editor-content blockquote { border-left: 3px solid #10b981; padding-left: 20px; margin: 30px 0; font-style: italic; font-size: 24px; color: #374151; }
         .editor-content a { color: inherit; text-decoration: underline; text-decoration-color: #10b981; text-underline-offset: 4px; cursor: pointer; }
         .editor-content figure { margin: 2.5em 0 1.5em; }
         .editor-content figcaption:empty:before { content: "Type caption for image (optional)"; color: #d1d5db; }

         @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, 10px) scale(0.9); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
         @keyframes fadeInRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
         .animate-fade-in-right { animation: fadeInRight 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};