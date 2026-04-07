import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect if user gets authenticated
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        if (isSignUp && !fullName) {
            toast.error('Please enter your full name.');
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { 
                        emailRedirectTo: window.location.origin,
                        data: {
                            full_name: fullName,
                            role: 'user', 
                            plan: 'free'
                        }
                    }
                });
                if (error) throw error;
                toast.success('Account created! Please check your email for verification.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.status === 429) {
                        throw new Error('Too many attempts. Please try again later.');
                    }
                    throw error;
                }
                toast.success('Signed in successfully. Welcome back!');
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            toast.error(err.message, { duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card p-1 md:p-1.5 w-full max-w-md shadow-indigo-glow border-white/[0.05] !rounded-[2.5rem]"
            >
                <div className="bg-black/60 p-10 md:p-14 !rounded-[2.2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 blur-[80px] -z-10" />

                    <div className="text-center mb-12">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.08] mx-auto mb-8 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                             <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                             <Sparkles className="text-primary w-8 h-8 relative z-10" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter mb-3">
                            {isSignUp ? 'Join YTNotes' : 'Welcome Back'}
                        </h2>
                        <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
                            {isSignUp ? 'Create your account to get started' : 'Sign in to access your notes'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {isSignUp && (
                            <div className="relative group/input">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="premium-input w-full pl-12 !bg-white/[0.02] !text-sm"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={isSignUp}
                                />
                            </div>
                        )}

                        <div className="relative group/input">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={16} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="premium-input w-full pl-12 !bg-white/[0.02] !text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group/input">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={16} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="premium-input w-full pl-12 !bg-white/[0.02] !text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="cta-primary w-full !py-4 mt-6 !rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]"
                        >
                            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-10 text-center border-t border-white/[0.03] pt-8">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-white/20 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthView;

