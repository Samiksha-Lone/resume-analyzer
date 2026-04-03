import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useResumes } from '../context/ResumeContext';

const ResumeEditor = () => {
  const navigate = useNavigate();
  const { currentResume, analysisResults } = useResumes();
  const [editorText, setEditorText] = useState('');
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  // Initialize editor with extracted text when component mounts
  useEffect(() => {
    if (currentResume?.extractedText) {
      setEditorText(currentResume.extractedText);
    } else {
      // Fallback if no resume is loaded
      navigate('/analyze');
    }
  }, [currentResume, navigate]);

  const handleApplySuggestion = (suggestion, index) => {
    if (!editorText.includes(suggestion.original)) {
      alert("Could not find the exact original text in your resume. It may have already been edited.");
      return;
    }

    // Replace the original text with the AI optimization
    const newText = editorText.replace(suggestion.original, suggestion.rewrite);
    setEditorText(newText);
    
    // Mark as applied
    setAppliedSuggestions(prev => new Set(prev).add(index));
  };

  const handleDownload = () => {
    if (!editorText) return;
    
    const element = document.createElement("a");
    const file = new Blob([editorText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${currentResume?.originalName?.replace('.pdf', '') || 'resume'}_optimized.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  if (!currentResume) return null;

  const suggestions = analysisResults?.rewriteSuggestions || [];

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#1C1C1C] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Editor Header */}
      <header className="flex-none h-20 border-b border-stone-200 dark:border-white/5 bg-white dark:bg-[#1C1C1C] px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/results')} className="rounded-full w-10 h-10 p-0 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10">
            <ArrowLeft className="w-4 h-4 text-stone-900 dark:text-white" />
          </Button>
          <div>
            <h1 className="font-bold text-xl tracking-tighter dark:text-white flex items-center gap-2">
              Interactive AI Copilot <Sparkles className="w-4 h-4 text-accent" />
            </h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Editing: {currentResume.originalName}</p>
          </div>
        </div>

        <Button onClick={handleDownload} variant="primary" className="rounded-full gap-2 shadow-lg shadow-accent/20">
          <Download className="w-4 h-4" /> Download Optimized Resume
        </Button>
      </header>

      {/* Editor Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: The Canvas */}
        <div className="flex-1 flex flex-col border-r border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-black/20 p-6">
           <div className="flex items-center gap-2 mb-4 px-2">
             <FileText className="w-4 h-4 text-stone-400" />
             <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Document Canvas</span>
           </div>
           <textarea
             value={editorText}
             onChange={(e) => setEditorText(e.target.value)}
             className="flex-1 w-full p-8 rounded-3xl bg-white dark:bg-[#262626] border border-stone-200 dark:border-white/5 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 text-stone-700 dark:text-stone-300 font-medium leading-relaxed"
             placeholder="Your resume text will appear here..."
           />
        </div>

        {/* Right Pane: AI Suggestions */}
        <div className="w-[450px] flex flex-col bg-white dark:bg-[#1C1C1C] overflow-hidden">
          <div className="p-6 border-b border-stone-200 dark:border-white/5 flex items-center justify-between bg-stone-50/50 dark:bg-white/5">
             <div className="flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-accent" />
               <h3 className="font-bold tracking-tighter dark:text-white">Precision Rewrites</h3>
             </div>
             <div className="px-3 py-1 bg-stone-200 dark:bg-white/10 rounded-full text-[10px] font-black dark:text-white">
               {suggestions.length} FOUND
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 invisible-scrollbar">
            {suggestions.map((item, i) => {
              const isApplied = appliedSuggestions.has(i);
              
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-3xl border transition-all ${
                    isApplied 
                      ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' 
                      : 'bg-white dark:bg-[#262626] border-stone-200 dark:border-white/5 shadow-sm hover:border-accent/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-4 h-4 mt-1 flex-shrink-0 ${isApplied ? 'text-emerald-500/50' : 'text-stone-400'}`} />
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Original</p>
                         <p className={`text-xs font-medium italic ${isApplied ? 'text-emerald-700/50 dark:text-emerald-400/50 line-through' : 'text-stone-500 dark:text-stone-400'}`}>
                           "{item.original}"
                         </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-4 h-4 mt-1 flex-shrink-0 ${isApplied ? 'text-emerald-500' : 'text-stone-900 dark:text-white'}`} />
                      <div>
                         <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isApplied ? 'text-emerald-600 dark:text-emerald-500' : 'text-accent'}`}>Optimized Rewrite</p>
                         <p className={`text-sm font-bold leading-relaxed ${isApplied ? 'text-emerald-900 dark:text-emerald-100' : 'text-stone-900 dark:text-white'}`}>
                           {item.rewrite}
                         </p>
                      </div>
                    </div>

                    {!isApplied && (
                      <div className="pt-4 border-t border-stone-100 dark:border-white/5 mt-4">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleApplySuggestion(item, i)}
                          className="w-full rounded-xl bg-accent text-white border-none hover:bg-accent/90"
                        >
                          Apply Change
                        </Button>
                      </div>
                    )}
                    {isApplied && (
                      <div className="pt-4 border-t border-emerald-200 dark:border-emerald-500/20 mt-4 text-center">
                         <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Applied Successfully</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {suggestions.length === 0 && (
              <div className="text-center py-20">
                <p className="text-stone-400 font-medium">No rewrite suggestions available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
