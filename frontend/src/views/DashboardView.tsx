import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    Play, 
    Loader2, 
    Trash2, 
    Search, 
    Zap, 
    ArrowRight, 
    Clock, 
    Layers,
    Plus,
    Youtube,
    Edit3,
    Check,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardView: React.FC = () => {
    const { session } = useAuth();
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [quota, setQuota] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/notes/`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            setNotes(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Fetch Error:', err);
        } finally {
            setFetching(false);
        }
    };

    const fetchQuota = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/quotas/me/`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            setQuota(res.data);
        } catch (err) {
            console.error('Quota Fetch Error:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            setProfile(res.data);
        } catch (err) {
            console.error('Profile Fetch Error:', err);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/jobs/`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            const active = res.data.filter((j: any) => j.status === 'running' || j.status === 'pending');
            setActiveJobs(active);
            
            // If any job just finished, refresh notes
            if (activeJobs.length > 0 && active.length < activeJobs.length) {
                fetchNotes();
                fetchQuota();
            }
        } catch (err) {
            console.error('Jobs Fetch Error:', err);
        }
    };

    useEffect(() => {
        if (session) {
            fetchNotes();
            fetchQuota();
            fetchJobs();
            fetchProfile();
        }
    }, [session]);

    // Polling for active jobs
    useEffect(() => {
        let interval: any;
        if (activeJobs.length > 0) {
            interval = setInterval(fetchJobs, 3000);
        }
        return () => clearInterval(interval);
    }, [activeJobs]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        const tid = toast.loading('Initiating neural extraction...', {
            className: 'glass-panel !bg-surface-elevated/90 !text-white'
        });

        try {
            await axios.post(`${API_BASE_URL}/notes/generate`, 
                { youtube_url: url, requested_style: 'standard' },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            toast.success('Extraction process queued.', { id: tid });
            setUrl('');
            fetchJobs(); // Trigger immediate poll
            fetchQuota(); // Refresh quota
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Processing failed.', { id: tid });
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm('Permanently delete this note?')) return;
        
        try {
            await axios.delete(`${API_BASE_URL}/notes/${id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            setNotes(notes.filter(n => n.id !== id));
            toast.success('Note deleted.');
        } catch (err) {
            toast.error('Deletion failed.');
        }
    };

    const startEditing = (note: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(note.id);
        setEditValue(note.video_title || 'Untitled Extraction');
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(null);
    };

    const saveTitle = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!editValue.trim()) return;

        setSavingId(id);
        try {
            await axios.patch(`${API_BASE_URL}/notes/${id}`, 
                { video_title: editValue.trim() },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            setNotes(notes.map(n => n.id === id ? { ...n, video_title: editValue.trim() } : n));
            setEditingId(null);
            toast.success('Title updated.');
        } catch (err) {
            toast.error('Update failed.');
        } finally {
            setSavingId(null);
        }
    };

    const filteredNotes = notes.filter(n => 
        (n.video_title || n.generated_title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAdmin = session?.user?.email === 'shrikanthbhukya03@gmail.com' || profile?.role === 'admin';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Hero Section */}
            <div className="mb-10 md:mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                >
                    <div className="lg:col-span-7">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-8 bg-primary/40" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Neural Workspace</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-6 leading-[1.1]">
                            Capture <span className="text-white/20">Knowledge.</span>
                            {isAdmin && (
                                <span className="inline-flex items-center gap-1.5 ml-4 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full align-middle">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">System Admin</span>
                                </span>
                            )}
                        </h1>
                        <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-lg font-medium">
                            Transform high-density YouTube content into structured insights. 
                            Your intelligent library for accelerated learning.
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                        <div className="p-6 glass-panel !bg-white/[0.01] !rounded-2xl border-white/[0.04] group hover:border-primary/20 transition-all duration-500">
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Layers size={14} className="text-primary" /> Library
                            </div>
                            <div className="text-3xl font-black tracking-tighter">{notes.length}</div>
                        </div>
                        <div className="p-6 glass-panel !bg-white/[0.01] !rounded-2xl border-white/[0.04] group hover:border-primary/20 transition-all duration-500">
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Zap size={14} className="text-primary" /> Usage
                            </div>
                            <div className="text-3xl font-black tracking-tighter">
                                {isAdmin ? (
                                    <span className="text-accent">∞</span>
                                ) : (
                                    quota ? (quota.daily_generation_limit - quota.daily_generation_count) : '0'
                                )}
                                <span className="text-[10px] text-white/10 font-bold ml-2 uppercase tracking-widest">
                                    {isAdmin ? 'Unlimited' : 'Left'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Input / Generator Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-16 md:mb-24"
            >
                <div className="glass-panel p-1 !rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border-white/[0.08] shadow-2xl">
                    <div className="bg-surface-elevated/20 p-4 md:p-6 !rounded-[1.4rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
                        
                        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-3 relative z-10">
                            <div className="relative flex-1">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors">
                                    <Youtube size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Paste YouTube video protocol..."
                                    className="premium-input w-full pl-14 pr-4 !py-4 !bg-black/40 text-base !rounded-xl border-white/5 focus:border-primary/30 transition-all"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button
                                disabled={loading || !url}
                                className="cta-primary w-full md:w-auto md:min-w-[200px] !rounded-xl !py-4 shadow-indigo-glow active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs"
                                title="Generate Note"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Analyzing Matrix...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} strokeWidth={3} />
                                        Initialize Extraction
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Library Section */}
            <div className="pb-32">
                
                {/* Active Jobs Section */}
                {activeJobs.length > 0 && (
                    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeJobs.map(job => (
                            <div key={job.id} className="premium-card p-6 !bg-primary/5 border-primary/20 flex flex-col gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-xl animate-pulse" />
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                        <Loader2 className="animate-spin" size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">Processing</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 truncate">Synchronizing Brain...</h3>
                                    <p className="text-white/20 text-xs truncate">{job.youtube_url}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Knowledge Library</h2>
                        <p className="text-white/20 text-sm">Your collection of processed insights and analysis.</p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search notes..." 
                            className="premium-input w-full pl-12 !py-2.5 !text-sm !bg-white/[0.01] !rounded-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="premium-card h-64 animate-pulse !bg-white/[0.01]" />
                        ))}
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 glass-panel !bg-white/[0.01] border-dashed border-white/[0.05] flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center justify-center mb-6 text-white/10">
                            <Layers size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No notes found</h3>
                        <p className="text-white/20 max-w-xs mx-auto text-sm">
                            {searchQuery ? "No results match your search query." : "Start by generating your first AI note from a YouTube video."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredNotes.map((note) => (
                                <motion.div 
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="group"
                                >
                                    <div className="premium-card p-6 aspect-[4/3] flex flex-col bg-surface-elevated/20 hover:bg-surface-elevated/40 transition-all duration-500 relative overflow-hidden group/card block cursor-default">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl group-hover/card:bg-primary/10 transition-all duration-700" />
                                        
                                        <div className="flex justify-between items-start mb-6 relative z-20">
                                            <Link to={`/notes/${note.id}`} className="h-10 w-10 bg-white/[0.03] border border-white/[0.04] rounded-xl flex items-center justify-center text-white/40 hover:bg-primary hover:text-white hover:border-primary/20 transition-all duration-500">
                                                <Play size={18} fill="currentColor" />
                                            </Link>
                                            <div className="flex gap-1">
                                                {editingId !== note.id && (
                                                    <button 
                                                        onClick={(e) => startEditing(note, e)} 
                                                        className="p-2 text-white/5 hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover/card:opacity-100"
                                                        title="Edit Title"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={(e) => deleteNote(note.id, e)} 
                                                    className="p-2 text-white/5 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover/card:opacity-100"
                                                    title="Delete Note"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 relative z-20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Analysis</span>
                                                <span className="text-white/10 text-[10px]">•</span>
                                                <span className="text-white/20 text-[10px] flex items-center gap-1 uppercase tracking-widest">
                                                    <Clock size={10} /> {new Date(note.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            {editingId === note.id ? (
                                                <div className="flex flex-col gap-3">
                                                    <input 
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full bg-white/[0.05] border border-primary/30 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-primary transition-all font-bold"
                                                        placeholder="Enter new insight title..."
                                                        title="Edit Note Title"
                                                        disabled={savingId === note.id}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveTitle(note.id, e as any);
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => saveTitle(note.id, e)}
                                                            className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/80 transition-all"
                                                            disabled={savingId === note.id}
                                                        >
                                                            {savingId === note.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                                            Save
                                                        </button>
                                                        <button 
                                                            onClick={cancelEditing}
                                                            className="flex-1 bg-white/[0.05] text-white/40 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-all"
                                                            disabled={savingId === note.id}
                                                        >
                                                            <X size={14} />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Link to={`/notes/${note.id}`} className="block group/title">
                                                    <h3 className="font-bold text-xl line-clamp-2 leading-snug group-hover/title:text-primary transition-colors">
                                                        {note.video_title || 'Untitled Extraction'}
                                                    </h3>
                                                </Link>
                                            )}
                                        </div>
                                        
                                        <Link to={`/notes/${note.id}`} className="mt-auto pt-6 border-t border-white/[0.03] flex items-center justify-between group/more">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover/card:text-white/40 transition-colors">View Details</span>
                                            <ArrowRight size={14} className="text-white/10 group-hover/card:text-primary transition-all group-hover/more:translate-x-1" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;

