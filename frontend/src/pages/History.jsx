import React from 'react';
import { motion } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Trash2,
  FileText,
  Clock,
  Briefcase,
  Zap,
  Activity,
  Target,
  ArrowRight
} from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useEffect } from 'react';
import { useResumes } from '../context/ResumeContext';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const { history, fetchHistory, isLoading, getResumeById } = useResumes();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = React.useState([]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      navigate(`/compare-results?idA=${selectedIds[0]}&idB=${selectedIds[1]}`);
    }
  };

  const handleViewDetails = async (id) => {
    await getResumeById(id);
    navigate('/results');
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "resume_history.json");
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-stone-200 dark:border-white/10 shadow-sm">
             <HistoryIcon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-stone-900 dark:text-white">Recent Analysis</h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-1">Manage and view your past resume analysis reports.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            {selectedIds.length === 2 && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleCompare}
                className="gap-2 rounded-full px-8 bg-indigo-500 hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 animate-in fade-in zoom-in"
              >
                Compare Selection ({selectedIds.length}) <Zap className="w-4 h-4 fill-white" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 rounded-full px-6 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white">
                <Download className="w-4 h-4 opacity-50" /> Download History
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/analyze')} className="gap-2 rounded-full px-6 shadow-lg shadow-accent/20">
                New Analysis <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden shadow-sm">
            <CardContent className="p-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Total Resumes Analyzed</p>
                <div className="flex items-end gap-3 translate-y-1">
                   <h3 className="text-5xl font-bold tracking-tighter dark:text-white">124</h3>
                   <span className="text-[10px] font-black text-emerald-500 mb-2">+12.5%</span>
                </div>
            </CardContent>
        </Card>
        
        <Card className="md:col-span-2 bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden shadow-sm">
            <CardContent className="p-10">
                <div className="flex items-center justify-between h-full">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">System Status</p>
                        <p className="font-bold text-lg dark:text-white tracking-tight">All systems operational</p>
                    </div>
                    <div className="h-3 w-48 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden border border-stone-200 dark:border-white/10">
                        <div className="h-full w-full bg-accent rounded-full pulse-slow opacity-80 shadow-[0_0_15px_rgba(0,191,255,0.4)]"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#262626] rounded-[40px] border border-stone-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-stone-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="relative group flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Filter History..." 
              className="pl-12 pr-6 py-3.5 rounded-2xl bg-stone-50 dark:bg-[#1C1C1C] border border-stone-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all w-full sm:w-80 shadow-inner"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="md" className="gap-2 rounded-2xl text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5">
                <Filter className="w-4 h-4" /> Filter Options
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-white/5">
                <th className="px-10 py-8 w-10"></th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-stone-400">Resume Name</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Score</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-stone-400">Date</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {history.map((item, i) => (
                <motion.tr 
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group hover:bg-stone-50/50 dark:hover:bg-white/5 transition-all cursor-default ${selectedIds.includes(item._id) ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}
                >
                  <td className="px-10 py-8">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item._id)}
                      onChange={() => handleSelect(item._id)}
                      className="w-5 h-5 rounded-lg border-stone-300 text-accent focus:ring-accent accent-accent transition-all cursor-pointer"
                    />
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#1C1C1C] flex items-center justify-center border border-stone-200 dark:border-white/5 text-stone-400 dark:text-stone-500 group-hover:text-accent transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold tracking-tight text-stone-900 dark:text-white">{item.originalName || item.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">Analysis #{item._id.slice(-5)}</span>
                           <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></span>
                           <span className="text-[10px] font-black text-accent uppercase tracking-tighter">{item.status || 'Analyzed'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex flex-col items-center gap-2">
                        <div className="text-xl font-bold dark:text-white tracking-tighter">
                          {item.analysis?.realityCheck?.score || 0}%
                        </div>
                        <div className="w-24 h-1.5 bg-stone-100 dark:bg-[#1C1C1C] rounded-full overflow-hidden border border-stone-200 dark:border-white/5">
                            <div className={`h-full rounded-full ${(item.analysis?.realityCheck?.score || 0) >= 60 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${item.analysis?.realityCheck?.score || 0}%` }}></div>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm font-medium">
                      <Clock className="w-3 h-3 opacity-40" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(item._id)}
                          className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-[#1C1C1C] text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-white transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-rose-500/10 text-stone-400 dark:text-stone-500 hover:text-rose-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default History;
