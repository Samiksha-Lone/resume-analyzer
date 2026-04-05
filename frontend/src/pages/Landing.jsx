import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Target, 
  Upload, 
  BrainCircuit,
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
                <BrainCircuit className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
               Hire<span className="text-[#00BFFF]">Metric</span>
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
                  <Moon className="w-4 h-4 transition-colors group-hover:text-indigo-400" />
                )}
             </button>

             {!isAuthenticated && (
               <Link to="/login" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-[#00BFFF] transition-colors">
                 Sign In
               </Link>
             )}
             <Button 
                variant="primary" 
                size="sm" 
                onClick={handleStart}
                className="rounded-lg px-5 bg-[#00BFFF] hover:bg-[#009acd] text-white border-none shadow-sm shadow-[#00BFFF]/20"
             >
                {isAuthenticated ? 'Dashboard' : 'Get Started'}
             </Button>
          </div>
        </div>
      </nav>

      <main className="pt-16 pb-12">
        
        {/* --- Hero Section --- */}
        <section className="px-6 py-12 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left side text */}
            <div className="space-y-6">
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-block"
              >
                <div className="px-4 py-2 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center gap-2 w-fit">
                  <Zap className="w-4 h-4 text-[#00BFFF]" />
                  <span className="text-sm font-medium text-[#00BFFF]">AI-Powered Resume Analysis</span>
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-white leading-[1.15]"
              >
                Land Your <br/>
                <span className="text-[#00BFFF]">Dream Job</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="max-w-lg text-lg leading-relaxed text-stone-600 dark:text-stone-400"
              >
                Get AI-powered analysis of your resume, detailed ATS scoring, skill gap insights, and personalized learning roadmaps to improve your hiring chances.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col gap-4 pt-4 sm:flex-row"
              >
                <Button 
                  onClick={handleStart}
                  className="bg-[#00BFFF] hover:bg-[#009acd] text-white border-none rounded-lg px-7 py-3 text-base font-semibold shadow-md shadow-[#00BFFF]/30 hover:shadow-lg hover:shadow-[#00BFFF]/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Resume
                </Button>
                <Button 
                  onClick={() => navigate('/analyze')}
                  className="bg-white dark:bg-[#262626] text-stone-900 dark:text-white border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-[#333] rounded-lg px-7 py-3 text-base font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Try Now
                </Button>
              </motion.div>
            </div>
            
            {/* Right side: Interactive UI Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Glow effect background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00BFFF]/20 to-purple-500/20 rounded-3xl blur-3xl opacity-40"></div>
              
              <div className="relative bg-white dark:bg-[#262626] rounded-2xl p-6 shadow-lg border border-stone-100 dark:border-white/10">
                {/* Score Header */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100 dark:border-white/5">
                   <div>
                     <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400">Resume Score</p>
                     <div className="flex items-end gap-2">
                       <h3 className="text-4xl font-black text-stone-900 dark:text-white">87<span className="text-xl font-bold text-stone-400">%</span></h3>
                       <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">+12% Better</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="mb-2 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400">ATS Score</p>
                     <div className="w-14 h-14 rounded-full border-4 border-[#00BFFF] flex items-center justify-center bg-[#00BFFF]/10 text-[#00BFFF] font-bold">
                        92%
                     </div>
                   </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Skills Match', value: '85%', color: 'emerald' },
                    { label: 'Experience', value: '90%', color: 'blue' },
                    { label: 'Format', value: '95%', color: 'purple' }
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-lg bg-stone-50 dark:bg-[#1C1C1C] border border-stone-100 dark:border-white/5 text-center">
                      <p className="mb-1 text-xs font-medium text-stone-500 dark:text-stone-400">{stat.label}</p>
                      <p className="text-lg font-bold text-stone-900 dark:text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Top Suggestions */}
                <div className="mb-6 space-y-3">
                  <p className="text-xs font-bold tracking-wide uppercase text-stone-900 dark:text-white text-stone-500">Improvements</p>
                  {[
                    { icon: Star, text: 'Add achievements with metrics' },
                    { icon: Zap, text: 'Use stronger action verbs' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-stone-50 dark:bg-[#1C1C1C] border border-stone-100 dark:border-white/5 flex items-start gap-3">
                      <item.icon className="w-4 h-4 text-[#00BFFF] shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{item.text}</p>
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
        <section className="px-6 py-12 mx-auto max-w-7xl">
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: BarChart, title: "Smart Scoring", desc: "AI-powered analysis of your resume" },
                { icon: Target, title: "Skill Analysis", desc: "Identify gaps for target roles" },
                { icon: Lightbulb, title: "AI Suggestions", desc: "Actionable improvement tips" },
                { icon: Rocket, title: "Career Path", desc: "2-week learning roadmaps" }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="p-6 rounded-xl bg-white dark:bg-[#262626] border border-stone-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] flex items-center justify-center mb-4">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white">{feat.title}</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">{feat.desc}</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* --- How it Works --- */}
        <section className="px-6 py-12 mx-auto max-w-7xl">
           <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl text-stone-900 dark:text-white">How It Works</h2>
              <p className="text-lg text-stone-600 dark:text-stone-400">Three simple steps to land your next interview</p>
           </div>

           <div className="relative grid gap-8 md:grid-cols-3">
              {/* Decorative connecting line for desktop */}
              <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-[#00BFFF]/20 via-[#00BFFF]/50 to-[#00BFFF]/20 z-0"></div>

              {[
                { num: "1", icon: Upload, title: "Upload", desc: "Drop your resume in any format" },
                { num: "2", icon: BrainCircuit, title: "Analyze", desc: "AI instantly scores your document" },
                { num: "3", icon: TrendingUp, title: "Improve", desc: "Follow actionable recommendations" }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                   <div className="w-20 h-20 rounded-full bg-white dark:bg-[#262626] border-4 border-[#f8fafc] dark:border-[#1C1C1C] shadow-md flex items-center justify-center mb-5 relative">
                      <step.icon className="w-7 h-7 text-[#00BFFF]" />
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#00BFFF] text-white text-xs font-bold flex items-center justify-center">
                        {step.num}
                      </div>
                   </div>
                   <h4 className="mb-2 text-lg font-bold text-stone-900 dark:text-white">{step.title}</h4>
                   <p className="text-sm text-stone-600 dark:text-stone-400">{step.desc}</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* --- Results Preview Section --- */}
        <section className="px-6 py-12 mx-auto max-w-7xl">
           <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl text-stone-900 dark:text-white">What You'll Get</h2>
              <p className="text-lg text-stone-600 dark:text-stone-400">Comprehensive insights that actually help</p>
           </div>

           <div className="grid gap-6 md:grid-cols-3">
              {[
                { 
                  icon: BarChart, 
                  title: "Detailed Score", 
                  desc: "Get your resume score with breakdown by different criteria - content, format, ATS compatibility" 
                },
                { 
                  icon: Target, 
                  title: "Skill Gap Analysis", 
                  desc: "See which skills are missing for your target role and get specific recommendations to acquire them" 
                },
                { 
                  icon: BookOpen, 
                  title: "Learning Paths", 
                  desc: "Get a 2-week personalized roadmap to improve your skills and make yourself more marketable" 
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-white to-stone-50 dark:from-[#262626] dark:to-[#1C1C1C] border border-stone-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </section>



        {/* --- CTA Section --- */}
        <section className="max-w-5xl px-6 py-16 mx-auto">
           <div className="relative overflow-hidden bg-gradient-to-br from-[#00BFFF]/10 via-transparent to-purple-500/10 rounded-2xl border border-[#00BFFF]/20 p-12 md:p-16 text-center">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00BFFF]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl"></div>
              
              <div className="relative z-10">
                 <h2 className="mb-4 text-3xl font-bold md:text-4xl text-stone-900 dark:text-white">Improve Your Resume Today</h2>
                 <p className="max-w-2xl mx-auto mb-8 text-lg text-stone-600 dark:text-stone-400">Get instant AI-powered analysis, beat ATS systems, discover skill gaps, and follow a personalized learning plan to improve your candidacy.</p>
                 <div className="flex flex-col justify-center gap-4 sm:flex-row">
                   <Button 
                      onClick={handleStart}
                      className="bg-[#00BFFF] hover:bg-[#009acd] text-white border-none rounded-lg px-8 py-3 text-base font-semibold shadow-lg shadow-[#00BFFF]/30 hover:shadow-xl flex items-center justify-center gap-2 transition-all"
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
      <footer className="py-10 border-t border-stone-200 dark:border-white/5 bg-white dark:bg-[#1C1C1C]">
         <div className="flex flex-col items-center justify-between gap-6 px-6 mx-auto max-w-7xl md:flex-row">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#00BFFF] flex items-center justify-center">
                  <BrainCircuit className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-stone-900 dark:text-white">HireMetric</span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400">
               © {new Date().getFullYear()} HireMetric. All rights reserved.
            </p>
         </div>
      </footer>

    </div>
  );
};

export default Landing;
