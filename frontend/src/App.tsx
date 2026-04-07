import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import NoteDetailView from './views/NoteDetailView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';

const NavBar = () => {
    const { user, session, signOut } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchProfile = async () => {
            if (session) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/profile/me`, {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                    setProfile(res.data);
                } catch (e) {
                    // Silent catch
                }
            }
        };
        fetchProfile();
    }, [session, API_BASE_URL]);

    const isAdmin = session?.user?.email === 'shrikanthbhukya03@gmail.com' || profile?.role === 'admin';

    return (
        <nav className="fixed top-0 left-0 right-0 z-[50] flex justify-center p-4 md:p-6 pointer-events-none">
            <div className="w-full max-w-7xl pointer-events-auto glass-panel !bg-black/40 !border-white/[0.05] !rounded-full shadow-2xl backdrop-blur-3xl flex justify-between items-center px-4 md:px-8 py-3 relative">
                <Link to="/" className="flex items-center gap-3 group transition-all shrink-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary via-primary to-indigo-400 flex items-center justify-center shadow-indigo-glow group-hover:scale-105 transition-all duration-500">
                        <Sparkles className="text-white w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="text-lg md:text-xl font-bold text-white tracking-tight">YTNotes<span className="text-primary italic">AI</span></span>
                </Link>

                <div className="flex gap-1 md:gap-2 items-center">
                    {user ? (
                        <>
                            <div className="hidden sm:flex items-center gap-0.5 md:gap-1">
                                <Link
                                    to="/dashboard"
                                    className={`px-3 md:px-4 py-2 rounded-full text-[11px] md:text-sm font-medium transition-all ${location.pathname === '/dashboard' ? 'text-white bg-white/[0.05]' : 'text-white/40 hover:text-white hover:bg-white/[0.03]'}`}
                                >
                                    Workspace
                                </Link>
                                <Link
                                    to="/profile"
                                    className={`px-3 md:px-4 py-2 rounded-full text-[11px] md:text-sm font-medium transition-all ${location.pathname === '/profile' ? 'text-white bg-white/[0.05]' : 'text-white/40 hover:text-white hover:bg-white/[0.03]'}`}
                                >
                                    Settings
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={`px-3 md:px-4 py-2 rounded-full text-[11px] md:text-sm font-medium transition-all ${location.pathname === '/admin' ? 'text-primary bg-primary/10' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`}
                                    >
                                        Console
                                    </Link>
                                )}
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 mx-1 md:mx-2 hidden sm:block" />
                            <button
                                onClick={signOut}
                                className="p-2 md:p-2.5 rounded-full text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0 hidden sm:block"
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <Link 
                            to="/auth" 
                            className="cta-primary !py-2 md:!py-2.5 !px-4 md:!px-6 !text-[10px] md:!text-xs !bg-white !text-black shadow-none hover:bg-white/90 hover:scale-105 hidden sm:flex"
                        >
                            Get Started
                        </Link>
                    )}

                    <button 
                        onClick={() => {
                            if (!user) navigate('/auth');
                            else setIsMobileMenuOpen(!isMobileMenuOpen);
                        }}
                        className="sm:hidden p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && user && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute top-full left-4 right-4 mt-2 p-2 glass-panel !bg-black/90 !border-white/[0.05] !rounded-[2rem] shadow-2xl backdrop-blur-3xl sm:hidden pointer-events-auto z-[60]"
                        >
                            <div className="flex flex-col gap-1">
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${location.pathname === '/' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${location.pathname === '/dashboard' ? 'text-white bg-primary shadow-indigo-glow' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Workspace
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${location.pathname === '/profile' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Settings
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${location.pathname === '/admin' ? 'text-primary bg-primary/10' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`}
                                    >
                                        Administrative Console
                                    </Link>
                                )}
                                <div className="h-px bg-white/5 my-1" />
                                <button
                                    onClick={() => {
                                        signOut();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 hover:bg-red-400/5 transition-all text-left flex items-center gap-3"
                                >
                                    <LogOut size={16} />
                                    Terminate Session
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen w-full flex flex-col items-center bg-black text-white selection:bg-primary/40 overflow-x-hidden font-['Outfit']">
                    <div className="cinematic-bg" />

                    <NavBar />

                    <main className="w-full flex-1 pt-28 md:pt-36 relative">
                        <Routes>
                            <Route path="/" element={<LandingView />} />
                            <Route path="/auth" element={<AuthView />} />

                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<DashboardView />} />
                                <Route path="/notes/:id" element={<NoteDetailView />} />
                                <Route path="/profile" element={<ProfileView />} />
                                <Route path="/admin" element={<AdminView />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>

                    <footer className="w-full py-20 border-t border-white/[0.03] mt-20 relative z-10 overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                        <span className="text-xl font-bold tracking-tight">YTNotes AI</span>
                                    </div>
                                    <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                                        Empowering high-velocity learners with AI-driven content analysis.
                                        Transform any YouTube video into actionable intelligence in seconds.
                                    </p>
                                </div>
                                {/* <div>
                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-white/20">Product</h4>
                                    <ul className="space-y-4">
                                        <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Features</a></li>
                                        <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Changelog</a></li>
                                        <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Roadmap</a></li>
                                    </ul>
                                </div> */}
                                {/* <div>
                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-white/20">Policy</h4>
                                    <ul className="space-y-4">
                                        <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Privacy</a></li>
                                        <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Terms</a></li>
                                        <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Security</a></li>
                                    </ul>
                                </div> */}
                            </div>
                            <div className="pt-10 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
                                <p className="text-white/20 text-[10px] font-medium uppercase tracking-widest">
                                    © 2026 YTNotes AI - Shrikanth. All rights reserved.
                                </p>
                                <div className="flex gap-8">
                                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Built with precision</span>
                                </div>
                            </div>
                        </div>
                    </footer>

                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            className: 'glass-panel !bg-surface-elevated/90 !text-white !border-white/[0.08] !backdrop-blur-3xl !rounded-2xl !py-3 !px-5 shadow-2xl !text-sm',
                            duration: 4000,
                        }}
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
