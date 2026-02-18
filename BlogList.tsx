import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Plus, Trash2, Calendar, Clock, Loader2, TrendingUp } from 'lucide-react';
import { supabase } from './supabaseClient';
import { createPortal } from 'react-dom';
import DOMPurify from 'dompurify';

const ADMIN_EMAIL = 'jajdn777@gmail.com';

const BlogReaderModal = ({ post, onClose }: { post: any, onClose: () => void }) => {
  const sanitizedContent = useMemo(() => DOMPurify.sanitize(post.content), [post.content]);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <button
            onClick={onClose}
            className="fixed top-6 right-6 p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-50"
          >
             <Plus className="rotate-45" size={24} />
          </button>

          <div className="space-y-8">
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {post.category || 'Article'}
                   </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                   {post.title}
                </h1>
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 overflow-hidden">
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
         .blog-content > p:first-of-type::first-letter {
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 9;
  const observer = useRef<IntersectionObserver | null>(null);

  const lastBlogElementRef = useCallback((node: HTMLElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchBlogs = async (pageToFetch: number, searchTerm: string) => {
    try {
      if (pageToFetch === 0) setLoading(true);
      else setLoadingMore(true);

      const start = pageToFetch * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('blogs')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      const processed = (data || []).map((blog: any) => {
        const wordCount = blog.content ? blog.content.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
        const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;
        return { ...blog, readTime };
      });

      setBlogs(prev => pageToFetch === 0 ? processed : [...prev, ...processed]);
      setHasMore(processed.length === PAGE_SIZE);
    } catch (e) {
      console.error("Error fetching blogs:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchBlogs(0, search);
  }, [search]);

  useEffect(() => {
    if (page > 0) {
      fetchBlogs(page, search);
    }
  }, [page]);

  const extractThumbnail = (html: string) => {
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  const extractSnippet = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const captions = temp.querySelectorAll('figcaption');
    captions.forEach(c => c.remove());
    return temp.textContent?.substring(0, 160) + '...' || '';
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this story?")) return;
    
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
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" />
                Algorithmic Feed for the elite
             </p>
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

       {loading && blogs.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Generating Feed...</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 px-4 md:px-0">
            {blogs.map((post: any, index: number) => {
               const thumbnail = post.cover_image || extractThumbnail(post.content);
               const snippet = extractSnippet(post.content);
               const dateStr = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
               
               const isLastElement = index === blogs.length - 1;
               const isFeatured = index === 0 && page === 0 && !search;

               return (
                  <article
                    key={post.id}
                    ref={isLastElement ? lastBlogElementRef : null}
                    onClick={() => setActivePost(post)}
                    className={`group cursor-pointer flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${isFeatured ? "md:col-span-2 lg:col-span-2" : ""}`}
                    style={{ animationDelay: `${(index % 9) * 100}ms` }}
                  >
                     <div className={`${isFeatured ? "aspect-[21/9]" : "aspect-[16/9]"} bg-slate-100 rounded-[24px] md:rounded-[32px] overflow-hidden relative shadow-sm border border-slate-100 group-hover:shadow-2xl transition-all duration-700 group-hover:-translate-y-1`}>
                        {thumbnail ? (
                           <img src={thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                              <span className="text-4xl font-black uppercase tracking-tighter opacity-20">MEHRI</span>
                           </div>
                        )}
                        
                        <div className="absolute top-6 left-6 flex gap-2">
                           <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm">
                              {post.category || 'Article'}
                           </span>
                           {isFeatured && (
                             <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                                Featured
                             </span>
                           )}
                        </div>

                        {userProfile?.email === ADMIN_EMAIL && (
                           <button onClick={(e) => handleDelete(e, post.id)} className="absolute top-6 right-6 p-2 bg-white/90 rounded-full text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16}/>
                           </button>
                        )}
                     </div>

                     <div className="space-y-4 px-2">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                           <span className="flex items-center gap-1.5"><Calendar size={12}/> {dateStr}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"/>
                           <span className="flex items-center gap-1.5"><Clock size={12}/> {post.readTime}</span>
                           {post.likes_count > 0 && (
                             <>
                               <span className="w-1 h-1 bg-slate-200 rounded-full"/>
                               <span className="flex items-center gap-1.5 text-emerald-500"><TrendingUp size={12}/> {post.likes_count} LIKES</span>
                             </>
                           )}
                        </div>
                        
                        <h3 className={`font-black uppercase tracking-tight text-slate-900 leading-[1.1] group-hover:text-emerald-600 transition-colors line-clamp-2 ${isFeatured ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}`}>
                           {post.title}
                        </h3>
                        
                        <p className={`text-slate-500 font-serif leading-relaxed line-clamp-2 ${isFeatured ? "text-lg md:text-xl" : "text-sm md:text-base"}`}>
                           {snippet}
                        </p>
                        
                        <div className="pt-2">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 border-b-2 border-emerald-400 pb-1 group-hover:border-slate-900 transition-all">
                              Deep Dive
                           </span>
                        </div>
                     </div>
                  </article>
               );
            })}
         </div>
       )}

       {loadingMore && (
         <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Curating more insights...</p>
         </div>
       )}

       {!hasMore && blogs.length > 0 && (
          <div className="text-center py-32 border-t border-slate-50 mt-20">
             <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                <TrendingUp size={24} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.4em]">You are fully briefed</p>
             <p className="text-slate-300 text-xs mt-2">Return later for fresh transmissions</p>
          </div>
       )}
    </div>
  );
};
