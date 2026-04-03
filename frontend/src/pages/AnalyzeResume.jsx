import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BrainCircuit,
  Activity
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useResumes } from '../context/ResumeContext';

const AnalyzeResume = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [file, setFile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const { uploadResume, analyzeResume, fetchAnalysisStatus, setAnalysisResults, isLoading: isUploading } = useResumes();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      setIsAnalyzing(true);
      setAnalysisStatus('Uploading resume...');
      
      // 1. Upload
      const savedResume = await uploadResume(file);
      
      setAnalysisStatus('Initiating AI Logic Engine...');
      
      // 2. Queue Analysis
      const jobData = await analyzeResume(savedResume.resumeId, jobDescription, githubUsername);
      const jobId = jobData.jobId;
      
      setAnalysisStatus('Neural parsing in progress...');
      
      // 3. Poll for status
      const poll = setInterval(async () => {
        const statusData = await fetchAnalysisStatus(jobId);
        if (!statusData || typeof statusData.status === 'undefined') {
          clearInterval(poll);
          setIsAnalyzing(false);
          alert('Analysis failed: No status response from server.');
          return;
        }

        if (statusData.status === 'analyzing') {
          setAnalysisStatus('Calculating semantic match and project depth...');
        } else if (statusData.status === 'completed') {
          clearInterval(poll);
          setAnalysisStatus('Finalizing audit report...');
          setAnalysisResults(statusData.result.analysis);
          setTimeout(() => {
            setIsAnalyzing(false);
            navigate('/results');
          }, 800);
        } else if (statusData.status === 'failed') {
          clearInterval(poll);
          setIsAnalyzing(false);
          alert('Analysis failed: ' + (statusData.error || 'Unknown error'));
        }
      }, 2000);

    } catch (err) {
      console.error("Analysis failed:", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-stone-200 dark:border-white/10 shadow-sm">
             <BrainCircuit className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-stone-900 dark:text-white">Analyze Your Resume</h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-1">Ready to get your professional score? Upload everything below.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-tighter hover:bg-accent/20 transition-colors">
          <Activity className="w-3 h-3" />
          <span>Live Analysis</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column: Upload Forms */}
        <div className="space-y-10">
          <Card className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden shadow-sm">
            <CardContent className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-stone-400" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tighter dark:text-white">Professional Profile</h3>
                </div>
                
                <div 
                  className={`relative border-2 border-dashed rounded-[32px] p-10 text-center transition-all duration-300 group ${
                    file 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : 'border-stone-200 dark:border-white/5 hover:border-accent/40 bg-stone-50 dark:bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                  />
                  
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/10">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-lg dark:text-white tracking-tight">{file.name}</p>
                           <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="p-1 rounded-full hover:bg-rose-500/10 transition-colors">
                              <X className="w-4 h-4 text-rose-500" />
                           </button>
                        </div>
                        <p className="text-xs text-emerald-500/60 font-black uppercase tracking-tighter">Ready for analysis</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-16 h-16 bg-stone-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-stone-400 group-hover:text-accent" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold tracking-tight dark:text-white">Upload Resume</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Standard PDF or Word format (Max 5MB)</p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-6 border-t border-stone-100 dark:border-white/5 pt-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center">
                    <Target className="w-4 h-4 text-stone-400" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tighter dark:text-white">GitHub Verification (Optional)</h3>
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    placeholder="Enter GitHub Username..."
                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-2xl py-4 pl-10 pr-6 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-inner"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-6 border-t border-stone-100 dark:border-white/5 pt-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-stone-400" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tighter dark:text-white">Job Description</h3>
                </div>
                <textarea
                  placeholder="Paste the job description here..."
                  className="w-full h-32 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-[32px] p-6 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all resize-none shadow-inner"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow simulation */}
        <div className="space-y-10">
          <div className="p-12 rounded-[40px] bg-accent text-white space-y-10 relative overflow-hidden shadow-2xl shadow-accent/20 border-none group">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">How it works</h2>
              <div className="space-y-10 flex-grow">
                {[
                  { step: "01", title: "Smart Resume Parsing", desc: "We extract your skills, experience, and important keywords." },
                  { step: "02", title: "Readability Check", desc: "We check if your resume sounds natural and professional." },
                  { step: "03", title: "Job Match Analysis", desc: "We compare your profile against industry standards." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group cursor-default">
                    <span className="text-accent-foreground font-black text-xs pt-1.5 opacity-40 group-hover:opacity-100 transition-all tracking-tighter font-mono">{item.step}</span>
                    <div className="space-y-2">
                      <p className="font-bold text-lg tracking-tight mb-1">{item.title}</p>
                      <p className="text-white/60 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-12 mt-auto">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full bg-white text-accent hover:bg-stone-50 border-none py-8 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] h-16 shadow-xl"
                  onClick={handleAnalyze}
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-3">
                       <Activity className="pulse-slow" /> 
                       Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3 group">
                       Analyze Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Reflection overlays */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-colors"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-colors"></div>
          </div>

          <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 p-12 overflow-hidden relative shadow-sm">
             <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-amber-500" />
                   </div>
                   <h3 className="font-bold text-2xl tracking-tighter dark:text-white">Privacy & Security</h3>
                </div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
                  Your data is processed securely and is never stored for commercial training.
                </p>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500/80">Privacy Assured</span>
                </div>
             </div>
             
             {/* Simple lines background */}
             <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-current"></div>
                <div className="absolute top-1/4 left-0 w-full h-px bg-current"></div>
                <div className="absolute top-2/4 left-0 w-full h-px bg-current"></div>
                <div className="absolute top-3/4 left-0 w-full h-px bg-current"></div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 dark:bg-[#1C1C1C]/95 backdrop-blur-md"
          >
            <div className="text-center space-y-12 max-w-sm px-6">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-stone-100 dark:border-white/5 rounded-full mx-auto"></div>
                  <div className="absolute inset-0 w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-accent animate-pulse" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-bold tracking-tighter dark:text-white">Analyzing...</h3>
                  <p className="text-sm font-medium text-stone-500 dark:text-stone-400 animate-pulse">{analysisStatus}</p>
               </div>
               <div className="pt-8 border-t border-stone-100 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 dark:text-stone-700">HireMetric Engine v2.0</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyzeResume;
