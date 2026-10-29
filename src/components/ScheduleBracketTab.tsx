import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SportType, CategoryLevel, SPORT_LABELS, CATEGORY_LABELS, STAGE_LABELS, Match } from '../types';
import { MatchDetailModal } from './MatchDetailModal';
import {
  Calendar,
  Trophy,
  GitFork,
  Clock,
  MapPin,
  UserCheck,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Scale,
} from 'lucide-react';

export const ScheduleBracketTab: React.FC = () => {
  const { matches, autoGenerateBracket, isAdmin, setActiveTab } = useTournament();

  const [selectedSport, setSelectedSport] = useState<SportType>('football');
  const [selectedCategory, setSelectedCategory] = useState<CategoryLevel>('primary_upper_male');
  const [viewMode, setViewMode] = useState<'bracket' | 'schedule'>('bracket');
  const [activeModalMatch, setActiveModalMatch] = useState<Match | null>(null);

  // Filter matches for bracket view
  const categoryMatches = matches.filter(
    m => m.sport === selectedSport && m.category === selectedCategory
  );

  // Group by stage for tree
  const semiMatches = categoryMatches.filter(m => m.stage === 'semi');
  const finalMatches = categoryMatches.filter(m => m.stage === 'final');
  const bronzeMatches = categoryMatches.filter(m => m.stage === 'bronze');

  const sportInfo = SPORT_LABELS[selectedSport];
  const catInfo = CATEGORY_LABELS[selectedCategory];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <GitFork className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              ผังสายการแข่งขัน & ตารางจับคู่ (Tournament Brackets)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            แผนผังรอบแบ่งสาย สายบน-สายล่าง และตารางเวลาแข่งขันพร้อมรายชื่อกรรมการผู้ตัดสิน
          </p>
        </div>

        {/* View Toggle & Referee Assignment Button */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('referees')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105 cursor-pointer"
            title="ไปที่เมนูลงทะเบียนและจัดผู้ตัดสินลงตารางแข่งขัน"
          >
            <Scale className="w-4 h-4 text-amber-600" />
            <span>จัดผู้ตัดสินลงตาราง</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('bracket')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                viewMode === 'bracket'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>ผังสายการแข่ง (Bracket)</span>
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                viewMode === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>ตารางการแข่งขัน (Schedule)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors: Sport & Category */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Sports */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-700 shrink-0">เลือกกีฬา:</span>
          {(Object.keys(SPORT_LABELS) as SportType[]).map(s => {
            const info = SPORT_LABELS[s];
            const isSel = selectedSport === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedSport(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.nameTh}</span>
              </button>
            );
          })}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-700 shrink-0">รุ่นอายุ/ระดับชั้น:</span>
          {(Object.keys(CATEGORY_LABELS) as CategoryLevel[]).map(c => {
            const isSel = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {CATEGORY_LABELS[c].nameTh}
              </button>
            );
          })}

          {/* Quick Auto Bracket Draw Button */}
          {isAdmin && (
            <button
              onClick={() => autoGenerateBracket(selectedSport, selectedCategory)}
              className="ml-auto px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all hover:scale-105 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>สุ่มจับสลากจัดสายแข่ง</span>
            </button>
          )}
        </div>
      </div>

      {/* Bracket View */}
      {viewMode === 'bracket' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 overflow-x-auto shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 min-w-[700px]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sportInfo.icon}</span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ผังรอบน็อกเอาท์: {sportInfo.nameTh} ({catInfo.nameTh})
                </h3>
                <p className="text-xs text-slate-500">คลิกที่คู่แข่งขันเพื่อดูรายละเอียดและสถิติ</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>ผู้ชนะผ่านเข้ารอบ</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>เหรียญทอง</span>
              </div>
            </div>
          </div>

          {categoryMatches.length === 0 ? (
            <div className="text-center py-16">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">ยังไม่มีการจัดสายการแข่งในประเภทนี้</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                สามารถสลับไปที่ "แผงควบคุม Admin" หรือกดปุ่ม "สุ่มจับสลากจัดสายแข่ง" ด้านบนเพื่อเริ่มจัดสาย
              </p>
            </div>
          ) : (
            <div className="min-w-[750px] flex items-center justify-between gap-8 py-4">
              {/* Round 1 / Semi Finals Column */}
              <div className="w-64 space-y-6">
                <div className="text-center pb-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    รอบรองชนะเลิศ (Semi-Finals)
                  </span>
                </div>

                {semiMatches.length > 0 ? (
                  semiMatches.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setActiveModalMatch(m)}
                      className="bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-3.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 pb-1.5 border-b border-slate-200">
                        <span className="font-semibold text-slate-700">คู่ที่ {m.matchNumber}</span>
                        <span className="font-mono">{m.scheduledTime}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                            m.winnerTeamId === m.team1Id
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                              : 'text-slate-800'
                          }`}
                        >
                          <span className="truncate">{m.team1Name}</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                            {m.score.team1Score}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                            m.winnerTeamId === m.team2Id
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                              : 'text-slate-800'
                          }`}
                        >
                          <span className="truncate">{m.team2Name}</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                            {m.score.team2Score}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    เข้าสู่รอบชิงชนะเลิศโดยตรง
                  </div>
                )}
              </div>

              {/* Bracket Tree Connectors */}
              <div className="flex flex-col items-center justify-center text-slate-400">
                <ChevronRight className="w-8 h-8 text-emerald-500" />
              </div>

              {/* Final Match Column */}
              <div className="w-72 space-y-4">
                <div className="text-center pb-2">
                  <span className="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 mx-auto w-fit shadow-xs">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    รอบชิงชนะเลิศ (Gold Final)
                  </span>
                </div>

                {finalMatches.map(m => {
                  const isFinished = m.status === 'finished';
                  return (
                    <div
                      key={m.id}
                      onClick={() => setActiveModalMatch(m)}
                      className={`bg-slate-50 border rounded-3xl p-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${
                        isFinished
                          ? 'border-amber-400 bg-amber-50/30'
                          : m.status === 'live'
                          ? 'border-emerald-500 animate-pulse'
                          : 'border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">คู่ชิงชนะเลิศ (คู่ที่ {m.matchNumber})</span>
                        <span className="font-mono">{m.scheduledTime}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                            m.winnerTeamId === m.team1Id
                              ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                              : 'text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold">{m.team1Name}</span>
                          </div>
                          <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-900">
                            {m.score.team1Score}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                            m.winnerTeamId === m.team2Id
                              ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                              : 'text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate font-semibold">{m.team2Name}</span>
                          </div>
                          <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-900">
                            {m.score.team2Score}
                          </span>
                        </div>
                      </div>

                      {/* Referee Tag */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-slate-700 font-medium">
                            {m.referees?.head?.name || 'ยังไม่ระบุผู้ตัดสิน'}
                          </span>
                        </span>
                        <span className="text-emerald-700 font-bold">ดูรายงาน →</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Champion Podium Column */}
              <div className="w-56 text-center space-y-4">
                <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-300 shadow-sm flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-2xl shadow-sm mb-3">
                    🥇
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    เจ้าของเหรียญทอง (Champion)
                  </h4>
                  {finalMatches.length > 0 && finalMatches[0].winnerTeamId ? (
                    <div className="mt-2">
                      <div className="text-base font-bold text-slate-900">
                        {finalMatches[0].winnerTeamId === finalMatches[0].team1Id
                          ? finalMatches[0].team1Name
                          : finalMatches[0].team2Name}
                      </div>
                      <p className="text-xs text-amber-800 font-semibold mt-0.5">
                        {finalMatches[0].winnerTeamId === finalMatches[0].team1Id
                          ? finalMatches[0].team1School
                          : finalMatches[0].team2School}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2 font-medium">รอผลการแข่งขันรอบชิงฯ</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Schedule List View */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>ตารางโปรแกรมการแข่งขันและสนามแข่งขัน</span>
            </h3>

            <div className="space-y-3">
              {categoryMatches.map(m => (
                <div
                  key={m.id}
                  onClick={() => setActiveModalMatch(m)}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-100 shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono font-bold text-emerald-700 text-sm shrink-0">
                      #{m.matchNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {m.team1Name} <span className="text-emerald-700 font-bold px-1">VS</span> {m.team2Name}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                          {STAGE_LABELS[m.stage]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {m.scheduledDate} ({m.scheduledTime})
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          {m.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">หัวหน้าผู้ตัดสิน</span>
                      <span className="text-slate-700 font-semibold">{m.referees?.head?.name || 'ยังไม่ได้มอบหมาย'}</span>
                    </div>

                    <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-emerald-700 font-mono font-bold text-sm shadow-xs">
                      {m.score.team1Score} - {m.score.team2Score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {activeModalMatch && (
        <MatchDetailModal match={activeModalMatch} onClose={() => setActiveModalMatch(null)} />
      )}
    </div>
  );
};
