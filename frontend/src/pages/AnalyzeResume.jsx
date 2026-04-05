import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  X,
  Target,
  BrainCircuit,
  BarChart,
  Lightbulb,
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
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [targetSkills, setTargetSkills] = useState('');
  const { uploadResume, analyzeResume, matchResume, fetchAnalysisStatus, setAnalysisResults, isLoading: isUploading } = useResumes();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a resume file first.");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      alert("Please provide a more detailed Job Description (at least 50 characters). This helps the AI provide more accurate matching insights.");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("The uploaded file is too large. Please keep your resume under 5MB.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisStatus('Uploading resume...');
      
      const savedResume = await uploadResume(file);
      setAnalysisStatus('Analyzing document...');
      
      const resumeId = savedResume?.resumeId || savedResume?._id;
      if (!resumeId) throw new Error("Resume upload failed.");

      const jobData = await analyzeResume(
        resumeId,
        jobDescription,
        jobTitle,
        targetSkills.split(',').map(skill => skill.trim()).filter(Boolean)
      );
      const jobId = jobData.jobId;
      
      const poll = setInterval(async () => {
        const statusData = await fetchAnalysisStatus(jobId);
        if (!statusData || !statusData.status) {
          clearInterval(poll);
          setIsAnalyzing(false);
          alert('Analysis failed: Server error.');
          return;
        }

        if (statusData.status === 'analyzing') {
          setAnalysisStatus('Generating insights...');
        } else if (statusData.status === 'completed') {
          clearInterval(poll);
          setAnalysisResults(statusData.result.analysis);
          setIsAnalyzing(false);
          navigate('/results');
        } else if (statusData.status === 'failed') {
          clearInterval(poll);
          setIsAnalyzing(false);
          alert('Analysis failed: ' + (statusData.error || 'Unknown error'));
        }
      }, 2000);

    } catch (err) {
      console.error("Analysis failed:", err);
      setIsAnalyzing(false);
      alert(err.message || "An unexpected error occurred.");
    }
  };

  const handleMatch = async () => {
    if (!file) {
      alert("Please upload a resume file first.");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      alert("Please provide a more detailed Job Description (at least 50 characters).");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("The uploaded file is too large. Please keep your resume under 5MB.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisStatus('Uploading resume...');
      const savedResume = await uploadResume(file);
      setAnalysisStatus('Matching resume...');

      const resumeId = savedResume?.resumeId || savedResume?._id;
      if (!resumeId) throw new Error("Resume upload failed.");

      const result = await matchResume(resumeId, jobDescription, jobTitle, targetSkills.split(',').map(skill => skill.trim()).filter(Boolean));
      setAnalysisResults(result);
      setIsAnalyzing(false);
      navigate('/results');
    } catch (err) {
      console.error("Match failed:", err);
      setIsAnalyzing(false);
      alert(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="pb-20 space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
      
      <div className="pb-6 border-b border-stone-200 dark:border-white/5">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Analyze Your Resume</h1>
        <p className="mt-2 text-sm font-medium text-stone-500 dark:text-stone-400">Upload your resume and the target job description to get instant feedback.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Upload Forms */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
            <CardContent className="p-8 space-y-8">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-stone-400" />
                  <h3 className="font-semibold text-stone-900 dark:text-white">1. Upload Resume</h3>
                </div>
                
                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-stone-200 dark:border-white/10 hover:border-[#00BFFF]/40 bg-stone-50 dark:bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <div className="flex items-center gap-2">
                         <p className="font-semibold text-stone-900 dark:text-white">{file.name}</p>
                         <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="transition-colors hover:text-rose-500 text-stone-400">
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-6 h-6 mx-auto text-stone-400" />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-white">Click or drag file here</p>
                        <p className="mt-1 text-xs text-stone-500">PDF or DOCX (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-stone-400" />
                  <h3 className="font-semibold text-stone-900 dark:text-white">2. Job Description</h3>
                </div>
                <textarea
                  placeholder="Paste the target role description here..."
                  className="w-full h-40 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#00BFFF]/50 focus:ring-1 focus:ring-[#00BFFF]/30 text-sm font-medium text-stone-900 dark:text-white transition-all resize-none shadow-inner"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-900 dark:text-white">Target Job Title</label>
                  <input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Product Manager"
                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00BFFF]/50 focus:ring-1 focus:ring-[#00BFFF]/30 text-sm text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-900 dark:text-white">Target Skills</label>
                  <input
                    value={targetSkills}
                    onChange={(e) => setTargetSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, AWS"
                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00BFFF]/50 focus:ring-1 focus:ring-[#00BFFF]/30 text-sm text-stone-900 dark:text-white"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow simulation */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm h-full flex flex-col">
            <CardContent className="flex flex-col flex-1 h-full p-8">
              
              <h2 className="mb-2 text-xl font-bold text-stone-900 dark:text-white">What you'll get</h2>
              <p className="mb-8 text-sm text-stone-500 dark:text-stone-400">Instant, actionable analysis powered by AI.</p>
              
              <div className="flex-1 space-y-6">
                {[
                  { icon: BarChart, title: "ATS Score", desc: "See how software will filter your resume." },
                  { icon: Target, title: "Skill Gap Analysis", desc: "Find exactly what keywords you are missing." },
                  { icon: Lightbulb, title: "Improvement Suggestions", desc: "Get AI-generated rewrites for weak bullet points." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 cursor-default">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-stone-100 dark:bg-white/5">
                      <item.icon className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="w-full pt-8 mt-auto border-t border-stone-100 dark:border-white/5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button 
                    variant="primary" 
                    className="w-full bg-[#00BFFF] hover:bg-[#009acd] text-white border-none py-4 rounded-xl font-bold shadow-sm"
                    onClick={handleAnalyze}
                    disabled={!file || isUploading}
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                         <Activity className="w-4 h-4 animate-spin" /> 
                         Processing...
                      </span>
                    ) : (
                      "Analyze Resume"
                    )}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full bg-white dark:bg-[#262626] text-stone-900 dark:text-white border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-[#333] rounded-xl py-4 font-bold shadow-sm"
                    onClick={handleMatch}
                    disabled={!file || isUploading}
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                         <Activity className="w-4 h-4 animate-spin" /> 
                         Processing...
                      </span>
                    ) : (
                      "Quick Match"
                    )}
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Simple Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 dark:bg-[#1C1C1C]/95 backdrop-blur-sm"
          >
            <div className="max-w-sm px-6 space-y-6 text-center">
               <BrainCircuit className="mx-auto w-12 h-12 text-[#00BFFF] animate-pulse" />
               <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-stone-900 dark:text-white">Analyzing</h3>
                  <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{analysisStatus}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyzeResume;
