import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Upload & Parse Resume",
      description: "Drop your resume. Our parsing engine automatically scans and extracts key tech stack, projects, and career milestones.",
      color: "#3525cd",
    },
    {
      title: "Select Domain & Settings",
      description: "Pick your technical domain (Frontend, Backend, Fullstack, DevOps) and customize topics, experience level, and limits.",
      color: "#00687a",
    },
    {
      title: "Live Conversational AI",
      description: "Experience dynamic verbal or text-based mock interviews with context-aware follow-up questions in real-time.",
      color: "#e11d48",
    },
    {
      title: "In-depth Feedback Report",
      description: "Get immediate metrics on communication clarity, correctness, grammatical nuances, and actionable advice.",
      color: "#16a34a",
    }
  ];

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderMockup = () => {
    if (activeStep === 0) {
      return (
        <div className="w-full max-w-[340px] space-y-6 animate-fadeIn">
          <div className="border-2 border-dashed border-[#3525cd]/40 bg-[#3525cd]/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 relative group overflow-hidden">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#3525cd] shadow-md border border-[#e4e1ee]">
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#1b1b24]">john_doe_resume.pdf</p>
              <p className="text-[10px] text-[#464555] font-semibold">142 KB • Parsing Complete</p>
            </div>
            <div className="w-full bg-[#e4e1ee] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#3525cd] h-full w-full rounded-full animate-[progress_1.5s_ease-out_infinite] origin-left"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#464555]">Extracted Technical Stack</p>
            <div className="flex flex-wrap gap-2">
              {['React.js', 'Java Spring Boot', 'REST APIs', 'SQL'].map((skill, i) => (
                <span 
                  key={skill} 
                  className="px-2.5 py-1 bg-white border border-[#e4e1ee] text-[#1b1b24] text-[10px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-transform duration-300 hover:scale-105"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full"></span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (activeStep === 1) {
      return (
        <div className="w-full max-w-[340px] space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#1b1b24]">Configure Simulation</h4>
            <p className="text-[10px] text-[#464555]">Customize your workspace setup</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#464555] uppercase">Job Domain</label>
            <div className="w-full bg-white border border-[#e4e1ee] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1b1b24] flex justify-between items-center shadow-sm">
              <span>Backend Engineer</span>
              <svg className="w-4 h-4 text-[#464555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#464555] uppercase">Experience Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {['Entry', 'Mid-Level', 'Senior'].map((lvl) => (
                <div 
                  key={lvl} 
                  className={`py-2 text-center text-[10px] font-bold rounded-xl border transition-all ${
                    lvl === 'Senior' 
                      ? 'bg-[#00687a]/10 border-[#00687a] text-[#00687a]' 
                      : 'bg-white border-[#e4e1ee] text-[#464555] opacity-70'
                  }`}
                >
                  {lvl}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#464555] uppercase">Focus Topics</label>
            <div className="flex flex-wrap gap-1.5">
              {['System Design', 'Concurrency', 'Databases'].map((topic) => (
                <span key={topic} className="px-2 py-1 bg-[#00687a]/5 border border-[#00687a]/20 text-[#00687a] text-[9px] font-bold rounded-lg">
                  {topic}
                </span>
              ))}
              <span className="px-2 py-1 bg-white border border-[#e4e1ee] text-[#464555] text-[9px] font-bold rounded-lg border-dashed">
                + Add More
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (activeStep === 2) {
      return (
        <div className="w-full max-w-[340px] space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#e4e1ee]/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b1b24]">Live Session</span>
            </div>
            <span className="text-[10px] text-[#464555] font-semibold">Duration: 04:12</span>
          </div>
          <div className="space-y-3">
            <div className="bg-[#3525cd]/5 border border-[#3525cd]/10 rounded-2xl rounded-tl-none p-3.5 space-y-1">
              <p className="text-[9px] font-bold text-[#3525cd]">AI Interviewer</p>
              <p className="text-xs text-[#1b1b24] font-medium leading-relaxed">
                "How would you handle high write-concurrency in a distributed inventory service?"
              </p>
            </div>
            <div className="bg-white border border-[#e4e1ee] rounded-2xl rounded-tr-none p-3.5 space-y-1 ml-6 shadow-sm">
              <p className="text-[9px] font-bold text-[#464555]">Your Response (Speaking...)</p>
              <p className="text-xs text-[#1b1b24] font-medium leading-relaxed italic">
                "I would implement a message broker like Kafka to buffer write requests..."
              </p>
            </div>
          </div>
          <div className="bg-white/40 border border-[#e4e1ee]/40 rounded-xl p-3 flex items-center justify-between gap-4">
            <div className="flex gap-[3px] items-center h-5 flex-1 justify-center">
              {[6, 12, 8, 16, 20, 10, 14, 22, 12, 18, 8, 4, 12, 14, 6].map((h, i) => (
                <span 
                  key={i} 
                  className="w-1 bg-[#3525cd] rounded-full animate-[wave_1.2s_ease-in-out_infinite]"
                  style={{ 
                    height: `${h}px`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
            <div className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      );
    }
    if (activeStep === 3) {
      return (
        <div className="w-full max-w-[340px] space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#e4e1ee]/60 pb-3">
            <div>
              <h4 className="text-xs font-bold text-[#1b1b24]">Performance Analytics</h4>
              <p className="text-[10px] text-[#464555]">Detailed metrics and score evaluation</p>
            </div>
            <div className="flex items-center gap-1 bg-[#16a34a]/10 border border-[#16a34a]/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full"></span>
              <span className="text-[9px] font-extrabold text-[#16a34a]">PASSED</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Overall Score', val: '86%', color: 'text-[#3525cd]' },
              { label: 'Confidence', val: 'High', color: 'text-[#00687a]' },
              { label: 'Grammar', val: '92%', color: 'text-[#16a34a]' }
            ].map((metric) => (
              <div key={metric.label} className="bg-white border border-[#e4e1ee] rounded-xl p-2.5 text-center shadow-sm">
                <span className="text-[9px] font-bold text-[#464555] block uppercase tracking-wider mb-1">{metric.label}</span>
                <span className={`text-base font-extrabold ${metric.color}`}>{metric.val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { name: 'Technical Correctness', pct: 85, color: 'bg-[#3525cd]' },
              { name: 'Communication Clarity', pct: 80, color: 'bg-[#00687a]' }
            ].map((bar) => (
              <div key={bar.name} className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-[#1b1b24]">
                  <span>{bar.name}</span>
                  <span>{bar.pct}%</span>
                </div>
                <div className="w-full bg-[#e4e1ee] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${bar.color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#16a34a]/5 border border-[#16a34a]/10 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-xs text-[#16a34a] mt-0.5">💡</span>
            <div className="space-y-0.5">
              <span className="text-[9px] font-extrabold text-[#16a34a] uppercase tracking-wider">Growth Recommendation</span>
              <p className="text-[10px] text-[#464555] font-semibold leading-relaxed">
                Excellent use of Kafka in your system design response. Try to detail partitioning keys in the future.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    let ticking = false;
    // Throttled Mouse Follow effect for high refresh rate monitors
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth) * 100;
          const y = (e.clientY / window.innerHeight) * 100;
          const main = document.getElementById('landing-main');
          if (main) {
            main.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(53, 37, 205, 0.05) 0%, rgba(252, 248, 255, 0) 60%)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative min-h-screen text-[#1b1b24] bg-[#fcf8ff] font-sans selection:bg-[#e2dfff] selection:text-[#0f0069] overflow-x-hidden">
      {/* Styles Injection */}
      <style>{`
        .landing-glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
        }
        .landing-float {
          animation: landing-float-anim 6s ease-in-out infinite;
        }
        @keyframes landing-float-anim {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3525cd]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#00687a]/5 blur-[100px]"></div>
      </div>

      {/* Header / Navigation Shell */}
      <header className="fixed top-0 w-full z-50 bg-[#fcf8ff]/85 backdrop-blur-xl border-b border-[#e4e1ee]/40 shadow-sm">
        <div className="container mx-auto px-6 lg:px-20 flex justify-between items-center py-4">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#3525cd] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#3525cd]/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-[#3525cd] tracking-tight">PrepAI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-semibold text-[#464555] hover:text-[#3525cd] transition-colors" href="#">Solutions</a>
            <a 
              className="text-sm font-semibold text-[#464555] hover:text-[#3525cd] transition-colors cursor-pointer" 
              onClick={scrollToHowItWorks}
            >
              How it Works
            </a>
            <a className="text-sm font-semibold text-[#464555] hover:text-[#3525cd] transition-colors" href="#">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="text-sm font-bold px-5 py-2 text-[#3525cd] hover:bg-[#3525cd]/5 rounded-xl transition-colors cursor-pointer"
            >
              {isAuthenticated ? 'Dashboard' : 'Log In'}
            </button>
            <button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="hidden sm:inline-block bg-[#3525cd] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-[#3525cd]/15 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>

            {/* Mobile Hamburger toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="block md:hidden p-2 text-[#1b1b24] hover:bg-[#3525cd]/5 rounded-xl transition-all cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[73px] left-0 w-full bg-[#fcf8ff]/95 backdrop-blur-xl border-b border-[#e4e1ee]/50 z-40 p-6 flex flex-col gap-4 shadow-lg">
          <a onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#464555] hover:text-[#3525cd] transition-colors" href="#">Solutions</a>
          <a 
            onClick={(e) => { setMobileMenuOpen(false); scrollToHowItWorks(e); }} 
            className="text-sm font-bold text-[#464555] hover:text-[#3525cd] transition-colors cursor-pointer"
          >
            How it Works
          </a>
          <a onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#464555] hover:text-[#3525cd] transition-colors" href="#">Pricing</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); navigate(isAuthenticated ? '/dashboard' : '/register'); }}
            className="w-full bg-[#3525cd] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#3525cd]/15 hover:brightness-110 transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Hero Section */}
      <main id="landing-main" className="relative min-h-screen pt-32 flex items-center overflow-hidden transition-all duration-300">
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          {/* Hero Content - order-1 on mobile so it displays before the illustration */}
          <div className="order-1 lg:order-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3525cd]/10 text-[#3525cd] rounded-full border border-[#3525cd]/20">
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-3.073a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4.12-5.672z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest">Next-Gen Interviewing</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1b1b24] leading-tight tracking-tight">
              Master Your Next Interview with <span className="text-[#3525cd]">AI Precision</span>
            </h1>
            <p className="text-base md:text-lg text-[#464555] font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the ultimate preparation platform that simulates high-stakes corporate interviews using advanced neural language models. Get instant feedback and actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={handleCtaClick}
                className="w-full sm:w-auto bg-[#3525cd] text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-[#3525cd]/25 hover:shadow-[#3525cd]/20 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button 
                onClick={handleCtaClick}
                className="w-full sm:w-auto landing-glass text-[#1b1b24] px-8 py-4 rounded-xl text-base font-bold hover:bg-[#f5f2ff] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#3525cd]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                See Demo
              </button>
            </div>
            
            {/* Social Proof / Stats */}
            <div className="pt-8 border-t border-[#e4e1ee]/50 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-extrabold text-[#3525cd]">98%</p>
                <p className="text-xs text-[#464555] font-semibold">Success Rate</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#3525cd]">50k+</p>
                <p className="text-xs text-[#464555] font-semibold">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#3525cd]">200+</p>
                <p className="text-xs text-[#464555] font-semibold">Companies</p>
              </div>
            </div>
          </div>

          {/* Hero Illustration - order-2 on mobile */}
          <div className="order-2 lg:order-2 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square group">
              {/* Decorative back layers */}
              <div className="absolute inset-0 bg-[#3525cd]/15 rounded-[40px] rotate-6 scale-95 blur-sm opacity-50 transition-transform group-hover:rotate-12 duration-500"></div>
              <div className="absolute inset-0 bg-[#00687a]/10 rounded-[40px] -rotate-3 scale-100 blur-sm opacity-50 transition-transform group-hover:-rotate-6 duration-500"></div>
              
              {/* Main Image Container */}
              <div className="relative landing-glass rounded-[40px] overflow-hidden w-full h-full p-4 landing-float">
                <div className="w-full h-full rounded-[32px] overflow-hidden relative">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Futuristic illustration for AI interview platform" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKRtabZ8-Eyp8Id4dp4nYQ_KsftLIa0uSAvN-_r2EqG5BNIofezehn90atGsxSNwxPhwoMM5Dr3SvgvTW1TpBkKo0fDZB1NF7L3nlSdhZADDx8K8lC9rvBPcgIAk-_iuOa59Fa9BKhMgsNUW8WSIGpH2FIHjr3bGzk-gnv6WnTvMvfiBE0h32O61VUIyd_NkPz0fv8N5MMqlafCNFQxHinpt84duzsf4zosLiTdn7PKCdgJQLdUmCl9ye6YBUBHEgx28EVUWQonks"
                  />
                  {/* Overlaid AI Feedback Chip */}
                  <div className="absolute bottom-6 right-6 landing-glass px-6 py-4 rounded-2xl border-l-4 border-[#3525cd]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-4 h-4 text-[#3525cd] animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] font-extrabold text-[#1b1b24] tracking-wider uppercase">AI Analysis</span>
                    </div>
                    <p className="text-xs font-bold text-[#464555]">Confidence Score: 94%</p>
                  </div>
                  
                  {/* Floating Voice UI */}
                  <div className="absolute top-6 left-6 landing-glass px-4 py-2.5 rounded-full flex items-center gap-2">
                    <div className="flex gap-[2px] items-end h-3 px-1">
                      <div className="w-1 bg-[#3525cd] h-1.5 rounded-full animate-pulse"></div>
                      <div className="w-1 bg-[#3525cd] h-3.5 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-1 bg-[#3525cd] h-2.5 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                      <div className="w-1 bg-[#3525cd] h-4.5 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#1b1b24]">RECORDING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative z-10 border-t border-[#e4e1ee]/50 bg-[#faf8fe] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#3525cd]/3 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#00687a]/3 blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-20 relative">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3525cd]/10 text-[#3525cd] rounded-full border border-[#3525cd]/20">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Simplicity in Action</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b1b24] tracking-tight">
              Get Interview-Ready in <span className="text-[#3525cd]">4 Easy Steps</span>
            </h2>
            <p className="text-[#464555] font-semibold text-sm max-w-xl mx-auto leading-relaxed">
              Our advanced AI platform mirrors actual corporate hiring loops. Learn the simple flow to transform your preparation from stressful to seamless.
            </p>
          </div>

          {/* Interactive Steps Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Interactive Steps List */}
            <div className="lg:col-span-5 space-y-4">
              {steps.map((step, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    activeStep === idx 
                      ? 'bg-white border-[#3525cd] shadow-lg shadow-[#3525cd]/5 translate-x-2' 
                      : 'bg-white/40 border-[#e4e1ee]/60 hover:bg-white/70 hover:border-[#3525cd]/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 ${
                      activeStep === idx 
                        ? 'bg-[#3525cd] text-white shadow-md shadow-[#3525cd]/25' 
                        : 'bg-[#e4e1ee]/50 text-[#464555]'
                    }`}>
                      0{idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className={`font-bold text-base transition-colors ${
                        activeStep === idx ? 'text-[#3525cd]' : 'text-[#1b1b24]'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#464555] leading-relaxed font-semibold">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Interactive Canvas Preview */}
            <div className="lg:col-span-7 flex justify-center items-center min-h-[420px]">
              <div className="w-full max-w-xl h-full aspect-[4/3] landing-glass rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between border-2 border-white/60 shadow-2xl transition-all duration-500">
                {/* Floating dynamic backdrop glow matching the step */}
                <div className="absolute -inset-10 pointer-events-none opacity-20 blur-3xl transition-all duration-500"
                     style={{
                       background: `radial-gradient(circle at 50% 50%, ${steps[activeStep].color} 0%, rgba(255, 255, 255, 0) 70%)`
                     }}
                />

                {/* Render active mockup representation */}
                <div className="w-full h-full flex flex-col justify-center items-center relative z-10 transition-opacity duration-300">
                  {renderMockup()}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-12 md:px-20 flex flex-col md:flex-row justify-between items-center bg-[#f0ecf9] border-t border-[#e4e1ee]/50 relative z-10">
        <div className="flex flex-col gap-2 mb-4 md:mb-0 text-center md:text-left">
          <span 
            onClick={() => navigate('/')} 
            className="text-lg font-black text-[#3525cd] tracking-tight cursor-pointer"
          >
            PrepAI
          </span>
          <p className="text-xs text-[#464555] font-semibold">© 2024 PrepAI. Empowering your next career move.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-xs text-[#464555] font-semibold hover:text-[#3525cd] transition-colors" href="#">Privacy Policy</a>
          <a className="text-xs text-[#464555] font-semibold hover:text-[#3525cd] transition-colors" href="#">Terms of Service</a>
          <a className="text-xs text-[#464555] font-semibold hover:text-[#3525cd] transition-colors" href="#">Cookie Policy</a>
          <a className="text-xs text-[#464555] font-semibold hover:text-[#3525cd] transition-colors" href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
