import React from 'react';
import {
  Dumbbell,
  Calendar,
  PlayCircle,
  Apple,
  LineChart,
  Bot,
  BookOpen,
  Settings,
  Sparkles,
  Flame,
  User,
} from 'lucide-react';
import { UserProfile } from '../types/fitness';

export type ActiveTab = 'plan' | 'session' | 'nutrition' | 'progress' | 'futures' | 'coach' | 'library' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  onOpenAssessment: () => void;
  workoutStreak: number;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenAssessment,
  workoutStreak,
  hasActiveSession,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'plan', label: 'Workout Plan', icon: <Calendar className="w-4 h-4" /> },
    {
      id: 'session',
      label: 'Workout Session',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: hasActiveSession ? 'Active' : undefined,
    },
    { id: 'nutrition', label: 'AI Nutrition', icon: <Apple className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress & Logs', icon: <LineChart className="w-4 h-4" /> },
    { id: 'futures', label: 'Futures', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, badge: 'AI' },
    { id: 'coach', label: 'AI Coach', icon: <Bot className="w-4 h-4" /> },
    { id: 'library', label: 'Exercise Library', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-['Space_Grotesk']">
                  FitBuddy
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                Intelligent Fitness & Nutrition
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono tabular-nums">{workoutStreak}</span>
              <span className="text-[10px] text-amber-300/80 hidden sm:inline">day streak</span>
            </div>

            {/* Profile / Assessment Button */}
            <button
              onClick={onOpenAssessment}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Edit Profile & Re-assess"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline truncate max-w-[100px]">{profile.name}</span>
              <span className="text-[10px] text-slate-400 hidden lg:inline">· {profile.goal.replace('_', ' ')}</span>
            </button>

            {/* Generate Plan Button */}
            <button
              onClick={onOpenAssessment}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs rounded-lg shadow-sm shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">New Plan</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap font-medium rounded-lg transition-colors shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
