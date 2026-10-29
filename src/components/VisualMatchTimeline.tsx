import React from 'react';
import { Match, MatchScoreEvent } from '../types';
import {
  Flame,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

interface VisualMatchTimelineProps {
  match: Match;
  className?: string;
  isCompact?: boolean;
}

export const VisualMatchTimeline: React.FC<VisualMatchTimelineProps> = ({
  match,
  className = '',
  isCompact = false,
}) => {
  const events = match.score.events || [];
  const isFootball = match.sport === 'football';
  const totalDuration = isFootball ? 60 : 50; // max minutes benchmark for timeline progress bar

  // Sort events chronologically (earliest to latest for chronological timeline track)
  const sortedEvents = [...events].sort((a, b) => a.timeMinute - b.timeMinute);

  const getEventBadge = (type: MatchScoreEvent['type']) => {
    switch (type) {
      case 'goal':
        return {
          icon: '⚽',
          label: 'ยิงประตู',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200',
          dotBg: 'bg-emerald-600',
        };
      case 'point':
        return {
          icon: '🎯',
          label: 'ได้แต้ม',
          bg: 'bg-teal-100 text-teal-800 border-teal-300 ring-2 ring-teal-200',
          dotBg: 'bg-teal-600',
        };
      case 'yellow_card':
        return {
          icon: '🟨',
          label: 'ใบเหลือง',
          bg: 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200',
          dotBg: 'bg-amber-500',
        };
      case 'red_card':
        return {
          icon: '🟥',
          label: 'ใบแดง',
          bg: 'bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-200',
          dotBg: 'bg-rose-600',
        };
      case 'foul':
        return {
          icon: '⚠️',
          label: 'ฟาล์ว (Foul)',
          bg: 'bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-200',
          dotBg: 'bg-orange-500',
        };
      case 'timeout':
        return {
          icon: '⏱️',
          label: 'เวลานอก (Time-out)',
          bg: 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-200',
          dotBg: 'bg-purple-600',
        };
      case 'substitute':
        return {
          icon: '🔄',
          label: 'เปลี่ยนตัว',
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          dotBg: 'bg-sky-600',
        };
      case 'set_win':
        return {
          icon: '🏆',
          label: 'ชนะเซต',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300 ring-2 ring-indigo-200',
          dotBg: 'bg-indigo-600',
        };
      default:
        return {
          icon: '⚡',
          label: 'เหตุการณ์',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dotBg: 'bg-slate-500',
        };
    }
  };

  return (
    <div className={`rounded-2xl bg-slate-50 border border-slate-200 p-3.5 sm:p-4 text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
          <span className="font-bold text-slate-800 tracking-wide text-xs flex items-center gap-1.5">
            ไทม์ไลน์เหตุการณ์สำคัญ (Live Match Timeline)
            {match.status === 'live' && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] border border-rose-300 animate-pulse font-bold">
                สด
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {events.length} เหตุการณ์
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-4 text-center text-slate-500 text-[11px] bg-white rounded-xl border border-dashed border-slate-200">
          ยังไม่มีบันทึกเหตุการณ์ (ประตู/คะแนน/ฟาวล์) ในขณะนี้
        </div>
      ) : (
        <div className="space-y-4">
          {/* Horizontal Visual Timeline Bar (Pitch View) */}
          <div className="relative pt-6 pb-2 px-3 bg-white rounded-xl border border-slate-200 shadow-inner">
            {/* Team Legend labels on track */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 font-semibold mb-2">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Shield className="w-3 h-3" />
                {match.team1Name}
              </span>
              <span className="font-mono text-slate-400">0' ────────── {totalDuration}'</span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                {match.team2Name}
                <Shield className="w-3 h-3" />
              </span>
            </div>

            {/* Central Progress Line */}
            <div className="relative h-2 bg-slate-200 rounded-full w-full overflow-visible my-3">
              {/* Half Time Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-400 z-10"
                style={{ left: '50%' }}
                title="พักครึ่งเวลา"
              />

              {/* Event Markers plotted along the track */}
              {sortedEvents.map(ev => {
                const percent = Math.min(96, Math.max(4, (ev.timeMinute / totalDuration) * 100));
                const isTeam1 = ev.teamId === match.team1Id;
                const badge = getEventBadge(ev.type);

                return (
                  <div
                    key={ev.id}
                    className="absolute -top-3.5 -translate-x-1/2 z-20 group cursor-pointer"
                    style={{ left: `${percent}%` }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs shadow-md transition-transform group-hover:scale-125 ${
                        badge.bg
                      } ${isTeam1 ? 'border-emerald-500' : 'border-amber-500'}`}
                    >
                      <span>{badge.icon}</span>
                    </div>

                    {/* Hover Popover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-44 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[10px] text-white pointer-events-none">
                      <div className="flex items-center justify-between font-bold text-emerald-300 border-b border-slate-700 pb-1 mb-1">
                        <span>นาทีที่ {ev.timeMinute}'</span>
                        <span className={isTeam1 ? 'text-emerald-300' : 'text-amber-300'}>
                          {isTeam1 ? match.team1Name : match.team2Name}
                        </span>
                      </div>
                      <p className="text-slate-200">{ev.detail}</p>
                      {ev.scorerName && (
                        <p className="text-amber-300 font-bold mt-0.5">โดย: {ev.scorerName}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sequential Step Timeline List */}
          <div className="relative pl-6 space-y-2.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {sortedEvents
              .slice()
              .reverse()
              .map(ev => {
                const isTeam1 = ev.teamId === match.team1Id;
                const badge = getEventBadge(ev.type);

                return (
                  <div key={ev.id} className="relative group">
                    {/* Node Dot on left line */}
                    <span
                      className={`absolute -left-6 top-2 w-3 h-3 rounded-full border-2 border-white ${badge.dotBg} ring-2 ${
                        isTeam1 ? 'ring-emerald-200' : 'ring-amber-200'
                      }`}
                    />

                    <div
                      className={`p-2.5 rounded-xl border transition-all ${
                        isTeam1
                          ? 'bg-white border-emerald-200 hover:border-emerald-300'
                          : 'bg-white border-amber-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {ev.timeMinute}'
                          </span>
                          <span className="text-xs">{badge.icon}</span>
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {badge.label}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                            isTeam1
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isTeam1 ? match.team1Name : match.team2Name}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 pl-0.5">{ev.detail}</p>
                      {ev.scorerName && (
                        <p className="text-[11px] font-bold text-emerald-700 mt-0.5 pl-0.5">
                          ผู้เล่น: {ev.scorerName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
