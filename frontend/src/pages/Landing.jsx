import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Target, 
  Upload, 
  BarChart,
  Lightbulb,
  Rocket,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  BookOpen,
  FileText,
  Star
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/ui/Logo';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleStart = () => {
    navigate(isAuthenticated ? '/dashboard' : '/signup');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#1C1C1C] transition-colors duration-300 font-sans text-stone-900 dark:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1C1C1C]/80 backdrop-blur-md border-b border-stone-200 dark:border-white/5 h-16">
        <div className="flex items-center justify-between h-full px-6 mx-auto max-w-7xl">
          <Link to="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-[#00BFFF] flex items-center justify-center">
                <Logo className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
               Score<span className="text-[#00BFFF]">Sync</span>
             </span>
          </Link>

          <div className="flex items-center gap-6">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-stone-100 dark:bg-[#262626] border border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all shadow-sm group"
             >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 transition-colors group-hover:text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 transition-colors group-hover:text-[#00BFFF]" />
                )}
             </button>

             {!isAuthenticated && (
               <Link to="/login" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-[#00BFFF] transition-colors">
                 Sign In
               </Link>
             )}
             <Button 
                variant="primary" 
                size="md" 
                onClick={handleStart}
                className="rounded-xl px-5 py-2.5 bg-[#00BFFF] hover:bg-[#009acd] text-white border-none shadow-sm"
             >
                {isAuthenticated ? 'Dashboard' : 'Get Started'}
             </Button>
          </div>
        </div>
      </nav>

      <main className="pt-16 pb-12">
        
        {/* --- Hero Section --- */}
        <section className="px-6 py-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left side text */}
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-block"
              >
                <div className="px-3 py-1.5 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center gap-2 w-fit">
                  <Zap className="w-3 h-3 text-[#00BFFF]" />
                  <span className="text-xs font-medium text-[#00BFFF]">AI-Powered Resume Analysis</span>
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-white leading-[1.1]"
              >
                Land Your <br/>
                <span className="text-[#00BFFF]">Dream Job</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-400"
              >
                Get AI-powered analysis of your resume, detailed ATS scoring, skill gap insights, and personalized learning roadmaps.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col gap-3 pt-2 sm:flex-row"
              >
                <Button 
                  onClick={handleStart}
                  className="bg-[#00BFFF] hover:bg-[#009acd] text-white border-none rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Resume
                </Button>
                <Button 
                  onClick={() => navigate('/analyze')}
                  className="bg-white dark:bg-[#262626] text-stone-900 dark:text-white border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-[#333] rounded-lg px-6 py-2.5 text-sm font-semibold"
                >
                  Try Now
                </Button>
              </motion.div>
            </div>
            
            {/* Right side: Interactive UI Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:scale-95"
            >
              <div className="relative bg-white dark:bg-[#262626] rounded-2xl p-5 shadow-lg border border-stone-100 dark:border-white/10">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-white/5">
                   <div>
                     <p className="mb-0.5 text-[10px] font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400">Resume Score</p>
                     <div className="flex items-end gap-1.5">
                       <h3 className="text-3xl font-black text-stone-900 dark:text-white">87<span className="text-lg font-bold text-stone-400">%</span></h3>
                       <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">+12%</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="mb-1 text-[10px] font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400">ATS Score</p>
                     <div className="w-10 h-10 rounded-full border-2 border-[#00BFFF] flex items-center justify-center bg-[#00BFFF]/10 text-[#00BFFF] font-bold text-xs">
                        92%
                     </div>
                   </div>
                 </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Skills Match', value: '85%', color: 'emerald' },
                    { label: 'Experience', value: '90%', color: 'blue' },
                    { label: 'Format', value: '95%', color: 'blue' }
                  ].map((stat, i) => (
                    <div key={i} className="p-2 rounded-lg bg-stone-50 dark:bg-[#1C1C1C] border border-stone-100 dark:border-white/5 text-center">
                      <p className="mb-0.5 text-[10px] font-medium text-stone-500 dark:text-stone-400">{stat.label}</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4 space-y-2">
                  <p className="text-[10px] font-bold tracking-wide uppercase text-stone-500">Improvements</p>
                  {[
                    { icon: Star, text: 'Add achievements with metrics' },
                    { icon: Zap, text: 'Use stronger action verbs' }
                  ].map((item, i) => (
                    <div key={i} className="p-2 rounded-lg bg-stone-50 dark:bg-[#1C1C1C] border border-stone-100 dark:border-white/5 flex items-start gap-2">
                      <item.icon className="w-3 h-3 text-[#00BFFF] shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-stone-700 dark:text-stone-300">{item.text}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                   <p className="mb-3 text-xs font-bold tracking-wide uppercase text-stone-900 dark:text-white text-stone-500">Top Skills Found</p>
                   <div className="flex flex-wrap gap-2">
                     {[
                       { name: 'React.js', match: true },
                       { name: 'Node.js', match: true },
                       { name: 'TypeScript', match: true },
                       { name: 'MongoDB', match: false }
                     ].map((skill, i) => (
                       <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                         skill.match 
                           ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                           : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                       }`}>
                         {skill.match ? '✓' : '○'} {skill.name}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- Features Grid --- */}
        <section className="px-6 py-8 mx-auto max-w-7xl">
           <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: BarChart, title: "Smart Scoring", desc: "AI analysis" },
                { icon: Target, title: "Skill Analysis", desc: "Identify gaps" },
                { icon: Lightbulb, title: "AI Suggestions", desc: "Actionable tips" },
                { icon: Rocket, title: "Career Path", desc: "2-week roadmaps" }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="p-4 rounded-xl bg-white dark:bg-[#262626] border border-stone-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] flex items-center justify-center mb-3">
                    <feat.icon className="w-4 h-4" />
                  </div>
                  <h3 className="mb-1 text-base font-bold text-stone-900 dark:text-white">{feat.title}</h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">{feat.desc}</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* --- How it Works --- */}
        <section className="px-6 py-10 mx-auto max-w-7xl">
           <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold md:text-4xl text-stone-900 dark:text-white">How It Works</h2>
              <p className="text-base text-stone-600 dark:text-stone-400">Three simple steps to land your next interview</p>
           </div>

           <div className="relative grid gap-6 md:grid-cols-3">
              <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#00BFFF]/20 via-[#00BFFF]/50 to-[#00BFFF]/20 z-0"></div>

              {[
                { num: "1", icon: Upload, title: "Upload", desc: "Drop your resume" },
                { num: "2", icon: Logo, title: "Analyze", desc: "Get instant scores" },
                { num: "3", icon: TrendingUp, title: "Improve", desc: "Follow roadmap" }
              ].map((step, i) => (
                <div 
                  key={i}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                   <div className="w-16 h-16 rounded-full bg-white dark:bg-[#262626] border-2 border-stone-100 dark:border-white/5 shadow-sm flex items-center justify-center mb-4 relative transition-transform group-hover:scale-110">
                      <step.icon className="w-6 h-6 text-[#00BFFF]" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#00BFFF] text-white text-[10px] font-bold flex items-center justify-center">
                        {step.num}
                      </div>
                   </div>
                   <h4 className="mb-1 text-base font-bold text-stone-900 dark:text-white">{step.title}</h4>
                   <p className="text-xs text-stone-600 dark:text-stone-400">{step.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* --- Deep Dive Metrics --- */}
        <section className="px-6 py-12 mx-auto max-w-7xl bg-stone-50/50 dark:bg-white/5 rounded-[2rem] my-8">
           <div className="mb-10 text-center">
              <h2 className="mb-2 text-2xl font-bold md:text-4xl text-stone-900 dark:text-white">Beyond Just a Score</h2>
              <p className="max-w-xl mx-auto text-sm text-stone-600 dark:text-stone-400">Honest dimensions to help you understand your resume's performance.</p>
           </div>

           <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                 {[
                   { 
                     title: "Readiness Score", 
                     desc: "Measures overall maturity. We check for bullet depth and formatting.",
                     icon: Rocket 
                   },
                   { 
                     title: "Job Match Score", 
                     desc: "A pure keyword analysis. We compare your skills against the JD.",
                     icon: Target 
                   }
                 ].map((metric, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-[#262626] border border-stone-100 dark:border-white/10 shadow-sm flex items-center justify-center text-[#00BFFF]">
                         <metric.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="mb-1 text-lg font-bold text-stone-900 dark:text-white">{metric.title}</h4>
                         <p className="text-sm text-stone-600 dark:text-stone-400 leading-snug">{metric.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="space-y-6">
                 {[
                   { 
                     title: "Reality Check", 
                     desc: "Detects 'keyword stuffing' and penalizes resumes that sacrifice readability.",
                     icon: Star 
                   },
                   { 
                     title: "Authenticity Analysis", 
                     desc: "Uses linguistic patterns to detect AI phrasing. Ensures your resume feels personal.",
                     icon: Zap 
                   }
                 ].map((metric, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-[#262626] border border-stone-100 dark:border-white/10 shadow-sm flex items-center justify-center text-[#00BFFF]">
                         <metric.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="mb-1 text-lg font-bold text-stone-900 dark:text-white">{metric.title}</h4>
                         <p className="text-sm text-stone-600 dark:text-stone-400 leading-snug">{metric.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- Version Comparison Section --- */}
        <section className="px-6 py-10 mx-auto max-w-7xl">
           <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                 <div className="relative p-1.5 bg-stone-200 dark:bg-white/10 rounded-2xl">
                    <div className="overflow-hidden bg-white dark:bg-[#1C1C1C] rounded-xl border border-stone-200 dark:border-white/5 shadow-xl">
                       <div className="p-3 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-900 dark:text-white uppercase tracking-widest">Version Comparison</span>
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                       </div>
                       <div className="p-5 space-y-3">
                          <div className="h-10 w-full bg-stone-50 dark:bg-white/5 rounded-lg border border-stone-100 dark:border-white/5 flex items-center px-3 justify-between">
                             <span className="text-[10px] font-medium text-stone-500">March 28 Snapshot</span>
                             <span className="text-xs font-bold text-stone-900 dark:text-white">76%</span>
                          </div>
                          <div className="h-10 w-full bg-[#00BFFF]/5 rounded-lg border border-[#00BFFF]/20 flex items-center px-3 justify-between">
                             <span className="text-[10px] font-bold text-[#00BFFF]">April 15 Snapshot</span>
                             <span className="text-xs font-black text-[#00BFFF]">84% (+8%)</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="order-1 lg:order-2 space-y-4">
                 <h2 className="text-2xl font-bold md:text-4xl text-stone-900 dark:text-white leading-tight">Track Your Progress, <br/><span className="text-[#00BFFF]">Don't Guess.</span></h2>
                 <p className="text-base text-stone-600 dark:text-stone-400">
                    Compare different versions of your resume to see exactly how your latest edits affected your ranking in real-time.
                 </p>
                 <ul className="space-y-2">
                    {["A/B test versions", "Track edit impact", "Avoid over-optimization"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 font-medium">
                         <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <TrendingUp className="w-2.5 h-2.5" />
                         </div>
                         {item}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </section>

        {/* --- Honest FAQ Section --- */}
        <section className="px-6 py-10 mx-auto max-w-5xl">
           <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold md:text-4xl text-stone-900 dark:text-white">Honest Answers</h2>
           </div>
           
           <div className="grid gap-4 md:grid-cols-2">
              {[
                { 
                  q: "Is my data private and secure?", 
                  a: "Yes. Resumes are processed via Gemini AI and stored securely. We never sell your data." 
                },
                { 
                  q: "How accurate is the ATS scoring?", 
                  a: "Our logic matches 90%+ of major ATS providers like Greenhouse and Lever." 
                },
                { 
                  q: "Can I use it for any industry?", 
                  a: "Yes. Readiness and Reality metrics apply to all professional roles globally." 
                },
                { 
                  q: "Is the analysis truly instant?", 
                  a: "Typically 10-15 seconds. High-complexity resumes may take slightly longer for deep analysis." 
                }
              ].map((faq, i) => (
                <div key={i} className="p-5 rounded-xl bg-white dark:bg-[#262626] border border-stone-100 dark:border-white/5">
                   <h4 className="mb-2 text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]" />
                      {faq.q}
                   </h4>
                   <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pl-3 border-l border-[#00BFFF]/20">{faq.a}</p>
                </div>
              ))}
           </div>
        </section>
        {/* --- CTA Section --- */}
        <section className="max-w-4xl px-6 py-10 mx-auto">
           <div className="relative overflow-hidden bg-white dark:bg-[#262626] rounded-2xl border border-stone-100 dark:border-white/10 p-10 text-center shadow-sm">
              {/* Removed glow blur elements */}
              
              <div className="relative z-10">
                 <h2 className="mb-4 text-3xl font-bold md:text-4xl text-stone-900 dark:text-white">Improve Your Resume Today</h2>
                 <p className="max-w-2xl mx-auto mb-8 text-lg text-stone-600 dark:text-stone-400">Get instant AI-powered analysis, beat ATS systems, discover skill gaps, and follow a personalized learning plan to improve your candidacy.</p>
                 <div className="flex flex-col justify-center gap-4 sm:flex-row">
                   <Button 
                      onClick={handleStart}
                      className="bg-[#00BFFF] hover:bg-[#009acd] text-white border-none rounded-lg px-8 py-3 text-base font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
                   >
                      <Upload className="w-4 h-4" />
                      Analyze Your Resume
                   </Button>
                   {!isAuthenticated && (
                     <Button 
                        onClick={() => navigate('/signup')}
                        className="bg-white dark:bg-[#262626] text-stone-900 dark:text-white border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-[#333] rounded-lg px-8 py-3 text-base font-semibold shadow-sm transition-all"
                     >
                        Create Account
                     </Button>
                   )}
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* --- Minimal Footer --- */}
      <footer className="py-6 border-t border-stone-200 dark:border-white/5 bg-white dark:bg-[#1C1C1C]">
         <div className="flex flex-col items-center justify-between gap-6 px-6 mx-auto max-w-7xl md:flex-row">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#00BFFF] flex items-center justify-center">
                  <Logo className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-stone-900 dark:text-white">ScoreSync</span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400">
               © {new Date().getFullYear()} ScoreSync. All rights reserved.
            </p>
         </div>
      </footer>

    </div>
  );
};

export default Landing;
