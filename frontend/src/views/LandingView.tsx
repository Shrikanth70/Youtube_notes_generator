import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCTA = () => {
        navigate(user ? '/dashboard' : '/auth');
    };

    return (
        <div className="w-full self-start overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="flex flex-col items-center text-center pt-24 md:pt-28 lg:pt-32 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-xl"
                    >
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                            Intelligence Engine Activated
                        </span>
                    </motion.div>

                    <h1 className="mb-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
                        YouTube Notes,
                        <br />
                        <span className="text-gradient-indigo">Supercharged.</span>
                    </h1>

                    <p className="mb-10 max-w-3xl text-base font-medium leading-relaxed text-white/40 md:text-lg">
                        The elite AI platform for high-velocity learning. Transform video transcripts into
                        structured intelligence in seconds.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={handleCTA}
                            className="cta-primary !px-10 !py-4 flex items-center gap-2 group"
                        >
                            Start Generating
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* <button className="cta-secondary !px-10 !py-4">
                            Experimental Demo
                        </button> */}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 py-16 md:grid-cols-3 md:py-20">
                    {[
                        {
                            icon: Clock,
                            title: 'Zero Latency',
                            desc: 'Process hours of content in seconds with lightning-fast intelligence.',
                        },
                        {
                            icon: BookOpen,
                            title: 'Structured Knowledge',
                            desc: 'Get summaries, insights, and hierarchical notes instantly.',
                        },
                        {
                            icon: ShieldCheck,
                            title: 'Secure Vault',
                            desc: 'Your data stays private and encrypted across sessions.',
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="premium-card p-8 transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                                <item.icon className="h-6 w-6" />
                            </div>

                            <h3 className="mb-3 text-xl font-semibold tracking-tight text-white">
                                {item.title}
                            </h3>

                            <p className="text-sm leading-relaxed text-white/40">{item.desc}</p>
                        </motion.div>
                    ))}
                </section>

                {/* <section className="flex justify-center py-16 md:py-20">
                    <div className="flex aspect-video w-full max-w-5xl items-center justify-center rounded-3xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/20">
                            Preview Coming Soon
                        </span>
                    </div>
                </section> */}
            </div>
        </div>
    );
};

export default LandingView;