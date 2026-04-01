import React, { useState, useEffect } from 'react';
import { api, getUserCache } from './utils.ts';
import { Users, FileText, Radio, BarChart3, X, Search, Trash2, Edit3, Download, RefreshCw, AlertTriangle, ShieldCheck, Activity, Lock, Eye, EyeOff, Menu } from 'lucide-react';
import { ADMIN_EMAIL } from './constants.ts';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex flex-col justify-between h-32 hover:border-[#A7F3D0]/30 transition-colors">
    <div className="flex justify-between items-start">
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
      <div className={`p-2 rounded-full ${color} bg-opacity-20`}>
        <Icon size={16} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
  </div>
);

export const AdminView = ({ onClose, adminEmail, currentBlogs = [], currentWorkouts = [], currentUser }: any) => {
  const [activeTab, setActiveTab] = useState<'users' | 'blogs' | 'broadcast' | 'stats'>('users');
  const [data, setData] = useState<{ users: any[], blogs: any[], workouts: any[], goals: any[] }>({ 
    users: [], 
    blogs: [], 
    workouts: [],
    goals: []
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security Check - Validates against centralized admin email
  if (adminEmail !== ADMIN_EMAIL) {
    return (
      <div className="fixed inset-0 z-[9999] bg-red-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <AlertTriangle size={64} className="mx-auto" />
          <h1 className="text-4xl font-black uppercase">Access Denied</h1>
          <p className="text-white/50">This terminal is restricted to Level 5 Admin.</p>
          <button onClick={onClose} className="bg-white text-red-900 px-8 py-3 rounded-full font-bold">Exit</button>
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api("ADMIN_GET_ALL", { adminEmail: ADMIN_EMAIL });
      
      if (res && res.data) {
        setData({
          users: res.data.users || [],
          blogs: res.data.blogs || [],
          workouts: res.data.workouts || [],
          goals: res.data.goals || []
        });
      } else {
          console.error("Admin Data Fetch returned empty or invalid response", res);
      }
    } catch (e) {
       console.error("Admin Fetch Error", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    await api("ADMIN_UPDATE_USER", { 
      adminEmail: ADMIN_EMAIL, 
      targetUsername: editingUser.username, 
      updates: {
        name: editingUser.full_name || editingUser.name,
        weight: editingUser.weight,
        height: editingUser.height
      }
    });
    setEditingUser(null);
    fetchData(); // Refresh
  };

  const handleDeleteUser = async (targetUsername: string) => {
    if (confirm("WARNING: This will permanently delete the user and ALL their data (workouts, goals, etc). Continue?")) {
      setLoading(true);
      await api("ADMIN_DELETE_USER", { adminEmail: ADMIN_EMAIL, targetUsername });
      fetchData();
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (confirm("Delete this blog post?")) {
      setLoading(true);
      await api("ADMIN_DELETE_BLOG", { adminEmail: ADMIN_EMAIL, blogId });
      // Optimistic update
      setData(prev => ({...prev, blogs: prev.blogs.filter(b => b.id !== blogId)}));
      fetchData();
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    if (confirm(`Post system announcement to all users?`)) {
      setLoading(true);
      await api("ADMIN_BROADCAST", { adminEmail: ADMIN_EMAIL, message: broadcastMsg });
      setBroadcastMsg('');
      alert("Announcement Posted Successfully.");
      setLoading(false);
      fetchData(); // Refresh to see new blog post
    }
  };

  const exportCSV = () => {
    const headers = ["Username", "Email", "Name", "Join Date", "Total Workouts", "Weight", "Height"];
    const rows = data.users.map(u => {
        return [
            u.username,
            u.email,
            u.full_name || 'N/A',
            u.join_date || 'N/A',
            data.workouts.filter(w => w.user_id === u.id).length, 
            u.weight || 'N/A',
            u.height || 'N/A'
        ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mehri_master_database.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredUsers = data.users.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9000] bg-slate-950 text-slate-200 font-sans flex flex-col animate-fade-in overflow-hidden">
      
      {/* HEADER */}
      <div className="h-20 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-900/50 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-slate-400 hover:text-white p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
             <Menu size={20}/>
          </button>
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-[#A7F3D0] border border-[#A7F3D0]/20 shadow-[0_0_15px_rgba(167,243,208,0.1)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Command Center</h2>
            <p className="text-[10px] font-bold text-[#A7F3D0] uppercase tracking-[0.3em]">Administrator: shamsullah.mehri</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white" title="Refresh Data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
          </button>
          <button onClick={onClose} className="p-2 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR OVERLAY FOR MOBILE */}
        {sidebarOpen && <div className="absolute inset-0 bg-black/50 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <div className={`absolute md:relative top-0 bottom-0 left-0 w-64 border-r border-slate-800 bg-slate-900 flex flex-col p-4 gap-2 z-20 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {[
            { id: 'users', label: 'User Database', icon: Users },
            { id: 'blogs', label: 'Content Control', icon: FileText },
            { id: 'broadcast', label: 'Broadcast Hub', icon: Radio },
            { id: 'stats', label: 'Global Analytics', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#A7F3D0] text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <tab.icon size={18} />
              <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-auto">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-x-1/2 text-slate-500" />
                  <input 
                    className="bg-slate-900 border border-slate-800 rounded-full pl-10 pr-6 py-3 text-sm text-white focus:border-[#A7F3D0] focus:ring-1 focus:ring-[#A7F3D0] outline-none w-full md:w-80 placeholder:text-slate-600"
                    placeholder="Search by email, user, name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-bold uppercase tracking-wider w-full md:w-auto justify-center">
                  <Download size={14} /> Full DB Export
                </button>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-800/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bio-Metrics</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => {
                      return (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{user.username}</span>
                              <span className="text-[10px] text-slate-500">Joined: {user.join_date ? new Date(user.join_date).toLocaleDateString() : 'Unknown'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col space-y-1">
                              <span className="text-slate-300 text-xs font-mono">{user.email}</span>
                              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500/50">
                                 <Lock size={10} />
                                 <span>Secured</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                           {user.height || '?'}cm / {user.weight || '?'}kg
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                           {user.city || 'Unknown'}, {user.state || ''}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => setEditingUser(user)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"><Edit3 size={16}/></button>
                          <button onClick={() => handleDeleteUser(user.username)} className="p-2 rounded-lg hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EDIT USER MODAL */}
          {editingUser && (
            <div className="fixed inset-0 z-[9100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase text-white">Edit User</h3>
                  <button onClick={() => setEditingUser(null)}><X className="text-slate-500 hover:text-white"/></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Username (ID)</label>
                    <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 focus:border-slate-700 outline-none cursor-not-allowed" value={editingUser.username} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Full Name</label>
                    <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#A7F3D0] outline-none" value={editingUser.full_name || editingUser.name || ''} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Weight (kg)</label>
                      <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#A7F3D0] outline-none" value={editingUser.weight || ''} onChange={e => setEditingUser({...editingUser, weight: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Height (cm)</label>
                      <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#A7F3D0] outline-none" value={editingUser.height || ''} onChange={e => setEditingUser({...editingUser, height: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button onClick={handleUpdateUser} className="w-full bg-[#A7F3D0] text-slate-900 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-colors">Force Update</button>
              </div>
            </div>
          )}

          {/* BLOGS TAB */}
          {activeTab === 'blogs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.blogs.length === 0 ? <p className="text-slate-500 italic">No blogs found in database.</p> : data.blogs.map((blog: any) => (
                <div key={blog.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 group hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-[#A7F3D0] text-[10px] font-black uppercase tracking-widest bg-emerald-900/30 px-2 py-1 rounded">{blog.category}</span>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{blog.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">by {blog.author_name} (ID: {blog.user_id})</p>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content?.replace(/<[^>]+>/g, '') || '' }} />
                </div>
              ))}
            </div>
          )}

          {/* BROADCAST TAB */}
          {activeTab === 'broadcast' && (
            <div className="flex flex-col h-full max-w-2xl mx-auto justify-center space-y-8">
              <div className="text-center space-y-2">
                <Radio size={48} className="text-[#A7F3D0] mx-auto mb-4" />
                <h3 className="text-3xl font-black uppercase text-white">Global Broadcast</h3>
                <p className="text-slate-400">Send a system-wide announcement to all registered users. This will appear in their blog feed.</p>
              </div>
              <textarea 
                className="w-full h-40 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white placeholder:text-slate-600 focus:border-[#A7F3D0] outline-none resize-none font-mono text-sm"
                placeholder="Enter system message..."
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
              />
              <button onClick={handleBroadcast} disabled={!broadcastMsg.trim()} className="bg-[#A7F3D0] text-slate-900 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Transmit Signal
              </button>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Users" value={data.users.length} icon={Users} color="bg-blue-500" />
                <StatCard label="Total Blogs" value={data.blogs.length} icon={FileText} color="bg-purple-500" />
                <StatCard label="Workouts Logged" value={data.workouts.length} icon={Activity} color="bg-emerald-500" />
                <StatCard label="Active Goals" value={data.goals.length} icon={ShieldCheck} color="bg-orange-500" />
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-lg font-black uppercase text-white mb-6">Recent Activity Feed</h3>
                <div className="space-y-4">
                  {data.workouts.slice(-8).reverse().map((w, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{w.type.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-white">{w.type} <span className="text-slate-500 text-xs">by User #{w.user_id?.substring(0,6)}</span></p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{w.date} • {w.calories} kcal</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#A7F3D0] font-mono">{w.distance} km</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};