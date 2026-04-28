import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';

const LearningRoadmap = ({ roadmap }) => {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-[#00BFFF]/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#00BFFF]" />
        </div>
        <div>
          <h3 className="font-bold text-2xl tracking-tighter dark:text-white">Personalized Skill Roadmap</h3>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">A 2-week targeted plan to bridge your skill gaps.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {roadmap.map((weekData, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="bg-white dark:bg-[#262626] rounded-[32px] p-8 border border-stone-200 dark:border-white/5 relative overflow-hidden group hover:shadow-xl hover:shadow-[#00BFFF]/5 transition-all duration-500"
          >
            {/* Week Badge */}
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#00BFFF]" />
                  </div>
                  <h4 className="text-lg font-bold tracking-tight dark:text-white leading-tight">{weekData.title || `Phase ${idx+1}`}</h4>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00BFFF] whitespace-nowrap bg-[#00BFFF]/10 px-3 py-1 rounded-full">WEEK {weekData.week || idx + 1}</span>
              </div>

              <ul className="space-y-4">
                {(weekData.tasks || []).map((task, taskIdx) => (
                  <li key={taskIdx} className="flex gap-4 items-start group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mt-0.5 group-hover/item:bg-[#00BFFF] group-hover/item:text-white transition-all">
                      <CheckCircle2 className="w-3 h-3 opacity-40 group-hover/item:opacity-100" />
                    </div>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 group-hover/item:text-stone-900 dark:group-hover/item:text-white transition-colors leading-relaxed">
                      {task}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#00BFFF]/5 blur-3xl rounded-full group-hover:bg-[#00BFFF]/10 transition-colors"></div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-[#00BFFF] p-8 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-xl font-bold tracking-tight mb-1">Ready to start?</h4>
          <p className="text-white/70 text-sm font-medium">Follow this roadmap to increase your match score by up to 25%.</p>
        </div>
        <button 
          onClick={() => {
            const firstTask = roadmap?.[0]?.tasks?.[0];
            if (firstTask) {
              const query = encodeURIComponent(firstTask);
              window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
            }
          }}
          className="relative z-10 bg-white text-[#00BFFF] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center gap-2 group"
        >
          Begin Learning Path <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
      </div>
    </div>
  );
};

export default LearningRoadmap;
