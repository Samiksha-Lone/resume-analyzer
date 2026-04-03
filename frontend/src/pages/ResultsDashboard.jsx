import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Target,
  BrainCircuit,
  Zap,
  Sparkles,
  Search,
  Timer,
  PieChart,
  Activity
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import LearningRoadmap from '../components/dashboard/LearningRoadmap';
import { useNavigate } from 'react-router-dom';
import { useResumes } from '../context/ResumeContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { generateAtsResume } from '../utils/pdfGenerator';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ResultsDashboard = () => {
  const navigate = useNavigate();
  const { analysisResults, currentResume } = useResumes();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Implement Export functionality
  const handleExport = () => {
    if (!analysisResults) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisResults, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hiremetric_audit_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportAts = () => {
    if (currentResume?.extractedText) {
      generateAtsResume(currentResume.extractedText, analysisResults?.rewriteSuggestions);
    } else {
      alert("No extracted text found for this resume.");
    }
  };

  // Implement Share functionality
  const handleShare = async () => {
    const score = Math.round(analysisResults?.aiScore || analysisResults?.baseScore || 0);
    const textToShare = `My resume just scored ${score}% ATS pass probability on HireMetric!`;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Resume Audit',
          text: textToShare,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(`${textToShare} ${url}`);
        alert('Audit summary copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Map backend results to UI scores
  const scores = [
    { 
      label: "Reality Check Score", 
      value: analysisResults?.realityCheck?.score || 0, 
      variant: "warning", 
      desc: analysisResults?.realityCheck?.label || "Metric unavailable", 
      icon: PieChart, 
      trend: `${analysisResults?.realityCheck?.impactCount || 0} indicators` 
    },
    { 
      label: "AI Tone Confidence", 
      value: analysisResults?.aiToneAnalysis?.confidence || 0, 
      variant: "success", 
      desc: analysisResults?.aiToneAnalysis?.label || "Tone analysis pending", 
      icon: Activity, 
      trend: "Secure" 
    },
    { 
      label: "Job Match Index", 
      value: analysisResults?.aiScore || analysisResults?.baseScore || 0, 
      variant: "primary", 
      desc: "Based on semantic overlap", 
      icon: Target, 
      trend: `${analysisResults?.matchedSkills?.length || 0} skills matched` 
    },
    { 
      label: "Scan Time", 
      value: analysisResults?.atsAnalysis?.simulation?.scanTime || 6.8, 
      variant: "accent", 
      desc: "Avg. recruiter skimming duration", 
      icon: Timer, 
      trend: "-0.5s" 
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/analyze')} className="rounded-full w-12 h-12 p-0 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10">
            <ArrowLeft className="w-5 h-5 text-stone-900 dark:text-white" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-stone-900 dark:text-white">Analyze Your Resume</h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-1">Ready to get your professional score? Upload everything below.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={handleExportAts} className="gap-2 rounded-full px-6 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white">
            <Download className="w-4 h-4" /> Export ATS Resume
          </Button>
          <Button variant="primary" size="md" onClick={handleShare} className="gap-2 rounded-full px-6">
             Share Audit <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Top Section: ByeWind Style White Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {scores.map((score, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-[32px] p-8 shadow-sm ${i === 0 || i === 2 ? 'bg-white text-[#1C1C1C] shadow-lg shadow-black/5' : 'bg-[#262626] text-white border border-white/5'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i === 0 || i === 2 ? 'bg-stone-100' : 'bg-white/5'}`}>
                <score.icon className={`w-6 h-6 ${i === 0 || i === 2 ? 'text-[#1C1C1C]' : 'text-white/40'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${i === 0 || i === i ? 'text-accent' : 'text-emerald-400'}`}>{score.trend}</span>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${i === 0 || i === 2 ? 'text-stone-400' : 'text-white/20'}`}>{score.label}</p>
            <h2 className="text-4xl font-bold tracking-tighter">{score.value}{typeof score.value === 'number' && score.value <= 100 ? '%' : i === 3 ? 's' : ''}</h2>
            <p className={`mt-4 text-[10px] font-medium leading-relaxed ${i === 0 || i === 2 ? 'text-stone-500' : 'text-white/40'}`}>{score.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Logic Insights */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden">
            <div className="flex flex-row items-center justify-between border-b border-stone-100 dark:border-white/5 p-8 px-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-2xl tracking-tighter dark:text-white">Key Insights</h3>
              </div>
              <Badge variant="accent" className="rounded-full px-4 text-[10px] font-black">5 FINDINGS</Badge>
            </div>
            <div className="p-4 px-10">
               <div className="divide-y divide-stone-100 dark:divide-white/5">
                  {(analysisResults?.realityCheck?.reasons || []).map((reason, i) => (
                    <div key={i} className="py-8 flex gap-6 group cursor-default">
                      <div className="pt-1">
                        {reason.includes('penalized') || reason.includes('generic') ? <AlertCircle className="w-6 h-6 text-rose-500" /> : 
                         reason.includes('Impact') || reason.includes('Numbers') ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
                         <CheckCircle2 className="w-6 h-6 text-stone-400" />}
                      </div>
                      <div>
                        <p className="font-bold text-lg tracking-tight mb-1 dark:text-white group-hover:text-accent transition-colors">{reason}</p>
                        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
                          {reason.includes('Impact') ? 'Good use of action verbs.' : 'Consider refining this area for better recruiter resonance.'}
                        </p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
           </div>

          {/* New Feature: Skill Gap Analysis */}
          <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-bold text-2xl tracking-tighter dark:text-white">Skill Gap Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Matched */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Matched Skills</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analysisResults?.matchedSkills || []).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/10">{skill}</span>
                  ))}
                  {(!analysisResults?.matchedSkills || analysisResults.matchedSkills.length === 0) && (
                    <p className="text-sm text-stone-500">No specific matches found.</p>
                  )}
                </div>
              </div>

              {/* Missing */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Missing ATS Keywords</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analysisResults?.skillGaps || []).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/10">{skill}</span>
                  ))}
                   {(!analysisResults?.skillGaps || analysisResults.skillGaps.length === 0) && (
                    <p className="text-sm text-stone-500">No major gaps identified!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 p-10 pt-10">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-2xl tracking-tighter dark:text-white">Industrial Simulation</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center bg-stone-50 dark:bg-white/5 p-10 rounded-[32px] border border-stone-100 dark:border-white/5">
                <div className="space-y-6">
                  <h4 className="text-xl font-bold tracking-tight dark:text-white">Skimming Logic</h4>
                  <p className="text-stone-500 dark:text-stone-400 font-medium text-sm leading-relaxed mb-8">Our engine simulates the neural scan of a Senior Recruiter. Visual high-impact spots are highlighted below.</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#1C1C1C] p-6 rounded-3xl border border-stone-100 dark:border-white/5 shadow-sm">
                      <Timer className="w-4 h-4 text-accent mb-3" />
                      <p className="text-2xl font-black tracking-tighter dark:text-white">{analysisResults?.atsAnalysis?.simulation?.scanTime?.toFixed(1) || '6.8'}s</p>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">Audit Time</p>
                    </div>
                    <div className="bg-white dark:bg-[#1C1C1C] p-6 rounded-3xl border border-stone-100 dark:border-white/5 shadow-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mb-3" />
                      <p className="text-2xl font-black tracking-tighter dark:text-white">{analysisResults?.atsAnalysis?.simulation?.density || 'HIGH'}</p>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">Density</p>
                    </div>
                  </div>
                </div>
                <div className="w-full h-96 bg-stone-100 dark:bg-[#1C1C1C] rounded-3xl relative overflow-hidden flex items-center justify-center border border-stone-200 dark:border-white/10 shadow-inner">
                  {currentResume?.fileUrl ? (
                    <div className="w-full h-full overflow-y-auto no-scrollbar relative flex justify-center">
                      <Document file={currentResume.fileUrl} loading={<p className="text-stone-400 font-medium text-xs mt-10">Loading PDF engine...</p>}>
                        <Page pageNumber={1} width={300} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-lg border border-stone-200" />
                      </Document>
                      {/* Heatmap Overlays over the PDF image */}
                      <div className="absolute inset-0 pointer-events-none z-10 mx-auto" style={{ width: '300px' }}>
                        {(analysisResults?.atsAnalysis?.simulation?.hotspots || [
                          { x: 20, y: 15, size: 24, color: 'accent' },
                          { x: 40, y: 45, size: 20, color: 'emerald' }
                        ]).map((spot, idx) => (
                          <div 
                            key={idx}
                            className={`absolute blur-2xl rounded-full opacity-60 ${spot.color === 'accent' ? 'bg-accent' : 'bg-emerald-500'}`}
                            style={{ 
                              top: `${spot.y}%`, 
                              left: `${spot.x}%`, 
                              width: `${spot.size * 3}px`, 
                              height: `${spot.size * 3}px` 
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-stone-300 dark:text-white/10 uppercase transform -rotate-12 select-none tracking-[0.5em]">Heatmap Trace</p>
                      {(analysisResults?.atsAnalysis?.simulation?.hotspots || [
                        { x: 10, y: 10, size: 24, color: 'accent' },
                        { x: 32, y: 40, size: 20, color: 'emerald' }
                      ]).map((spot, idx) => (
                        <div 
                          key={idx}
                          className={`absolute blur-3xl rounded-full opacity-30 ${spot.color === 'accent' ? 'bg-accent' : 'bg-emerald-500'}`}
                          style={{ 
                            top: `${spot.y}%`, 
                            left: `${spot.x}%`, 
                            width: `${spot.size * 4}px`, 
                            height: `${spot.size * 4}px` 
                          }}
                        ></div>
                      ))}
                    </>
                  )}
                </div>
            </div>
          </div>

          {/* New Feature: Learning Path Roadmap */}
          {analysisResults?.learningRoadmap && (
            <LearningRoadmap roadmap={analysisResults.learningRoadmap} />
          )}

          {/* New Feature: GitHub Verification */}
          {analysisResults?.githubVerification && (
            <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden">
               <div className="p-8 px-10 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-stone-900 dark:bg-white/10 flex items-center justify-center">
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-5 h-5 text-stone-900 dark:text-white"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl tracking-tighter dark:text-white">GitHub Skill Sync</h3>
                      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Verifying claimed skills against public repository evidence.</p>
                    </div>
                  </div>
                  <Badge variant="primary" className="rounded-full px-4 text-[10px] font-black">VERIFIED</Badge>
               </div>
               <div className="p-10 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Evidence Found</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.githubVerification.matches.map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/10">{skill}</span>
                        ))}
                        {analysisResults.githubVerification.matches.length === 0 && <p className="text-sm font-medium text-stone-400 italic">No direct matches found in top repos.</p>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Missing Evidence</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.githubVerification.missingInGithub.slice(0, 8).map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-500/10">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-stone-50 dark:bg-white/5 rounded-3xl border border-stone-100 dark:border-white/5">
                     <p className="text-sm font-medium text-stone-500 dark:text-stone-400 leading-relaxed">
                        <span className="font-bold text-stone-900 dark:text-white mr-2">Audit Insight:</span>
                        We found evidence for {analysisResults.githubVerification.matches.length} out of {analysisResults.githubVerification.matches.length + analysisResults.githubVerification.missingInGithub.length} skills on your GitHub. 
                        {analysisResults.githubVerification.missingInGithub.length > 5 ? " Consider making more of your relevant work public to strengthen your credibility." : " This shows strong alignment between your resume and public work."}
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Strategic Rewrites */}
        <div className="space-y-10">
          <div className="bg-accent rounded-[40px] p-10 text-white shadow-2xl shadow-accent/20 border-none relative overflow-hidden">
            <h3 className="font-bold text-2xl tracking-tighter mb-8 relative z-10">Precision Rewrites</h3>
            <div className="space-y-8 relative z-10">
              {(analysisResults?.rewriteSuggestions || []).slice(0, 2).map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 mt-1 opacity-40 flex-shrink-0" />
                    <p className="text-xs font-medium text-white/40 line-through italic leading-relaxed">{item.original || "Previous version"}</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 mt-1 text-white flex-shrink-0" />
                    <p className="text-sm font-bold text-white leading-relaxed">{item.rewrite || (typeof item === 'string' ? item : 'Suggestion available')}</p>
                  </div>
                </div>
              ))}
              <Button 
                variant="secondary" 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white text-accent hover:bg-stone-50 border-none rounded-2xl py-6 font-black text-xs uppercase tracking-widest h-14 mt-4 shadow-xl shadow-black/10"
              >
                View Full Suggestions
              </Button>
            </div>
            {/* Gloss reflection */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
          </div>

          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title="Strategic Rewrite Suggestions"
          >
            <div className="space-y-8">
              {(analysisResults?.rewriteSuggestions || []).map((item, i) => (
                <div key={i} className="space-y-4 pb-8 border-b border-stone-100 dark:border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Original phrasing</p>
                      <p className="text-sm font-medium text-stone-500 dark:text-stone-300 italic leading-relaxed">{item.original || "Previous version"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">AI Optimized Version</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-white leading-relaxed">{item.rewrite}</p>
                      {item.reason && (
                        <div className="mt-4 pt-4 border-t border-emerald-500/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Strategic Reasoning</p>
                          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{item.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!analysisResults?.rewriteSuggestions || analysisResults.rewriteSuggestions.length === 0) && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-stone-300" />
                  </div>
                  <p className="text-stone-500 font-bold">No suggestions yet. Try re-analyzing your resume.</p>
                </div>
              )}
            </div>
          </Modal>

          <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden">
            <div className="p-8 border-b border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-white/5">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Strategic Next Steps</h3>
            </div>
            <div className="p-10 pt-8">
              <ul className="space-y-8">
                {(analysisResults?.recommendations || analysisResults?.projectDepthAnalysis?.suggestions || []).map((step, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-white/5 flex items-center justify-center mt-0.5 group-hover:bg-accent group-hover:text-white transition-all text-stone-400 dark:text-white/20">
                      <span className="text-[10px] font-black">{i+1}</span>
                    </div>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
