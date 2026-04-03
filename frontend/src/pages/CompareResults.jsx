import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Target,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useResumes } from '../context/ResumeContext';

const CompareResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { compareResumes, isLoading } = useResumes();
  const [data, setData] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const idA = queryParams.get('idA');
  const idB = queryParams.get('idB');

  useEffect(() => {
    if (idA && idB) {
      compareResumes(idA, idB).then(res => setData(res));
    }
  }, [idA, idB, compareResumes]);

  if (isLoading || !data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-bold tracking-tighter">Calculating Delta Metrics...</p>
      </div>
    );
  }

  const { comparison, resumeA, resumeB } = data;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="rounded-full w-12 h-12 p-0 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10">
          <ArrowLeft className="w-5 h-5 text-stone-900 dark:text-white" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-stone-900 dark:text-white">A/B Audit Results</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-1">Comparing performance metrics between two resume versions.</p>
        </div>
      </div>

      {/* Comparison Overview */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 bg-accent rounded-[40px] p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold tracking-tighter mb-4 text-white">Comparative Rationale</h3>
            <p className="text-white/80 font-medium leading-relaxed max-w-2xl mb-8">{comparison.rationale}</p>
            <div className="flex items-center gap-4">
               <Badge className="bg-white text-accent rounded-full px-6 py-2 font-black">WINNER: VERSION {comparison.betterVersion}</Badge>
               {comparison.scoreDelta !== 0 && (
                 <span className="flex items-center gap-1 font-bold text-sm">
                   {comparison.scoreDelta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                   {Math.abs(comparison.scoreDelta)}% Performance Shift
                 </span>
               )}
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 blur-3xl rounded-full"></div>
        </Card>

        <Card className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 p-10">
           <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6">Reality Check Delta</p>
           <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h4 className="text-4xl font-bold tracking-tighter dark:text-white">{comparison.realityCheckDelta.scoreDelta > 0 ? '+' : ''}{comparison.realityCheckDelta.scoreDelta}%</h4>
                <span className="text-[10px] font-black uppercase text-stone-400">Score Impact</span>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-white/5 rounded-2xl border border-stone-100 dark:border-white/5">
                <p className="text-xs font-bold dark:text-white">
                  {comparison.realityCheckDelta.labelChange ? '⚠️ Screening probability has shifted' : '✅ Stability maintained'}
                </p>
              </div>
           </div>
        </Card>
      </div>

      {/* Side by Side Comparison */}
      <div className="grid md:grid-cols-2 gap-10">
        {[resumeA, resumeB].map((resume, idx) => (
          <div key={idx} className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-bold tracking-tighter dark:text-white">Version {idx === 0 ? 'A' : 'B'}</h3>
              <span className="text-xs font-medium text-stone-400">{resume.name}</span>
            </div>
            
            <Card className={`rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden ${comparison.betterVersion === (idx === 0 ? 'A' : 'B') ? 'ring-2 ring-accent' : ''}`}>
              <div className="p-10 border-b border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-white/5">
                 <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1C1C1C] flex items-center justify-center border border-stone-200 dark:border-white/5">
                       <Target className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter dark:text-white">{resume.analysis?.aiScore || resume.analysis?.baseScore || 0}%</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Audit Score</p>
                 <h4 className="text-lg font-bold tracking-tight dark:text-white mb-4">Precision Match Index</h4>
                 <div className="h-2 w-full bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${resume.analysis?.aiScore || resume.analysis?.baseScore || 0}%` }}></div>
                 </div>
              </div>
              <div className="p-10 space-y-8">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Key Indicators</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-stone-50 dark:bg-white/5 rounded-2xl border border-stone-100 dark:border-white/5">
                        <p className="text-lg font-bold dark:text-white">{resume.analysis?.realityCheck?.score || 0}%</p>
                        <p className="text-[10px] font-medium text-stone-500 uppercase tracking-tighter">Reality Check</p>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-white/5 rounded-2xl border border-stone-100 dark:border-white/5">
                        <p className="text-lg font-bold dark:text-white">{resume.analysis?.matchedSkills?.length || 0}</p>
                        <p className="text-[10px] font-medium text-stone-500 uppercase tracking-tighter">Skills Found</p>
                      </div>
                   </div>
                </div>

                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Skill Matching</p>
                   <div className="flex flex-wrap gap-2">
                      {resume.analysis?.matchedSkills?.slice(0, 8).map((skill, sIdx) => (
                        <span key={sIdx} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/10">{skill}</span>
                      ))}
                      {idx === 1 && comparison.skillsDelta.added.length > 0 && (
                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase border border-accent/10">+{comparison.skillsDelta.added.length} NEW</span>
                      )}
                   </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
               <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
               <h4 className="text-xl font-bold tracking-tighter dark:text-white">Recommendation</h4>
               <p className="text-stone-500 font-medium text-sm">Proceed with Version {comparison.betterVersion} for maximum recruiter impact.</p>
            </div>
         </div>
         <Button onClick={() => navigate('/history')} className="px-10 py-4 rounded-2xl">Return to History</Button>
      </div>
    </div>
  );
};

export default CompareResults;
