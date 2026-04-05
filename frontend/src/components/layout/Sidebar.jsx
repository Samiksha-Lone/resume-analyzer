import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings,
  BrainCircuit,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ className }) => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Resume', path: '/analyze', icon: FileSearch },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <aside className={cn(
      "w-64 flex flex-col h-full transition-all duration-300 bg-[#f8fafc] dark:bg-[#1C1C1C] border-r border-stone-200 dark:border-white/5",
      className
    )}>
      {/* Brand */}
      <div className="p-8 pb-10">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00BFFF]">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            Hire<span className="text-[#00BFFF]">Metric</span>
          </span>
        </NavLink>
      </div>

      <div className="flex-1 px-4 space-y-2 overflow-y-auto invisible-scrollbar">
        <nav className="space-y-1 mt-2">
          {navItems.map((item) => (
             <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-[#00BFFF]/10 text-[#00BFFF]" 
                    : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white"
                )}
             >
                <item.icon className={cn(
                  "w-5 h-5",
                  "group-hover:text-stone-900 dark:group-hover:text-white transition-colors"
                )} />
                {item.name}
             </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-stone-200 dark:border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#262626] flex items-center justify-center border border-stone-200 dark:border-white/5">
             <div className="w-6 h-6 rounded-full bg-[#00BFFF] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {user?.name?.charAt(0) || 'U'}
             </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold tracking-tight truncate text-stone-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user?.email || 'user@hiremetric'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 transition-colors rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 text-stone-400 dark:hover:text-rose-500"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
