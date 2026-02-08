
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowRight, Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient.ts';
import { createPortal } from 'react-dom';
import DOMPurify from 'dompurify';
import { ADMIN_EMAIL } from './constants.ts';

const BlogReaderModal = ({ post, onClose }: any) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Sanitize content before rendering
  const sanitizedContent = useMemo(() => DOMPurify.sanitize(post.content), [post.content]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto animate-fade-in font-sans text-slate-900">
       <div className="max-w-[740px] mx-auto bg-white min-h-screen relative pb-40">
          <button onClick={onClose} className="fixed top-6 right-6 md:right-12 z-50 p-3 bg-white/80 backdrop-blur hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900 border border-slate-100 shadow-sm">
             <ArrowRight size={24} className="rotate-180 md:rotate-0" />
          </button>

          <div className="px-6 md:px-0 pt-32 pb-20">
             <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 font-serif">
                   {post.title}
                </h1>
                
                <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-4">
                   <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {post.author_name?.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{post.author_name}</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest">
                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {post.readTime}
                      </p>
                   </div>
                </div>
             </div>

             <div 
               className="blog-content"
               dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
             />
          </div>
       </div>
       <style>{`
         .blog-content {
            font-family: 'Charter', 'Georgia', 'Times New Roman', serif;
            font-size: 21px;
            line-height: 1.58;
            letter-spacing: -0.003em;
            color: rgba(0, 0, 0, 0.84);
         }
         .blog-content p { margin-bottom: 24px; }
         .blog-content p:first-of-type::first-letter {
            float: left;
            font-size: 72px;
            line-height: 60px;
            padding-top: 4px;
            padding-right: 8px;
            padding-left: 3px;
            font-weight: 900;
            font-family: 'Space Grotesk', sans-serif;
            color: #111827;
         }
         .blog-content h2 { 
            font-family: 'Space Grotesk', sans-serif; 
            font-weight: 800; font-size: 30px; margin-top: 48px; margin-bottom: 10px; line-height: 1.1; color: #111827;
         }
         .blog-content h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; margin-top: 32px; margin-bottom: 8px; }
         .blog-content blockquote { border-left: 3px solid #10b981; padding-left: 20px; margin: 32px 0; font-style: italic; color: #374151; font-size: 24px; }
         .blog-content img { width: 100%; border-radius: 4px; margin-top: 32px; margin-bottom: 12px; }
         .blog-content figcaption { text-align: center; color: #6b7280; font-size: 14px; font-family: sans-serif; margin-bottom: 32px; }
         .blog-content a { color: inherit; text-decoration: underline; text-decoration-color: #10b981; text-underline-offset: 4px; cursor: pointer; }
       `}</style>
    </div>,
    document.body
  );
};

export const BlogList = ({ userProfile, onNavigate, onDelete }: any) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activePost, setActivePost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Process blogs to add readTime
      const processed = (data || []).map((blog: any) => {
        const wordCount = blog.content ? blog.content.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
        const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;
        return { ...blog, readTime };
      });

      setBlogs(processed);
    } catch (e) {
      console.error("Error fetching blogs:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return blogs.filter((b: any) => 
       b.title?.toLowerCase().includes(search.toLowerCase()) || 
       b.author_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [blogs, search]);

  const extractThumbnail = (html: string) => {
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  const extractSnippet = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const captions = temp.querySelectorAll('figcaption');
    captions.forEach(c => c.remove());
    return temp.textContent?.substring(0, 140) + '...' || '';
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this story?")) return;
    
    // Delegate to parent handler if provided (allows centralized logic in index.tsx)
    if (onDelete) {
        await onDelete(id);
        setBlogs(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="animate-fade-in min-h-screen pb-32">
       {activePost && <BlogReaderModal post={activePost} onClose={() => setActivePost(null)} />}

       <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-slate-100 pb-8 px-4 md:px-0 sticky top-24 md:static bg-white/95 z-40 md:bg-transparent">
          <div className="space-y-2">
             <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">The Insights</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Knowledge for the elite</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-full pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-slate-300 transition-colors"
                  placeholder="Search articles..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             {userProfile?.email === ADMIN_EMAIL && (
                <button onClick={() => onNavigate('write')} className="bg-slate-900 text-white p-3 rounded-full hover:bg-emerald-500 transition-colors shadow-lg">
                   <Plus size={20}/>
                </button>
             )}
          </div>
       </div>

       {loading ? (
         <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">
            Loading Feed...
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
            {filtered.map((post: any) => {
               // Prioritize database column 'cover_image' if it exists (schema varying), else extract
               const thumbnail = post.cover_image || extractThumbnail(post.content);
               const snippet = extractSnippet(post.content);
               const dateStr = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
               
               return (
                  <article key={post.id} onClick={() => setActivePost(post)} className="group cursor-pointer flex flex-col gap-4">
                     <div className="aspect-[16/9] bg-slate-100 rounded-[20px] overflow-hidden relative shadow-sm border border-slate-100 group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                        {thumbnail ? (
                           <img src={thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                              <span className="text-4xl font-black uppercase tracking-tighter opacity-20">MEHRI</span>
                           </div>
                        )}
                        
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm">
                              {post.category || 'Article'}
                           </span>
                        </div>

                        {userProfile?.email === ADMIN_EMAIL && (
                           <button onClick={(e) => handleDelete(e, post.id)} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16}/>
                           </button>
                        )}
                     </div>

                     <div className="space-y-3 px-1">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1"><Calendar size={12}/> {dateStr}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full"/>
                           <span className="flex items-center gap-1"><Clock size={12}/> {post.readTime}</span>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 leading-[1.1] group-hover:text-emerald-600 transition-colors line-clamp-2">
                           {post.title}
                        </h3>
                        
                        <p className="text-sm text-slate-500 font-serif leading-relaxed line-clamp-2">
                           {snippet}
                        </p>
                        
                        <div className="pt-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-emerald-400 pb-0.5 group-hover:border-slate-900 transition-all">
                              Read Story
                           </span>
                        </div>
                     </div>
                  </article>
               );
            })}
         </div>
       )}
    </div>
  );
};