import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Target, 
  History as HistoryIcon,
  Upload,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useResumes } from '../context/ResumeContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { history, analysisHistory, fetchHistory, fetchAnalysisHistory } = useResumes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
    fetchAnalysisHistory();
  }, [fetchHistory, fetchAnalysisHistory]);

  const latestAnalysis = analysisHistory && analysisHistory.length > 0 ? analysisHistory[0] : null;
  const latestScore = latestAnalysis?.scores?.readinessScore || 0;
  
  // Calculate average ATS Score simply
  const avgPts = analysisHistory?.length 
    ? Math.round(analysisHistory.reduce((acc, curr) => acc + (curr.scores?.readinessScore || 0), 0) / analysisHistory.length)
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
            Here's a quick overview of your resume metrics.
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
        {/* Card 1: ATS Score */}
        <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Average ATS Score</p>
            <h2 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
              {avgPts}%
            </h2>
          </CardContent>
        </Card>

        {/* Card 2: Resumes Analyzed */}
        <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Resumes Analyzed</p>
            <h2 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
              {analysisHistory?.length || 0}
            </h2>
          </CardContent>
        </Card>

        {/* Card 3: Last Score */}
        <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <HistoryIcon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Last Score</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
                {latestScore}%
              </h2>
              {latestAnalysis && (
                <span className="text-xs font-medium text-stone-400">
                  {new Date(latestAnalysis.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;
