import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Target, 
  BarChart, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import LearningRoadmap from '../components/dashboard/LearningRoadmap';
import { useNavigate } from 'react-router-dom';
import { useResumes } from '../context/ResumeContext';
import { generateAtsResume } from '../utils/pdfGenerator';

const ResultsDashboard = () => {
  const navigate = useNavigate();
  const { analysisResults } = useResumes();
  const [hoveredQuestion, setHoveredQuestion] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleDownload = () => {
    if (analysisResults) {
      generateAtsResume(analysisResults.resumeText || analysisResults.extractedText, analysisResults.rewriteSuggestions);
    }
  };

  const prettyBenchmarkKey = (key) => {
    const labels = {
      detectedRole: 'Detected Role',
      similarity: 'Similarity',
      missingSkills: 'Missing Skills',
      matchedSkills: 'Matched Skills',
      allRoleScores: 'Top Role Scores',
      benchmarkCoverage: 'Benchmark Coverage',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const renderBenchmarkValue = (key, value) => {
    if (key === 'allRoleScores' && Array.isArray(value)) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {value.map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-stone-100 dark:bg-[#111111] p-4 border border-stone-200 dark:border-white/10">
              <p className="text-sm text-stone-700 dark:text-stone-300"><span className="font-semibold text-stone-900 dark:text-white">Role -</span> {item.role}</p>
              <p className="mt-2 text-sm text-stone-700 dark:text-stone-300"><span className="font-semibold text-stone-900 dark:text-white">Similarity -</span> {typeof item.similarity === 'number' ? `${Math.round(item.similarity)}%` : String(item.similarity)}</p>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <p className="text-sm text-stone-700 dark:text-stone-300">{value.join(', ')}</p>
      );
    }

    if (value && typeof value === 'object') {
      return (
        <div className="space-y-3">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <p className="text-sm text-stone-700 dark:text-stone-300"><span className="font-semibold text-stone-900 dark:text-white">{prettyBenchmarkKey(subKey)} -</span> {renderBenchmarkValue(subKey, subValue)}</p>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-lg font-semibold text-stone-900 dark:text-white">{String(value)}</p>;
  };

  if (!analysisResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-stone-500">No analysis data found.</p>
        <Button onClick={() => navigate('/analyze')} variant="primary" className="bg-[#00BFFF] text-white py-2 px-4 rounded-xl">Analyze a Resume</Button>
      </div>
    );
  }

  // Determine scores safely
  const atsScore = analysisResults.realityCheck?.score || 0;
  const readabilityScore = analysisResults.readinessScore || 0;
  const jobMatchScore = analysisResults.jobMatchScore || 0;

  return (
    <div className="pb-10 space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-white/5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="p-2 border rounded-lg border-stone-200 dark:border-white/10">
            <ArrowLeft className="w-5 h-5 text-stone-900 dark:text-white" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Your Resume Analysis</h1>
        </div>
        <Button 
          onClick={handleDownload}
          className="bg-[#00BFFF] hover:bg-[#009acd] text-white border-none rounded-xl px-6 py-2.5 flex items-center gap-2 font-bold shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Optimized Resume
        </Button>
      </div>

      {analysisResults.summary && (
        <Card className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-3 text-xl font-bold text-stone-900 dark:text-white">Summary</h2>
            <p className="leading-relaxed text-stone-600 dark:text-stone-300">{analysisResults.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Scores Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "ATS Score", value: atsScore, icon: BarChart },
          { label: "Readability", value: readabilityScore, icon: FileText },
          { label: "Job Match", value: jobMatchScore, icon: Target },
        ].map((score, i) => (
          <Card key={i} className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
            <CardContent className="p-6">
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/5">
                   <score.icon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                 </div>
               </div>
               <p className="mb-1 text-sm font-medium text-stone-500 dark:text-stone-400">{score.label}</p>
               <h2 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">{score.value}%</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 1. Key Feedback */}
      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
        <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">What We Found</h3>
        <ul className="space-y-4">
          {(analysisResults.realityCheck?.reasons || []).map((reason, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="pt-1">
                {reason.toLowerCase().includes('penalize') || reason.toLowerCase().includes('lacks') ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <p className="text-stone-700 dark:text-stone-300">{reason}</p>
            </li>
          ))}
          {(!analysisResults.realityCheck?.reasons || analysisResults.realityCheck.reasons.length === 0) && (
            <li className="text-stone-500">No critical feedback detected.</li>
          )}
        </ul>
      </div>

      {/* 2. Skill Gap */}
      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
        <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">Skills Breakdown</h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Skills You Have
            </h4>
            <div className="flex flex-wrap gap-2">
              {(analysisResults.matchedSkills || []).map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-100 dark:border-emerald-500/20">{skill}</span>
              ))}
              {(!analysisResults.matchedSkills || analysisResults.matchedSkills.length === 0) && (
                <span className="text-sm text-stone-500">No matched skills.</span>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" /> Missing Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {(analysisResults.skillGaps || []).map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium border border-rose-100 dark:border-rose-500/20">{skill}</span>
              ))}
              {(!analysisResults.skillGaps || analysisResults.skillGaps.length === 0) && (
                <span className="text-sm text-stone-500">No critical missing skills!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Suggestions */}
      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-stone-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-[#00BFFF]" /> 
          Improvement Suggestions
        </h3>
        <div className="space-y-6">
          {(analysisResults.rewriteSuggestions || []).map((item, i) => (
            <div key={i} className="pb-6 space-y-3 border-b border-stone-100 dark:border-white/5 last:border-0 last:pb-0">
               <div className="flex items-start gap-3">
                 <AlertCircle className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                 <p className="text-sm italic line-through text-stone-500">{item.original}</p>
               </div>
               <div className="flex items-start gap-3 p-4 border bg-stone-50 dark:bg-white/5 rounded-xl border-stone-100 dark:border-white/10">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                 <div>
                   <p className="text-sm font-semibold text-stone-900 dark:text-white">{item.rewrite}</p>
                 </div>
               </div>
            </div>
          ))}
          {(!analysisResults.rewriteSuggestions || analysisResults.rewriteSuggestions.length === 0) && (
            <p className="text-stone-500">No rewrite suggestions available.</p>
          )}
        </div>
      </div>

      {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">What To Do Next</h3>
          <ul className="space-y-3">
            {analysisResults.recommendations.map((item, i) => (
              <li key={i} className="text-stone-700 dark:text-stone-300">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {analysisResults.aiToneAnalysis && (
        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">Writing Style Check</h3>
          <p className="mb-2 font-semibold text-stone-900 dark:text-white">{analysisResults.aiToneAnalysis.label}</p>
          <div className="grid gap-3 mb-5 md:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
              <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">AI Likelihood</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.aiToneAnalysis.confidence}%</p>
            </div>
            <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
              <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Suggestions</p>
              <p className="text-sm text-stone-700 dark:text-stone-300">{analysisResults.aiToneAnalysis.suggestions?.length || 0} items</p>
            </div>
            <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
              <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Human Score</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{100 - (analysisResults.aiToneAnalysis.confidence || 0)}%</p>
            </div>
          </div>
          {(analysisResults.aiToneAnalysis.suggestions || []).length > 0 ? (
            <ul className="space-y-2 text-stone-700 dark:text-stone-300">
              {analysisResults.aiToneAnalysis.suggestions.map((suggestion, i) => (
                <li key={i}>• {suggestion}</li>
              ))}
            </ul>
          ) : (
            <p className="text-stone-500">No tone suggestions available.</p>
          )}
        </div>
      )}

      {analysisResults.industryBenchmark && (
        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">How You Compare</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(analysisResults.industryBenchmark)
              .filter(([key]) => key !== 'benchmarkCoverage')
              .map(([key, value]) => (
                <div
                  key={key}
                  className={`rounded-2xl bg-stone-50 dark:bg-[#161616] p-4 ${key === 'allRoleScores' ? 'md:col-span-2' : ''}`}
                >
                  <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">{prettyBenchmarkKey(key)}</p>
                  <div className="mt-2">{renderBenchmarkValue(key, value)}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {typeof analysisResults.percentileRank !== 'undefined' && analysisResults.percentileRank && (
        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">Your Ranking</h3>
          {typeof analysisResults.percentileRank === 'object' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analysisResults.percentileRank.role && (
                <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                  <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Role</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank.role}</p>
                </div>
              )}
              {typeof analysisResults.percentileRank.readinessPercentile !== 'undefined' && (
                <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                   <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Job Readiness</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank.readinessPercentile.toFixed(1)}%</p>
                </div>
              )}
              {typeof analysisResults.percentileRank.matchPercentile !== 'undefined' && (
                <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                  <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Match</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank.matchPercentile.toFixed(1)}%</p>
                </div>
              )}
              {typeof analysisResults.percentileRank.realityPercentile !== 'undefined' && (
                <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                   <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">ATS Score</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank.realityPercentile.toFixed(1)}%</p>
                </div>
              )}
              {typeof analysisResults.percentileRank.authPercentile !== 'undefined' && (
                <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                   <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Human Score</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank.authPercentile.toFixed(1)}%</p>
                </div>
              )}
              {typeof analysisResults.percentileRank.totalCandidates !== 'undefined' && (
                <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                  <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">Total Candidates Ranked</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank.totalCandidates}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-stone-700 dark:text-stone-300">Your resume currently ranks in the <span className="font-bold text-stone-900 dark:text-white">{analysisResults.percentileRank}%</span> percentile compared to other analyzed resumes.</p>
          )}
        </div>
      )}

      <LearningRoadmap roadmap={analysisResults.learningRoadmap} />

      {(analysisResults.interviewPreparation || []).length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">Interview Tips</h3>
          <div className="grid gap-4">
            {analysisResults.interviewPreparation.map((item, i) => (
              <div key={i} className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4">
                <p className="text-sm font-semibold text-stone-900 dark:text-white">{item.area}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{item.advice}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-stone-400">Priority: {item.priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(analysisResults.mockInterviewQuestions || []).length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">Practice Questions</h3>
          <div className="space-y-4">
            {analysisResults.mockInterviewQuestions.map((question, i) => {
              const isVisible = hoveredQuestion === i || expandedQuestion === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-4 transition-all border border-stone-200 dark:border-white/10 hover:border-[#00BFFF]/40 cursor-pointer"
                  onMouseEnter={() => setHoveredQuestion(i)}
                  onMouseLeave={() => setHoveredQuestion(null)}
                  onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                >
                  <p className="font-semibold text-stone-900 dark:text-white">{question.type}:</p>
                  <p className={`text-sm mt-1 transition-colors ${isVisible ? 'font-bold text-stone-900 dark:text-white' : 'font-medium text-stone-500 dark:text-stone-400'}`}>{question.question}</p>
                  <div className={`mt-3 overflow-hidden transition-all ${isVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">Sample Answer</p>
                    <p className="text-sm text-stone-700 dark:text-stone-300">{question.expectedAnswer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
