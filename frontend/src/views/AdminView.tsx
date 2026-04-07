import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, User, Shield, Zap, Activity, Users, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserOverview {
    id: string;
    full_name: string;
    email: string;
    role: string;
    plan: string;
    created_at: string;
    account_status: string;
    quota?: {
        daily_generation_limit: number;
        monthly_generation_limit: number;
    };
}

const TIERS = [
    { name: 'Standard Free', daily: 5, monthly: 100, color: 'text-primary' },
    { name: 'Free Level 1', daily: 10, monthly: 200, color: 'text-green-400' },
    { name: 'Free Level 2', daily: 25, monthly: 500, color: 'text-accent' },
    { name: 'Premium Tier', daily: 50, monthly: 1000, color: 'text-yellow-400' },
];

const AdminView: React.FC = () => {
    const { session } = useAuth();
    const [users, setUsers] = useState<UserOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState<UserOverview | null>(null);
    const [showQuotaModal, setShowQuotaModal] = useState(false);

    const fetchUsers = async () => {
        if (!session) return;
        
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setUsers(res.data);
        } catch (error: any) {
            console.error('Admin Fetch Error:', error);
            const msg = error.response?.data?.detail || 'System Breach: Nexus Data Unreachable.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [session]);

    const handleToggleAdmin = async (userId: string, currentRole: string) => {
        if (!session) return;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const tid = toast.loading(`Reconfiguring subject role to ${newRole.toUpperCase()}...`);
        
        try {
            await axios.patch(`${API_BASE_URL}/admin/users/${userId}`, 
                { role: newRole },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            toast.success('Subject Authorization Updated.', { id: tid });
            fetchUsers();
        } catch (error) {
            toast.error('Privilege Escalation Failed.', { id: tid });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!session) return;
        
        // Anti-self-termination guard
        if (userId === session.user.id) {
            toast.error("Security Override: You cannot terminate your own administrative identity.", {
                icon: '🛡️',
                className: 'glass-panel !bg-red-500/10 !text-red-400 !border-red-500/20'
            });
            return;
        }

        if (!confirm('EXECUTE TERMINATION? Account will be permanently purged from the neural registry.')) return;
        
        const tid = toast.loading('Executing account termination sequence...');
        
        try {
            await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            toast.success('Subject Purged Successfully.', { id: tid });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Termination sequence failed.', { id: tid });
        }
    };

    const handleUpdateQuota = async (userId: string, daily: number, monthly: number) => {
        if (!session) return;
        const tid = toast.loading('Recalibrating subject neural capacity...');
        
        try {
            await axios.patch(`${API_BASE_URL}/admin/users/${userId}/quota`, 
                { daily_generation_limit: daily, monthly_generation_limit: monthly },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            toast.success('Quota Matrix Synchronized.', { id: tid });
            setShowQuotaModal(false);
            fetchUsers();
        } catch (error) {
            toast.error('Quota Recalibration Failed.', { id: tid });
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto px-6 pb-20 pt-10"
            >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                <div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full mb-4 w-fit">
                        <Shield size={12} className="text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Administrative Nexus</span>
                    </div>
                    <h1 className="text-5xl font-black text-gradient leading-tight tracking-tighter">System Control</h1>
                    <p className="text-white/20 mt-2 font-medium">Global architectural oversight and neural identity management.</p>
                </div>
                
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none md:min-w-[320px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Locate identifier..." 
                            className="premium-input w-full pl-12 !py-4 !text-sm !bg-white/[0.02] border-white/5"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="premium-card !p-4 !rounded-2xl border-white/5 hover:border-primary/20 transition-all text-white/20 hover:text-primary" title="Export Registry Archives">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                    { label: 'Total Subjects', value: users.length, icon: Users, color: 'text-primary', glow: 'shadow-indigo-glow' },
                    { label: 'Elite Tier', value: users.filter(u => u.plan !== 'free').length, icon: Zap, color: 'text-accent', glow: 'shadow-purple-glow' },
                    { label: 'New Arrivals', value: users.filter(u => (new Date().getTime() - new Date(u.created_at).getTime()) < 86400000).length, icon: Activity, color: 'text-green-400', glow: 'shadow-emerald-glow' },
                    { label: 'System Uptime', value: '99.9%', icon: Shield, color: 'text-blue-400', glow: 'shadow-blue-glow' },
                ].map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`premium-card p-1 ${stat.glow} border-white/[0.03] !rounded-[2rem]`}
                    >
                         <div className="bg-black/40 p-8 !rounded-[1.9rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon size={48} />
                            </div>
                            <div className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
                                {stat.label}
                            </div>
                            <div className={`text-4xl font-black ${stat.color} tracking-tighter`}>
                                {stat.value}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bridge */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
                {['all', 'admin', 'user'].map((role) => (
                    <button 
                        key={role}
                        onClick={() => setFilterRole(role)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                            filterRole === role 
                            ? 'bg-primary text-white border-primary shadow-indigo-glow' 
                            : 'bg-white/[0.02] text-white/20 border-white/[0.05] hover:bg-white/[0.05] hover:text-white'
                        }`}
                    >
                        {role} Registry
                    </button>
                ))}
            </div>

            {/* Registry Table */}
            <div className="premium-card p-1 shadow-indigo-glow border-white/[0.05] !rounded-[2.5rem] overflow-hidden">
                <div className="bg-black/40 overflow-x-auto !rounded-[2.4rem]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Subject</th>
                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Neural Capacity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Rank</th>
                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Link Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Commands</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                                    <motion.tr 
                                        key={u.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: Math.min(i * 0.05, 0.5) }}
                                        className="hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-primary group-hover:scale-105 transition-all duration-500 group-hover:bg-primary/10 group-hover:rotate-3 group-hover:border-primary/20">
                                                    <User size={22} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">{u.full_name || 'Anonymous Subject'}</div>
                                                    <div className="text-xs text-white/20 font-medium tracking-tight uppercase">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5 min-w-[140px]">
                                                <div className="flex items-center gap-2 text-xs font-black text-white/60">
                                                    <Zap size={12} className="text-primary" />
                                                    {u.quota?.daily_generation_limit || 5} Daily
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="capacity-bar-fill-40" />
                                                    </div>
                                                    <span className="text-[10px] text-white/20 font-black tracking-widest">{u.quota?.monthly_generation_limit || 100}M</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex items-center w-fit px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${
                                                    u.role === 'admin' 
                                                    ? 'bg-accent/5 text-accent border-accent/20' 
                                                    : 'bg-primary/5 text-primary border-primary/20'
                                                }`}>
                                                    {u.role}
                                                </span>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setShowQuotaModal(true);
                                                    }}
                                                    className="text-[9px] text-primary hover:text-white font-black uppercase tracking-[0.2em] pl-1 transition-colors text-left"
                                                >
                                                    {u.plan} Tier <span className="opacity-40">→ Edit</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                                                u.account_status === 'active' 
                                                ? 'bg-green-500/5 text-green-400 border-green-500/10' 
                                                : 'bg-red-500/5 text-red-400 border-red-500/10'
                                            }`}>
                                                <div className={`w-1 h-1 rounded-full ${u.account_status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                                {u.account_status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleToggleAdmin(u.id, u.role)}
                                                    className={`p-3 rounded-2xl transition-all border ${
                                                        u.role === 'admin' 
                                                        ? 'bg-accent/5 text-accent border-accent/10 hover:bg-accent/20' 
                                                        : 'bg-primary/5 text-primary border-primary/10 hover:bg-primary/20'
                                                    }`}
                                                    title={u.role === 'admin' ? 'Revoke System Privileges' : 'Grant System Privileges'}
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={u.id === session?.user?.id}
                                                    className={`p-3 rounded-2xl transition-all border ${
                                                        u.id === session?.user?.id 
                                                        ? 'bg-white/[0.01] text-white/5 border-white/[0.02] cursor-not-allowed' 
                                                        : 'bg-red-500/5 text-red-400 border-red-500/10 hover:bg-red-500/20'
                                                    }`}
                                                    title={u.id === session?.user?.id ? 'Self-Termination Blocked' : 'Purge Identity Registry'}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <X size={18} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden w-0 group-hover:w-auto transition-all duration-500">Purge</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-24 text-center">
                                            <div className="text-white/20 text-xs font-black uppercase tracking-[0.2em] italic">Archive Null: No subjects detected within parameters.</div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>

        <AnimatePresence>
            {showQuotaModal && selectedUser && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQuotaModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="premium-card w-full max-w-xl p-1 shadow-purple-glow !rounded-[2.5rem] relative z-[1001] overflow-hidden"
                    >
                        <div className="bg-black/80 p-10 !rounded-[2.4rem]">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap size={14} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-left">Quota Recalibration</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">Adjust Neural Capacity</h2>
                                    <p className="text-white/30 text-xs font-medium">Reconfiguring resource limits for subject <span className="text-primary">{selectedUser.email}</span></p>
                                </div>
                                <button 
                                    onClick={() => setShowQuotaModal(false)}
                                    className="p-3 text-white/20 hover:text-white transition-colors"
                                    title="Close Nexus Link"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-10">
                                {TIERS.map((tier) => (
                                    <button
                                        key={tier.name}
                                        onClick={() => handleUpdateQuota(selectedUser.id, tier.daily, tier.monthly)}
                                        className="premium-card !p-6 flex items-center justify-between group hover:border-primary/40 transition-all text-left bg-white/[0.02]"
                                        title={`Select ${tier.name} Tier`}
                                    >
                                        <div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${tier.color}`}>{tier.name}</div>
                                            <div className="text-white/20 text-[9px] font-medium uppercase tracking-widest">Architectural Default</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-white tracking-tighter">{tier.daily} Daily</div>
                                            <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">{tier.monthly} Monthly</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setShowQuotaModal(false)}
                                className="w-full premium-input !bg-white/5 !border-white/10 hover:!border-white/20 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] py-5"
                            >
                                Dismiss Nexus Link
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
    );
};

export default AdminView;
