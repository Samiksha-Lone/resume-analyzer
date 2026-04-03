import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  History, 
  BarChart3, 
  Settings,
  BrainCircuit,
  Briefcase,
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
    { name: 'Dashboard', path: '/analyze', icon: LayoutDashboard },
    { name: 'Analysis Results', path: '/results', icon: BarChart3 },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <aside className={cn(
      "w-64 sidebar-surface flex flex-col h-full transition-all duration-300",
      className
    )}>
      {/* Brand */}
      <div className="p-8 pb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tighter dark:text-white">
          Hire<span className="text-accent">Metric</span>
        </span>
      </div>

      <div className="flex-1 px-4 space-y-10 overflow-y-auto invisible-scrollbar">

        {/* Dashboards */}
        <div>
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 opacity-50">Core Modules</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                  isActive 
                    ? "bg-stone-100 dark:bg-white/5 text-stone-900 dark:text-white shadow-sm" 
                    : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  "group-hover:text-accent"
                )} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

      </div>

      {/* User Footer */}
      <div className="p-6 border-t border-stone-100 dark:border-white/5">
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50/50 dark:bg-white/5 border border-stone-100 dark:border-white/5 transition-all group">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1C1C1C] flex items-center justify-center border border-stone-200 dark:border-white/10 group-hover:border-accent transition-colors">
             <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-black text-white uppercase">
                {user?.name?.charAt(0) || 'U'}
             </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-white truncate tracking-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-tighter truncate">{user?.email || 'user@hiremetric'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-xl hover:bg-rose-500/10 text-stone-300 dark:text-stone-600 hover:text-rose-500 transition-colors"
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
