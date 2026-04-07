import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, FileText, Clock, Edit2, Check, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    plan: string;
}

const ProfileView: React.FC = () => {
    const { session } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [noteCount, setNoteCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');

    const fetchProfileData = async () => {
        if (!session) return;
        
        try {
            // Fetch profile via API
            const profileRes = await axios.get(`${API_BASE_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setProfile(profileRes.data);
            setEditedName(profileRes.data.full_name || '');

            // Fetch note count
            const notesRes = await axios.get(`${API_BASE_URL}/notes/`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setNoteCount(notesRes.data.length || 0);
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            // toast.error('Neural Sync: Profile data unreachable.'); // Already handled by UI state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [session]);

    const handleUpdateProfile = async () => {
        if (!session) return;
        
        const tid = toast.loading('Reconfiguring identity data...');
        try {
            await axios.patch(`${API_BASE_URL}/profile/me`, 
                { full_name: editedName },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            setProfile(prev => prev ? { ...prev, full_name: editedName } : null);
            setIsEditing(false);
            toast.success('Identity Updated Successfully.', { id: tid });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Identity sync failed.', { id: tid });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10"
        >
            <div className="mb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Secure Identity Core</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">Neural Profile</h1>
                <p className="text-white/30 text-sm max-w-lg mx-auto font-medium">Manage your digital presence and monitor cognitive extraction metrics via the secure bypass terminal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="premium-card p-1 shadow-indigo-glow border-white/[0.05] !rounded-[2.5rem] sticky top-32">
                        <div className="bg-black/40 p-10 !rounded-[2.4rem] text-center relative overflow-hidden backdrop-blur-3xl">
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
                            
                            <div className="w-28 h-28 rounded-[2.5rem] bg-black/60 border border-white/[0.08] mx-auto mb-8 flex items-center justify-center shadow-2xl relative group overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="text-4xl font-bold text-white uppercase relative z-10">
                                    {(profile?.full_name || session?.user?.email)?.charAt(0)}
                                </span>
                            </div>
                            
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input 
                                        type="text" 
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="premium-input w-full text-center !bg-white/[0.02] border-white/10"
                                        placeholder="Identify Subject"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleUpdateProfile}
                                            className="flex-1 bg-primary/20 text-primary p-3 rounded-2xl border border-primary/20 hover:bg-primary/30 transition-all flex items-center justify-center"
                                            title="Confirm Neural Identity Reconfiguration"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 bg-white/5 text-white/40 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
                                            title="Abort Reconfiguration"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group relative">
                                    <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center justify-center gap-3">
                                        {profile?.full_name || 'Anonymous Subject'}
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-primary"
                                            title="Edit Identity Metadata"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </h2>
                                    <p className="text-white/30 text-xs font-bold flex items-center justify-center gap-2 mb-8">
                                        <Mail size={12} className="text-white/10" />
                                        {session?.user?.email}
                                    </p>

                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <span className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                            <Shield size={10} />
                                            {profile?.role?.toUpperCase()}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 text-[9px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                                            <Sparkles size={10} />
                                            {profile?.plan?.toUpperCase()} TIER
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details & Stats */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Stats Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card p-1 shadow-indigo-glow border-white/[0.05] !rounded-[2.5rem]">
                            <div className="bg-black/40 p-8 !rounded-[2.4rem] backdrop-blur-xl group">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 border border-primary/10 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
                                    <FileText size={22} />
                                </div>
                                <div className="text-5xl font-black tracking-tighter text-white mb-2">{noteCount}</div>
                                <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Neural Extractions</div>
                            </div>
                        </div>
                        <div className="premium-card p-1 shadow-indigo-glow border-white/[0.05] !rounded-[2.5rem]">
                            <div className="bg-black/40 p-8 !rounded-[2.4rem] backdrop-blur-xl group">
                                <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent mb-6 border border-accent/10 group-hover:bg-accent/10 group-hover:scale-110 transition-all duration-500">
                                    <Clock size={22} />
                                </div>
                                <div className="text-5xl font-black tracking-tighter text-white mb-2">∞</div>
                                <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Retention Factor</div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Bridge */}
                    <div className="premium-card p-1 border-white/[0.05] !rounded-[2.5rem]">
                        <div className="bg-black/40 p-10 !rounded-[2.4rem] backdrop-blur-xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-white/20">
                                <div className="w-10 h-[1px] bg-white/10" />
                                Core Registry
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">Designation</span>
                                    <span className="font-bold text-white tracking-tight text-sm">{profile?.full_name || 'Anonymous'}</span>
                                </div>
                                <div className="flex justify-between items-center group/item border-t border-white/[0.03] pt-8">
                                    <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">Auth Terminal</span>
                                    <span className="font-bold text-white tracking-tight text-sm">{session?.user?.email}</span>
                                </div>
                                <div className="flex justify-between items-center group/item border-t border-white/[0.03] pt-8">
                                    <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">Initialization</span>
                                    <span className="font-bold text-white tracking-tight text-sm">
                                        {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Archive Loss'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Allocation */}
                    <div className="premium-card p-1 border-indigo-500/10 shadow-indigo-glow !rounded-[2.5rem]">
                        <div className="bg-gradient-to-br from-indigo-900/10 to-transparent p-10 !rounded-[2.4rem] backdrop-blur-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -z-10" />
                             
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4 text-accent">
                                        <div className="w-10 h-[1px] bg-accent/20" />
                                        Resource Allocation
                                    </h3>
                                    <p className="text-[10px] text-white/30 font-bold mt-3 uppercase tracking-widest pl-14">
                                        Active Protocol: <span className="text-accent">{profile?.plan?.toUpperCase() || 'FREE'}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 pl-14">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                                    <span className="text-white/20">Neural Pipeline Efficiency</span>
                                    <span className="text-accent">94% Capacity</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-primary to-accent relative"
                                    >
                                        <div className="absolute top-0 right-0 w-2 h-full bg-white blur-sm opacity-50" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileView;
