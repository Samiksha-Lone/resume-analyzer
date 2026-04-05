import React from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  Sun, 
  Moon,
  ChevronRight,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-[#F7F7F7] dark:bg-[#1C1C1C] border-b border-stone-200/50 dark:border-white/5 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10"
        >
          <Menu className="w-5 h-5 text-stone-900 dark:text-white" />
        </button>
        
        {/* Simplified Search - Previous Version style */}
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-4 w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search resumes, jobs, reports..." 
            className="w-96 pl-12 pr-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent/30 text-sm font-medium text-stone-900 dark:text-white transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 transition-all cursor-pointer group">
           <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/20">
              <span className="text-[10px] font-black text-accent uppercase">{user?.name?.charAt(0) || 'U'}</span>
           </div>
           <span className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-accent transition-colors">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
