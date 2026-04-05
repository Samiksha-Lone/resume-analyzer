import React, { useEffect, useState } from 'react';
import {
  History as HistoryIcon,
  ExternalLink,
  Trash2,
  FileText,
  Search
} from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useResumes } from '../context/ResumeContext';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const { fetchHistory, analysisHistory, fetchAnalysisHistory, compareAnalysisHistory, isLoading, getResumeById, deleteHistoryItem } = useResumes();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [compareFirst, setCompareFirst] = useState('');
  const [compareSecond, setCompareSecond] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [compareError, setCompareError] = useState('');

  useEffect(() => {
    fetchHistory();
    fetchAnalysisHistory();
  }, [fetchHistory, fetchAnalysisHistory]);

  const handleViewDetails = async (id) => {
    await getResumeById(id);
    navigate('/results');
  };

  const handleCompare = async () => {
    setCompareError('');
    setCompareResult(null);

    if (!compareFirst || !compareSecond || compareFirst === compareSecond) {
      setCompareError('Please select two different history entries to compare.');
      return;
    }

    try {
      const result = await compareAnalysisHistory(compareFirst, compareSecond);
      setCompareResult(result);
    } catch (err) {
      setCompareError(err.message || 'Unable to compare selected entries');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete analysis for "${name}"? This cannot be undone.`)) {
      try { await deleteHistoryItem(id); } catch (err) { alert(err.message || 'Failed to delete'); }
    }
  };

  const filteredHistory = (analysisHistory || []).filter(item => {
    const name = (item.resumeName || '').toLowerCase();
    const title = (item.jobTitle || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="pb-20 space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 pb-6 border-b md:flex-row md:items-end border-stone-200 dark:border-white/5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Score History</h1>
          <p className="mt-2 text-sm font-medium text-stone-500 dark:text-stone-400">Track past analyses and scores.</p>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm overflow-hidden">
        
        <div className="p-6 space-y-4 border-b border-stone-200 dark:border-white/5">
           <div className="relative w-full max-w-sm">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search resumes or job titles..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-[#00BFFF] text-sm font-medium dark:text-white"
              />
           </div>
           <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end">
             <div className="grid gap-3 sm:grid-cols-2">
               <select
                 value={compareFirst}
                 onChange={(e) => setCompareFirst(e.target.value)}
                 className="w-full px-4 py-3 text-sm border bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white"
               >
                 <option value="">Select first snapshot</option>
                 {analysisHistory.map((item) => (
                   <option key={item._id} value={item._id}>
                     {item.resumeName} · {item.jobTitle || 'No title'} · {new Date(item.createdAt).toLocaleDateString()}
                   </option>
                 ))}
               </select>
               <select
                 value={compareSecond}
                 onChange={(e) => setCompareSecond(e.target.value)}
                 className="w-full px-4 py-3 text-sm border bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white"
               >
                 <option value="">Select second snapshot</option>
                 {analysisHistory.map((item) => (
                   <option key={item._id} value={item._id}>
                     {item.resumeName} · {item.jobTitle || 'No title'} · {new Date(item.createdAt).toLocaleDateString()}
                   </option>
                 ))}
               </select>
             </div>
             <button
               onClick={handleCompare}
               className="w-full md:w-auto bg-[#00BFFF] hover:bg-[#009acd] text-white rounded-xl px-6 py-3 text-sm font-semibold"
             >
               Compare Snapshots
             </button>
           </div>
           {compareError && <p className="text-sm text-rose-500">{compareError}</p>}
           {compareResult && (
             <div className="rounded-2xl bg-stone-50 dark:bg-[#161616] p-6 border border-stone-200 dark:border-white/10">
               <h3 className="mb-3 text-lg font-bold text-stone-900 dark:text-white">Comparison Results</h3>
               <div className="grid gap-3 md:grid-cols-3">
                 {Object.entries(compareResult.delta || {}).map(([key, value]) => (
                   <div key={key} className="rounded-2xl bg-white dark:bg-[#1C1C1C] p-4 border border-stone-200 dark:border-white/10">
                     <p className="text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400">{key}</p>
                     <p className="text-2xl font-bold text-stone-900 dark:text-white">{value >= 0 ? '+' : ''}{value}%</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead>
               <tr className="border-b bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/5">
                 <th className="px-6 py-4 text-xs font-semibold text-stone-500 dark:text-stone-400">Resume Name</th>
                 <th className="w-32 px-6 py-4 text-xs font-semibold text-stone-500 dark:text-stone-400">ATS Score</th>
                 <th className="w-40 px-6 py-4 text-xs font-semibold text-stone-500 dark:text-stone-400">Date</th>
                 <th className="w-24 px-6 py-4 text-xs font-semibold text-right text-stone-500 dark:text-stone-400">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-stone-100 dark:divide-white/5">
               {filteredHistory.map((item) => (
                 <tr key={item._id} className="transition-colors hover:bg-stone-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-stone-400" />
                        <span className="font-medium text-stone-900 dark:text-white truncate max-w-[200px] md:max-w-xs">{item.originalName || item.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-stone-900 dark:text-white">{item.analysis?.realityCheck?.score || item.analysis?.readinessScore || 0}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleViewDetails(item._id)} className="p-2 text-stone-400 hover:text-[#00BFFF] transition-colors rounded-lg hover:bg-[#00BFFF]/10">
                            <ExternalLink className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(item._id, item.originalName)} className="p-2 transition-colors rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-500/10">
                            <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                 </tr>
               ))}
               {filteredHistory.length === 0 && !isLoading && (
                 <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                     No resumes found. Try adjusting your search or upload a new one!
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </Card>

    </div>
  );
};

export default History;
