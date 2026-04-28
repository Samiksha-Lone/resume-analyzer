import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Target, 
  History as HistoryIcon,
  Upload,
  ArrowRight,
  Lightbulb,
  Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useResumes } from '../context/ResumeContext';
import { generateAtsResume } from '../utils/pdfGenerator';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    history, 
    analysisHistory, 
    fetchHistory, 
    fetchAnalysisHistory,
    getHistoryById 
  } = useResumes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
    fetchAnalysisHistory();
  }, [fetchHistory, fetchAnalysisHistory]);

  const handleViewDetails = async (id) => {
    try {
      await getHistoryById(id);
      navigate('/results');
    } catch (err) {
      console.error("Navigation failed:", err);
    }
  };

  const latestAnalysis = analysisHistory && analysisHistory.length > 0 ? analysisHistory[0] : null;
  
  // Calculate unique metrics
  const avgPts = analysisHistory?.length 
    ? Math.round(analysisHistory.reduce((acc, curr) => acc + (curr.scores?.readinessScore || 0), 0) / analysisHistory.length)
    : 0;

  const topMatch = analysisHistory?.length
    ? Math.max(...analysisHistory.map(item => item.scores?.jobMatchScore || 0))
    : 0;

  const avgMatch = analysisHistory?.length
    ? Math.round(analysisHistory.reduce((acc, curr) => acc + (curr.scores?.jobMatchScore || 0), 0) / analysisHistory.length)
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200 dark:border-white/5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-2">
            Here's a unique look at your career trajectory.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/analyze')}
          className="rounded-lg bg-[#00BFFF] hover:bg-[#009acd] text-white border-none px-6 py-2.5 shadow-sm font-semibold flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Resume
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Resume Strength */}
        <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Resume Strength</p>
            </div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white">{avgPts}%</h2>
          </CardContent>
        </Card>

        {/* Card 2: Top Skill Match */}
        <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#00BFFF]/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#00BFFF]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Top Skill Match</p>
            </div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white">{topMatch}%</h2>
          </CardContent>
        </Card>

        {/* Card 3: Avg Match Score */}
        <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#00BFFF]/10 flex items-center justify-center">
                <HistoryIcon className="w-4 h-4 text-[#00BFFF]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Avg Alignment</p>
            </div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white">{avgMatch}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Recent Analyses</h3>
            <button 
              onClick={() => navigate('/history')}
              className="text-xs font-semibold text-[#00BFFF] hover:underline"
            >
              View All
            </button>
          </div>

          <Card className="overflow-hidden bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-white/5">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-500">Resume / Job</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-500">Score</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-500">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                  {analysisHistory?.slice(0, 5).map((item) => (
                    <tr key={item._id} className="hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-stone-900 dark:text-white truncate max-w-[200px]">
                            {item.resumeName || 'Untitled Resume'}
                          </span>
                          <span className="text-[10px] text-stone-500 truncate max-w-[180px]">
                            {item.jobTitle || 'General Analysis'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
                            <div 
                              className="h-full bg-[#00BFFF]" 
                              style={{ width: `${item.scores?.readinessScore || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-stone-900 dark:text-white">
                            {item.scores?.readinessScore || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => generateAtsResume(item.snapshot?.resumeText || item.snapshot?.extractedText, item.snapshot?.rewriteSuggestions)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-400 hover:text-[#00BFFF] transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewDetails(item._id)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-400 hover:text-[#00BFFF] transition-colors"
                            title="View Analysis"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!analysisHistory || analysisHistory.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-sm text-stone-500">
                        No analyses found yet. Start by uploading your resume!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Sidebar Insights */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Quick Insights</h3>
          
          {/* Top Skills Card */}
          <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
            <CardContent className="p-5">
              <h4 className="text-sm font-bold mb-4 text-stone-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00BFFF]" />
                Top Skills Identified
              </h4>
              <div className="flex flex-wrap gap-2">
                {latestAnalysis?.snapshot?.skills?.technical?.slice(0, 8).map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] text-[10px] font-bold border border-[#00BFFF]/20"
                  >
                    {skill}
                  </span>
                )) || (
                  <p className="text-xs text-stone-500 italic">Analyze a resume to see skill insights.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Tip Card */}
          <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
            <CardContent className="p-5">
              <h4 className="text-sm font-bold mb-3 text-stone-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Priority Improvement
              </h4>
              {latestAnalysis?.snapshot?.recommendations?.slice(0, 1).map((rec, i) => (
                <div key={i}>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                    {typeof rec === 'string' ? rec : rec.text}
                  </p>
                  <button 
                    onClick={() => navigate('/analyze')}
                    className="mt-4 text-[10px] font-bold text-[#00BFFF] hover:underline flex items-center gap-1"
                  >
                    Optimize Now <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )) || (
                <p className="text-xs text-stone-500 italic">No recommendations available.</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
