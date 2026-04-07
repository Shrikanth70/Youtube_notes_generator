import React, { useState, useEffect } from 'react';
import { 
  Youtube, Play, Settings, User, Clock, FileText, 
  CheckCircle, Search, LogOut, ArrowRight, Zap, 
  Download, Moon, Bell, Shield, Video, Sparkles
} from 'lucide-react';

// --- Design System Utility Classes ---
// Combining Neumorphism (soft shadows) and Glassmorphism (blur & transparency)
const theme = {
  // Main background (Deep Dark Blue/Grey)
  bg: "bg-[#161722] text-gray-300 min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden",
  // Glassmorphic containers
  glass: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-3xl",
  glassCard: "bg-white/[0.04] backdrop-blur-md border border-white/[0.05] shadow-lg rounded-2xl hover:bg-white/[0.06] transition-colors",
  // Neumorphic elements
  neu: "bg-[#161722] shadow-[6px_6px_14px_#0e0f16,-6px_-6px_14px_#1e1f2e] rounded-2xl border border-white/[0.02]",
  neuPressed: "bg-[#161722] shadow-[inset_6px_6px_12px_#0e0f16,inset_-6px_-6px_12px_#1e1f2e] rounded-xl border border-white/[0.01]",
  neuButton: "bg-[#161722] shadow-[4px_4px_10px_#0e0f16,-4px_-4px_10px_#1e1f2e] active:shadow-[inset_4px_4px_8px_#0e0f16,inset_-4px_-4px_8px_#1e1f2e] transition-all duration-200 rounded-xl border border-white/[0.02] flex items-center justify-center font-medium text-gray-300 hover:text-indigo-400",
  neuButtonPrimary: "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[4px_4px_10px_#0e0f16,-4px_-4px_10px_#1e1f2e,inset_1px_1px_2px_rgba(255,255,255,0.3)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] transition-all duration-200 rounded-xl text-white font-medium flex items-center justify-center",
  // Typography
  textGradient: "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing, auth, home, profile
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Navigation Handler
  const navigate = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('landing');
  };

  return (
    <div className={theme.bg}>
      <NavBar 
        currentPage={currentPage} 
        navigate={navigate} 
        isAuthenticated={isAuthenticated} 
        handleLogout={handleLogout} 
      />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {currentPage === 'landing' && <LandingView navigate={navigate} />}
        {currentPage === 'auth' && <AuthView handleLogin={handleLogin} />}
        {currentPage === 'home' && <HomeView />}
        {currentPage === 'profile' && <ProfileView />}
      </main>
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

function NavBar({ currentPage, navigate, isAuthenticated, handleLogout }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className={`max-w-7xl mx-auto px-6 py-4 flex justify-between items-center ${theme.glass} rounded-full`}>
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate(isAuthenticated ? 'home' : 'landing')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-all">
            <Youtube className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Note<span className={theme.textGradient}>Genie</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('home')}
                className={`text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('profile')}
                className={`text-sm font-medium transition-colors ${currentPage === 'profile' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
              >
                History & Profile
              </button>
              <button onClick={handleLogout} className="px-5 py-2.5 text-sm group relative">
                <div className="absolute inset-0 w-full h-full rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 bg-red-500/10 blur-sm"></div>
                <div className={`${theme.neuButton} !rounded-full px-5 py-2.5 group-hover:text-red-400`}>
                  Logout
                </div>
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</a>
              <button onClick={() => navigate('auth')} className="px-6 py-2.5 text-sm group relative">
                <div className="absolute inset-0 w-full h-full rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 bg-indigo-500/20 blur-md"></div>
                <div className={`${theme.neuButton} !rounded-full px-6 py-2.5`}>
                  Sign In
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function LandingView({ navigate }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-24 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl space-y-8 relative">
        {/* Background decorative blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/20 rounded-full blur-[80px] -z-10"></div>

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>GPT-4 Powered Generation</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Turn Hours of Video into <br />
          <span className={theme.textGradient}>Minutes of Notes</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Paste any YouTube URL and instantly get comprehensive, structured notes, timestamps, and key takeaways. Perfect for students, researchers, and lifelong learners.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button 
            onClick={() => navigate('auth')}
            className={`w-full sm:w-auto px-8 py-4 text-lg ${theme.neuButtonPrimary} group`}
          >
            Start Generating Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className={`w-full sm:w-auto px-8 py-4 text-lg ${theme.neuButton} !rounded-xl`}>
            <Play className="mr-2 w-5 h-5" /> View Demo
          </button>
        </div>
      </div>

      {/* Glassmorphic App Preview Mockup */}
      <div className={`w-full max-w-5xl h-[400px] md:h-[600px] ${theme.glass} p-4 md:p-8 relative overflow-hidden flex flex-col`}>
        {/* Mock Top bar */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          <div className={`flex-1 ml-4 h-8 ${theme.neuPressed} !rounded-md flex items-center px-4`}>
            <span className="text-xs text-gray-500">https://youtube.com/watch?v=...</span>
          </div>
        </div>
        
        {/* Mock Content */}
        <div className="flex-1 flex gap-6">
          <div className={`w-1/3 hidden md:block ${theme.neu} rounded-xl p-4 flex-col gap-4`}>
            <div className="w-full h-32 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="w-3/4 h-4 bg-gray-700 rounded mt-4 animate-pulse"></div>
            <div className="w-1/2 h-4 bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className={`flex-1 ${theme.neuPressed} rounded-xl p-6 relative overflow-hidden`}>
            <div className="w-1/3 h-6 bg-indigo-500/20 rounded-md mb-6"></div>
            <div className="space-y-4">
              <div className="w-full h-3 bg-gray-700/50 rounded-full"></div>
              <div className="w-full h-3 bg-gray-700/50 rounded-full"></div>
              <div className="w-5/6 h-3 bg-gray-700/50 rounded-full"></div>
              <div className="w-4/6 h-3 bg-gray-700/50 rounded-full"></div>
            </div>
            {/* Gradient overlay for effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#161722] to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Zap className="w-8 h-8 text-yellow-400" />, title: "Lightning Fast", desc: "Get comprehensive notes in seconds, not hours. Our AI processes video transcripts instantly." },
          { icon: <CheckCircle className="w-8 h-8 text-green-400" />, title: "Highly Accurate", desc: "Powered by advanced NLP to capture context, key concepts, and actionable insights perfectly." },
          { icon: <Clock className="w-8 h-8 text-blue-400" />, title: "Smart Timestamps", desc: "Notes are linked directly to video timestamps so you can jump straight to the source." }
        ].map((feature, i) => (
          <div key={i} className={`${theme.glassCard} p-8 flex flex-col items-center text-center group`}>
            <div className={`w-16 h-16 ${theme.neu} !rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthView({ handleLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
      <div className={`w-full max-w-md ${theme.glass} p-10 relative overflow-hidden`}>
        {/* Decorative blur inside card */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] -z-10"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px] -z-10"></div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Enter your details to access your notes.' : 'Start your journey to better learning.'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className={`w-full px-5 py-4 ${theme.neuPressed} text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-shadow`}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className={`w-full px-5 py-4 ${theme.neuPressed} text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-shadow`}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className={`w-full px-5 py-4 ${theme.neuPressed} text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-shadow`}
              required
            />
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
            </div>
          )}

          <button type="submit" className={`w-full py-4 text-lg ${theme.neuButtonPrimary} mt-4`}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function HomeView() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!url) return;
    setIsGenerating(true);
    setResult(null);
    
    // Mock API Call
    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        title: "The Complete Guide to Quantum Computing",
        channel: "Tech Explained",
        duration: "14:20",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
        notes: [
          { time: "00:00", title: "Introduction", content: "Brief overview of classical vs quantum bits (qubits)." },
          { time: "03:15", title: "Superposition Explained", content: "How qubits can exist in multiple states simultaneously, exponentially increasing processing power for specific tasks." },
          { time: "07:40", title: "Quantum Entanglement", content: "The phenomenon where particles become interconnected, allowing instantaneous state transfer regardless of distance. Einstein called it 'spooky action at a distance'." },
          { time: "11:20", title: "Real-world Applications", content: "Drug discovery, financial modeling, and breaking classical cryptography. Timeline for commercial availability." }
        ]
      });
    }, 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Input Section */}
      <div className={`${theme.glass} p-8 relative overflow-hidden`}>
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Video className="w-6 h-6 mr-3 text-indigo-400" />
          Generate New Notes
        </h2>
        
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Youtube className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube Video URL here..."
              className={`w-full pl-12 pr-4 py-5 ${theme.neuPressed} text-gray-200 placeholder-gray-500 text-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/50`}
            />
          </div>
          <button 
            type="submit"
            disabled={!url || isGenerating}
            className={`md:w-48 py-5 text-lg ${isGenerating ? theme.neuButton : theme.neuButtonPrimary} ${(!url || isGenerating) && 'opacity-70 cursor-not-allowed'}`}
          >
            {isGenerating ? (
              <span className="flex items-center">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-500">
          
          {/* Left Column: Video Info (Glassmorphic) */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`${theme.glassCard} p-6`}>
              <div className={`w-full aspect-video rounded-xl overflow-hidden mb-4 ${theme.neuPressed} relative group`}>
                <img src={result.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-12 h-12 ${theme.glass} rounded-full flex items-center justify-center`}>
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-lg text-white mb-2 leading-tight">{result.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-4 mt-2">
                <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {result.channel}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {result.duration}</span>
              </div>
            </div>

            {/* Quick Actions (Neumorphic) */}
            <div className={`${theme.neu} p-6 flex flex-col gap-4`}>
              <button className={`w-full py-3 ${theme.neuButton} !justify-start px-4`}>
                <Download className="w-4 h-4 mr-3 text-indigo-400" /> Export to PDF
              </button>
              <button className={`w-full py-3 ${theme.neuButton} !justify-start px-4`}>
                <FileText className="w-4 h-4 mr-3 text-purple-400" /> Copy to Clipboard
              </button>
            </div>
          </div>

          {/* Right Column: Generated Notes */}
          <div className={`lg:col-span-2 ${theme.glass} p-8 relative`}>
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FileText className="w-6 h-6 mr-3 text-indigo-400" />
                Summary & Notes
              </h3>
              <div className={`px-4 py-1.5 rounded-full ${theme.neuPressed} text-xs text-indigo-300 flex items-center`}>
                <CheckCircle className="w-3 h-3 mr-2" /> Generated Successfully
              </div>
            </div>

            <div className="space-y-8 pr-2 custom-scrollbar max-h-[600px] overflow-y-auto">
              {result.notes.map((note, index) => (
                <div key={index} className="relative pl-8 group">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-8 bottom-[-32px] w-[2px] bg-white/5 group-last:hidden"></div>
                  
                  {/* Timestamp bullet (Neumorphic button style for clickability) */}
                  <button className={`absolute left-0 top-1 w-6 h-6 rounded-full ${theme.neuButton} !p-0 z-10 flex items-center justify-center text-[10px] text-indigo-300 font-bold hover:text-white transition-colors`}>
                    <Play className="w-2.5 h-2.5 ml-0.5" />
                  </button>
                  
                  <div className={`${theme.neuPressed} p-5 rounded-2xl hover:border-indigo-500/30 transition-colors border border-transparent`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs font-mono px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded">
                        {note.time}
                      </span>
                      <h4 className="text-lg font-bold text-white">{note.title}</h4>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function ProfileView() {
  const [activeTab, setActiveTab] = useState('history'); // history, settings

  const mockHistory = [
    { id: 1, title: "React 19 Crash Course", date: "Today", channel: "CodeMaster", length: "45m" },
    { id: 2, title: "The Universe in a Nutshell", date: "Yesterday", channel: "AstroPhysics", length: "1h 20m" },
    { id: 3, title: "Tailwind CSS Best Practices", date: "3 days ago", channel: "UI Dev", length: "22m" },
    { id: 4, title: "Understanding Neumorphism", date: "1 week ago", channel: "Design Trends", length: "15m" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Profile Header (Glassmorphic) */}
      <div className={`${theme.glass} p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden`}>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
        
        <div className={`w-28 h-28 ${theme.neu} rounded-full p-2 flex-shrink-0`}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl text-white font-bold shadow-inner">
            A
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Alex Developer</h1>
          <p className="text-gray-400 mb-4 flex items-center justify-center md:justify-start">
            alex@example.com <span className="mx-2">•</span> Free Plan
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className={`px-4 py-2 ${theme.neuPressed} rounded-lg text-sm flex items-center`}>
              <FileText className="w-4 h-4 mr-2 text-indigo-400" />
              <span className="font-bold text-white mr-1">24</span> Notes Generated
            </div>
            <div className={`px-4 py-2 ${theme.neuPressed} rounded-lg text-sm flex items-center`}>
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              <span className="font-bold text-white mr-1">12h</span> Video Processed
            </div>
          </div>
        </div>

        <button className={`px-6 py-3 ${theme.neuButtonPrimary} z-10`}>
          Upgrade to Pro
        </button>
      </div>

      {/* Tab Navigation (Neumorphic) */}
      <div className={`flex p-2 ${theme.neuPressed} rounded-2xl mb-8 max-w-md mx-auto md:mx-0`}>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'history' 
              ? `${theme.neu} text-indigo-400` 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" /> History
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'settings' 
              ? `${theme.neu} text-indigo-400` 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" /> Settings
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-bold text-white">Recent Notes</h3>
            <div className={`flex items-center px-4 py-2 ${theme.neuPressed} rounded-lg w-64`}>
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="bg-transparent border-none outline-none text-sm text-gray-200 w-full placeholder-gray-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockHistory.map((item) => (
              <div key={item.id} className={`${theme.glassCard} p-6 flex flex-col justify-between group cursor-pointer`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                      {item.date}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {item.length}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-400 flex items-center">
                    <User className="w-3 h-3 mr-1" /> {item.channel}
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className={`px-4 py-2 text-xs ${theme.neuButton} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    View Notes <ArrowRight className="w-3 h-3 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className={`${theme.glass} p-8 animate-in slide-in-from-bottom-4 duration-300`}>
          <h3 className="text-xl font-bold text-white mb-8">Account Settings</h3>
          
          <div className="space-y-8 max-w-2xl">
            {/* Setting Group 1 */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">Preferences</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${theme.neuPressed} rounded-xl`}>
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">Dark Mode</p>
                    <p className="text-xs text-gray-500">Toggle dark theme appearance</p>
                  </div>
                </div>
                {/* Neumorphic Toggle switch (mocked ON state) */}
                <div className={`w-14 h-8 ${theme.neuPressed} rounded-full p-1 cursor-pointer flex items-center justify-end`}>
                  <div className={`w-6 h-6 bg-indigo-500 rounded-full shadow-md`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${theme.neuPressed} rounded-xl`}>
                    <Bell className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive summaries directly to your inbox</p>
                  </div>
                </div>
                <div className={`w-14 h-8 ${theme.neuPressed} rounded-full p-1 cursor-pointer flex items-center justify-start`}>
                  <div className={`w-6 h-6 bg-gray-600 rounded-full shadow-md`}></div>
                </div>
              </div>
            </div>

            {/* Setting Group 2 */}
            <div className="space-y-6 pt-4">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">Security</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${theme.neuPressed} rounded-xl`}>
                    <Shield className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">Change Password</p>
                    <p className="text-xs text-gray-500">Update your account password</p>
                  </div>
                </div>
                <button className={`px-4 py-2 text-sm ${theme.neuButton}`}>
                  Update
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}