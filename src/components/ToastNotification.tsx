import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTournament } from '../context/TournamentContext';
import { Bell, Trophy, Volume2, X, Play, Award } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { activeToast, closeToast, setActiveTab } = useTournament();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'score_update':
        return <span className="text-xl">⚽</span>;
      case 'match_start':
        return <Play className="w-5 h-5 text-blue-400 fill-blue-400" />;
      case 'match_end':
      case 'award':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-sky-400" />;
    }
  };

  const isBlue = activeToast.type === 'score_update' || activeToast.type === 'match_start';
  const isAmber = activeToast.type === 'match_end' || activeToast.type === 'award';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 max-w-md w-full px-4"
      >
        <div className={`backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl flex items-start gap-3.5 border transition-all ${
          isBlue
            ? 'bg-slate-900/95 border-blue-500/50 shadow-blue-950/60 vibrant-glow-blue'
            : isAmber
            ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-950/60 vibrant-glow-amber'
            : 'bg-slate-900/95 border-indigo-500/50 shadow-indigo-950/60 vibrant-glow-indigo'
        }`}>
          <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 border ${
            isBlue
              ? 'bg-blue-500/15 border-blue-500/30'
              : isAmber
              ? 'bg-amber-500/15 border-amber-500/30'
              : 'bg-indigo-500/15 border-indigo-500/30'
          }`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className={`text-sm font-black truncate ${
                isBlue ? 'text-blue-300' : isAmber ? 'text-amber-300' : 'text-indigo-300'
              }`}>
                {activeToast.title}
              </h4>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {activeToast.timestamp}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed line-clamp-2">
              {activeToast.message}
            </p>
            {activeToast.matchId && (
              <button
                onClick={() => {
                  setActiveTab('bracket');
                  closeToast();
                }}
                className={`mt-2 text-[11px] font-black underline underline-offset-2 transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  isBlue ? 'text-blue-400 hover:text-blue-300' : isAmber ? 'text-amber-400 hover:text-amber-300' : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                ดูตารางและสายแข่ง →
              </button>
            )}
          </div>
          <button
            onClick={closeToast}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
