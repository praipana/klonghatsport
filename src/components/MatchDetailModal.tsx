import React, { useState } from 'react';
import { Match, MatchScoreEvent, SPORT_LABELS, CATEGORY_LABELS, STAGE_LABELS } from '../types';
import { useTournament } from '../context/TournamentContext';
import { VisualMatchTimeline } from './VisualMatchTimeline';
import {
  X,
  Trophy,
  Shield,
  Clock,
  MapPin,
  UserCheck,
  Plus,
  Radio,
  Flame,
  Award,
  Scale,
  ChevronRight,
} from 'lucide-react';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const { teams, isAdmin, updateMatchScore, addMatchEvent, updateMatchStatus, setActiveTab } = useTournament();

  const [newEventMinute, setNewEventMinute] = useState<number>(1);
  const [newEventTeamId, setNewEventTeamId] = useState<string>('');
  const [newEventType, setNewEventType] = useState<MatchScoreEvent['type']>('goal');
  const [newEventDetail, setNewEventDetail] = useState<string>('');
  const [newEventScorer, setNewEventScorer] = useState<string>('');

  if (!match) return null;

  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);
  const sportInfo = SPORT_LABELS[match.sport];
  const catInfo = CATEGORY_LABELS[match.category];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventDetail) return;
    const selectedTeamId = newEventTeamId || match.team1Id;
    addMatchEvent(match.id, {
      timeMinute: newEventMinute,
      teamId: selectedTeamId,
      type: newEventType,
      detail: newEventDetail,
      scorerName: newEventScorer || undefined,
    });

    // Auto increment score if goal/point
    if (newEventType === 'goal' || newEventType === 'point') {
      if (selectedTeamId === match.team1Id) {
        updateMatchScore(match.id, match.score.team1Score + 1, match.score.team2Score);
      } else {
        updateMatchScore(match.id, match.score.team1Score, match.score.team2Score + 1);
      }
    }

    setNewEventDetail('');
    setNewEventScorer('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
            <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white border border-white/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span>{sportInfo.icon}</span>
              <span>{sportInfo.nameTh}</span>
            </span>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${catInfo.badgeColor} bg-white`}>
              {catInfo.nameTh}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-900/40 text-emerald-100 text-xs font-bold border border-emerald-400/30">
              {STAGE_LABELS[match.stage]}
            </span>
            {match.status === 'live' && (
              <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-black flex items-center gap-1 animate-pulse shadow-sm">
                <Radio className="w-3.5 h-3.5" />
                กำลังแข่งขัน
              </span>
            )}
            {match.status === 'finished' && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                จบการแข่งขัน
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white pr-8">
            คู่ที่ {match.matchNumber}: {match.team1Name} VS {match.team2Name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-emerald-100">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {match.scheduledDate} ({match.scheduledTime})
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {match.venue}
            </span>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1">
          {/* Scoreboard Big Display */}
          <div className="p-5 sm:p-7 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 text-center">
              {/* Team 1 */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-lg mb-2 shadow-sm">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 truncate max-w-full">{match.team1Name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-full">{match.team1School}</p>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 flex items-center justify-center gap-2 sm:gap-3">
                  <span className={match.winnerTeamId === match.team1Id ? 'text-amber-500' : 'text-slate-900'}>
                    {match.score.team1Score}
                  </span>
                  <span className="text-slate-400 font-light">-</span>
                  <span className={match.winnerTeamId === match.team2Id ? 'text-amber-500' : 'text-slate-900'}>
                    {match.score.team2Score}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-3 py-0.5 mt-2 rounded-full bg-slate-200 text-slate-800 shadow-sm">
                  {match.score.currentPeriod || 'ยังไม่เริ่ม'}
                </span>

                {/* Set scores if volleyball/takraw */}
                {match.score.team1Sets && match.score.team1Sets.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap justify-center">
                    <span>เซต:</span>
                    {match.score.team1Sets.map((s1, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-xs">
                        {s1}-{match.score.team2Sets?.[idx] || 0}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-lg mb-2 shadow-sm">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 truncate max-w-full">{match.team2Name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-full">{match.team2School}</p>
              </div>
            </div>

            {/* Winner Announcement Badge */}
            {match.status === 'finished' && match.winnerTeamId && (
              <div className="mt-5 p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center gap-2 text-amber-900 text-xs sm:text-sm font-bold shadow-sm">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span>ผู้ชนะการแข่งขัน: {match.winnerTeamId === match.team1Id ? match.team1Name : match.team2Name}</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Match Timeline / Events */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>เหตุการณ์สำคัญในเกม (Timeline)</span>
                </h4>
              </div>

              <VisualMatchTimeline match={match} />

              {/* Admin Add Event Form */}
              {isAdmin && (
                <form onSubmit={handleAddEvent} className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-inner">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    บันทึกเหตุการณ์สด (Admin)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">นาทีที่</label>
                      <input
                        type="number"
                        value={newEventMinute}
                        onChange={e => setNewEventMinute(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                        min={1}
                        max={120}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ทีม</label>
                      <select
                        value={newEventTeamId}
                        onChange={e => setNewEventTeamId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                      >
                        <option value={match.team1Id}>{match.team1Name}</option>
                        <option value={match.team2Id}>{match.team2Name}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ประเภท</label>
                      <select
                        value={newEventType}
                        onChange={e => setNewEventType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                      >
                        <option value="goal">⚽ ประตู (Goal)</option>
                        <option value="point">🎯 คะแนน (Point)</option>
                        <option value="foul">⚠️ ฟาวล์ (Foul)</option>
                        <option value="timeout">⏱️ เวลานอก (Time-out)</option>
                        <option value="yellow_card">🟨 ใบเหลือง</option>
                        <option value="red_card">🟥 ใบแดง</option>
                        <option value="substitute">🔄 เปลี่ยนตัว</option>
                        <option value="set_win">🏆 จบเซต</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="รายละเอียดเหตุการณ์..."
                      value={newEventDetail}
                      onChange={e => setNewEventDetail(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ชื่อผู้ทำแต้ม (ถ้ามี)..."
                      value={newEventScorer}
                      onChange={e => setNewEventScorer(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-sm"
                  >
                    + บันทึกเหตุการณ์ & อัปเดตสกอร์
                  </button>
                </form>
              )}
            </div>

            {/* Referees & Team Rosters */}
            <div className="space-y-5">
              {/* Referees */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>คณะกรรมการผู้ตัดสินประจำแมตช์</span>
                  </h4>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('referees');
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <span>จัดการ/เปลี่ยนผู้ตัดสิน</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">⚖️ ผู้ตัดสินหลัก:</span>
                      <span className="font-bold text-slate-800">
                        {match.referees?.head?.name || 'ยังไม่ได้มอบหมาย'}
                      </span>
                    </div>
                    {match.referees?.head && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-medium">
                        {match.referees.head.affiliation}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">🚩 ผู้ช่วยผู้ตัดสิน / กำกับเส้น:</span>
                      <span className="font-bold text-slate-800">
                        {match.referees?.assistants?.[0]?.name || 'ยังไม่ได้มอบหมาย'}
                      </span>
                    </div>
                    {match.referees?.assistants?.[0] && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                        {match.referees.assistants[0].affiliation}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-slate-500 block text-[11px]">⏱️ ผู้บันทึกคะแนน & เวลา:</span>
                      <span className="font-bold text-slate-800">
                        {match.referees?.scorer?.name || 'ยังไม่ได้มอบหมาย'}
                      </span>
                    </div>
                    {match.referees?.scorer && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-medium">
                        {match.referees.scorer.affiliation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lineup Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-emerald-800 mb-2 truncate">{match.team1Name}</h5>
                  <p className="text-[11px] text-slate-600 mb-2">โค้ช: {team1?.coachName || '-'}</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {team1?.roster.slice(0, 5).map(ath => (
                      <div key={ath.id} className="text-slate-700 flex items-center justify-between">
                        <span>#{ath.jerseyNumber || '-'} {ath.name}</span>
                        <span className="text-[10px] text-slate-500">{ath.grade}</span>
                      </div>
                    )) || <span className="text-slate-400">ไม่มีรายชื่อ</span>}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-amber-800 mb-2 truncate">{match.team2Name}</h5>
                  <p className="text-[11px] text-slate-600 mb-2">โค้ช: {team2?.coachName || '-'}</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {team2?.roster.slice(0, 5).map(ath => (
                      <div key={ath.id} className="text-slate-700 flex items-center justify-between">
                        <span>#{ath.jerseyNumber || '-'} {ath.name}</span>
                        <span className="text-[10px] text-slate-500">{ath.grade}</span>
                      </div>
                    )) || <span className="text-slate-400">ไม่มีรายชื่อ</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-md">{match.notes || 'การแข่งขันกีฬานักเรียนคลองหาด'}</span>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
