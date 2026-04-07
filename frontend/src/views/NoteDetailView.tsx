import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft, 
    Copy, 
    Clock, 
    Youtube, 
    Calendar,
    BookOpen
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NoteDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { session } = useAuth();
    const navigate = useNavigate();
    const [note, setNote] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/notes/${id}`, {
                    headers: { Authorization: `Bearer ${session?.access_token}` }
                });
                setNote(res.data);
            } catch (err: any) {
                console.error('Note Fetch Error:', err);
                toast.error('Failed to retrieve insight unit.', {
                    className: 'glass-panel !bg-surface-elevated/90 !text-white'
                });
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (session && id) fetchNote();
    }, [id, session]);

    const handleCopy = () => {
        if (!note?.markdown_content) return;
        const text = `# ${note.video_title}\n\n${note.markdown_content}`;
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard.', {
            className: 'glass-panel !bg-surface-elevated/90 !text-white'
        });
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Synthesizing Insight...</span>
            </div>
        );
    }

    if (!note) return null;

    return (
        <div className="w-full relative">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Floating Action Bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel !rounded-full p-2 flex items-center gap-2 bg-surface-elevated/80 backdrop-blur-xl border-white/[0.08] shadow-2xl"
                >
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-3 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-full transition-all"
                        title="Back to Workspace"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-[1px] h-6 bg-white/[0.08]" />
                    <button 
                        onClick={handleCopy}
                        className="p-3 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-full transition-all"
                        title="Copy Note"
                    >
                        <Copy size={20} />
                    </button>
                    <div className="w-[1px] h-6 bg-white/[0.08]" />
                    <a 
                        href={note.youtube_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 text-white/40 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                        title="Source Video"
                    >
                        <Youtube size={20} />
                    </a>
                </motion.div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-12 pb-48">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header Section */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                                AI Extraction
                            </span>
                            <div className="h-[1px] flex-1 bg-white/[0.05]" />
                            <div className="flex items-center gap-4 text-white/20 text-[10px] uppercase font-bold tracking-widest">
                                <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(note.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-2 pr-4"><Clock size={12} /> 8 min read</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-10 leading-[1.15]">
                            {note.video_title}
                        </h1>

                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-surface-elevated flex items-center justify-center text-[10px] font-bold text-primary">
                                        {i === 1 ? 'AI' : 'VN'}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-white/40 font-medium">Generated by YTNotes Intelligence</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="prose prose-invert max-w-none 
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-h1:text-4xl prose-h1:mb-12 prose-h1:pb-4 prose-h1:border-b prose-h1:border-white/[0.05]
                        prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8
                        prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6
                        prose-p:text-white/60 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
                        prose-li:text-white/60 prose-li:text-lg prose-li:mb-4
                        prose-strong:text-white prose-strong:font-bold
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-8 prose-blockquote:rounded-2xl prose-blockquote:italic prose-blockquote:text-white/80 prose-blockquote:my-12
                        prose-code:text-primary prose-code:bg-white/[0.03] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-bold prose-code:text-sm
                        prose-img:rounded-3xl prose-img:shadow-2xl
                    ">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1 {...props} className="text-white font-bold tracking-tight text-4xl mb-12" />,
                                h2: ({node, ...props}) => <h2 {...props} className="text-white font-bold tracking-tight text-2xl mt-16 mb-8 flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {props.children}
                                </h2>,
                                blockquote: ({node, ...props}) => (
                                    <blockquote className="border-l-4 border-primary bg-primary/5 p-8 rounded-2xl italic text-white/80 my-12 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
                                        {props.children}
                                    </blockquote>
                                ),
                            }}
                        >
                            {note.markdown_content}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-32 pt-16 border-t border-white/[0.05] text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-full text-white/20 text-[10px] font-bold uppercase tracking-widest mb-8">
                            <BookOpen size={14} className="text-primary" /> End of Extraction
                        </div>
                        <h4 className="text-xl font-bold mb-4">Ready for the next one?</h4>
                        <p className="text-white/40 mb-10 max-w-sm mx-auto">Continue building your knowledge archive with more high-density insights.</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="cta-primary !rounded-full !px-10"
                        >
                            Back to Workspace
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NoteDetailView;

