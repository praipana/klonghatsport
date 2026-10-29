import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  SportType,
  CategoryLevel,
  Match,
  SPORT_LABELS,
  CATEGORY_LABELS,
  STAGE_LABELS,
} from '../types';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Megaphone,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Printer,
  CheckCircle2,
  Filter,
  Share2,
  X,
  Volume2,
  FileSpreadsheet,
} from 'lucide-react';

interface AllSportsResultsBulletinProps {
  onSelectSport: (sport: SportType) => void;
  onOpenMatchDetail: (match: Match) => void;
}

export const AllSportsResultsBulletin: React.FC<AllSportsResultsBulletinProps> = ({
  onSelectSport,
  onOpenMatchDetail,
}) => {
  const { matches, sendNotification, soundEnabled } = useTournament();

  const [categoryFilter, setCategoryFilter] = useState<CategoryLevel | 'all'>('all');
  const [selectedSportCard, setSelectedSportCard] = useState<SportType | null>(null);
  const [broadcastAlert, setBroadcastAlert] = useState<{
    sport: SportType;
    title: string;
    detail: string;
  } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Group matches by sport
  const sportsList = Object.keys(SPORT_LABELS) as SportType[];

  // Filter matches based on selected category if set
  const getSportMatches = (sport: SportType) => {
    return matches.filter(m => {
      if (m.sport !== sport) return false;
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      return true;
    });
  };

  // Trigger broadcast announcement for a specific sport
  const broadcastSportResult = (sport: SportType) => {
    const sportMatches = getSportMatches(sport);
    const finishedMatches = sportMatches.filter(m => m.status === 'finished');
    const liveMatches = sportMatches.filter(m => m.status === 'live');
    const sportInfo = SPORT_LABELS[sport];

    if (finishedMatches.length > 0) {
      const topMatch = finishedMatches[finishedMatches.length - 1];
      const winnerName =
        topMatch.winnerTeamId === topMatch.team1Id
          ? topMatch.team1Name
          : topMatch.team2Name;
      const winnerSchool =
        topMatch.winnerTeamId === topMatch.team1Id
          ? topMatch.team1School
          : topMatch.team2School;
      const catName = CATEGORY_LABELS[topMatch.category]?.shortTh || '';

      const scoreText =
        topMatch.score.currentPeriod ||
        `${topMatch.score.team1Score} - ${topMatch.score.team2Score}`;

      const title = `🏆 แจ้งผลการแข่งขัน: ${sportInfo.nameTh} (${catName})`;
      const detail = `ผู้ชนะเลิศเหรียญทอง: ${winnerName} (${winnerSchool}) ชนะสกอร์ ${scoreText} ใน${STAGE_LABELS[topMatch.stage]}`;

      if (soundEnabled) {
        soundEffects.playScoreAlert();
      }
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.65 },
      });

      sendNotification(title, detail, 'award', topMatch.id);
      setBroadcastAlert({ sport, title, detail });
    } else if (liveMatches.length > 0) {
      const liveM = liveMatches[0];
      const title = `🔴 สด! รายงานผลคะแนน: ${sportInfo.nameTh}`;
      const detail = `${liveM.team1Name} ${liveM.score.team1Score} - ${liveM.score.team2Score} ${liveM.team2Name} (${liveM.score.currentPeriod || 'กำลังแข่งขัน'})`;

      if (soundEnabled) {
        soundEffects.playWhistle();
      }
      sendNotification(title, detail, 'score_update', liveM.id);
      setBroadcastAlert({ sport, title, detail });
    } else {
      const title = `📢 แจ้งกำหนดการ: ${sportInfo.nameTh}`;
      const detail = `มีคู่การแข่งขันทั้งหมด ${sportMatches.length} คู่ อยู่ระหว่างรอการแข่งขัน`;
      sendNotification(title, detail, 'match_start');
      setBroadcastAlert({ sport, title, detail });
    }

    // Auto dismiss broadcast alert after 6 seconds
    setTimeout(() => {
      setBroadcastAlert(prev => (prev?.sport === sport ? null : prev));
    }, 6500);
  };

  // Broadcast all finished sports in sequence
  const broadcastAllSportsResults = () => {
    if (soundEnabled) {
      soundEffects.playScoreAlert();
    }
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 },
    });

    const finishedBySport: { sport: SportType; text: string }[] = [];
    sportsList.forEach(sp => {
      const ms = matches.filter(m => m.sport === sp && m.status === 'finished');
      if (ms.length > 0) {
        const last = ms[ms.length - 1];
        const winner =
          last.winnerTeamId === last.team1Id ? last.team1Name : last.team2Name;
        finishedBySport.push({
          sport: sp,
          text: `${SPORT_LABELS[sp].nameTh}: ชนะเลิศ ${winner} (${last.score.currentPeriod || `${last.score.team1Score}-${last.score.team2Score}`})`,
        });
      }
    });

    const title = '📢 ศูนย์แถลงผลการแข่งขัน: สรุปผลเหรียญทองทุกชนิดกีฬา!';
    const detail = `ประกาศผลทางการครบทุกชนิดกีฬาแล้ว (${finishedBySport.length} ชนิดกีฬาที่มีผลตัดสิน) รวมระดับอนุบาล ประถม และมัธยมศึกษาตอนต้น`;

    sendNotification(title, detail, 'award');
    setBroadcastAlert({
      sport: 'football',
      title,
      detail:
        finishedBySport.map(f => f.text).join(' | ') ||
        'ผลการแข่งขันได้รับการปรับปรุงเรียบร้อย',
    });
  };

  // Stats
  const totalMatchesCount = matches.length;
  const finishedMatchesCount = matches.filter(m => m.status === 'finished').length;
  const liveMatchesCount = matches.filter(m => m.status === 'live').length;

  return (
    <div className="space-y-4">
      {/* Live Breaking Ticker */}
      <div className="bg-slate-900 text-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-slate-800 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shrink-0 shadow-xs uppercase tracking-wider animate-pulse">
          <Megaphone className="w-3.5 h-3.5" />
          <span>แจ้งผลด่วน</span>
        </div>

        {/* Scrolling / Rotating Ticker Items */}
        <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-4 text-xs font-medium">
          {matches
            .filter(m => m.status === 'finished' || m.status === 'live')
            .slice(0, 8)
            .map(m => {
              const sp = SPORT_LABELS[m.sport];
              const isFin = m.status === 'finished';
              const winnerName =
                m.winnerTeamId === m.team1Id ? m.team1Name : m.team2Name;
              return (
                <div
                  key={m.id}
                  onClick={() => onOpenMatchDetail(m)}
                  className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 cursor-pointer shrink-0 transition-colors"
                  title="คลิกดูรายงานแมตช์นี้"
                >
                  <span className="text-sm">{sp.icon}</span>
                  <span className="font-bold text-slate-300">{sp.nameTh}:</span>
                  <span className="text-slate-100 font-semibold truncate max-w-[140px] sm:max-w-[180px]">
                    {m.team1Name} {m.score.team1Score}-{m.score.team2Score} {m.team2Name}
                  </span>
                  {isFin ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                      🥇 {winnerName}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-0.5 animate-pulse">
                      🔴 สด
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        <button
          onClick={broadcastAllSportsResults}
          title="แถลงและส่งสัญญาณแจ้งผลทุกกีฬา"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all shadow-xs"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>แถลงผลรวม</span>
        </button>
      </div>

      {/* Broadcast Alert Banner if active */}
      {broadcastAlert && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-4 shadow-lg border border-amber-400 animate-in slide-in-from-top-3 duration-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/30 text-slate-950 shrink-0 mt-0.5 shadow-xs">
              <Megaphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 text-[10px] font-black uppercase">
                  OFFICIAL BROADCAST
                </span>
                <h4 className="font-black text-sm sm:text-base text-slate-950 tracking-tight">
                  {broadcastAlert.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1 leading-snug">
                {broadcastAlert.detail}
              </p>
            </div>
          </div>

          <button
            onClick={() => setBroadcastAlert(null)}
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-950 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Results Bulletin Card Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* Header with Title and Control Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>แดชบอร์ดแจ้งผลการแข่งขันทุกชนิดกีฬา</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    ครบทั้ง 8 ชนิดกีฬา
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  ศูนย์รายงานและประกาศผลการแข่งขันอย่างเป็นทางการ ระดับอนุบาล ประถมศึกษา และมัธยมศึกษาตอนต้น
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={broadcastAllSportsResults}
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-400"
              title="ส่งเสียงและกระจายข้อความแจ้งผลทางการทุกกีฬา"
            >
              <Megaphone className="w-4 h-4" />
              <span>ประกาศแจ้งผลทุกกีฬา</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105 cursor-pointer border border-slate-200"
              title="พิมพ์หรือดาวน์โหลดใบประกาศผลรวม 8 ชนิดกีฬา"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>พิมพ์ใบแจ้งผลรวม</span>
            </button>
          </div>
        </div>

        {/* Quick Category Filtering for Results */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 font-bold shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              กรองผลตามระดับชั้น:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทุกระดับชั้น (อนุบาล - ม.ต้น)
            </button>

            {/* Special Highlight for Secondary Lower (มัธยมศึกษาตอนต้น) */}
            <button
              onClick={() => setCategoryFilter('secondary_lower')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'secondary_lower'
                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>🎓</span>
              <span>มัธยมศึกษาตอนต้น (ม.1 - ม.3)</span>
            </button>

            <button
              onClick={() => setCategoryFilter('primary_upper_male')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                categoryFilter === 'primary_upper_male'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ประถมปลาย (ช)
            </button>

            <button
              onClick={() => setCategoryFilter('primary_upper_female')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                categoryFilter === 'primary_upper_female'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ประถมปลาย (ญ)
            </button>

            <button
              onClick={() => setCategoryFilter('primary_lower')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                categoryFilter === 'primary_lower'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ประถมต้น (ป.1-3)
            </button>

            <button
              onClick={() => setCategoryFilter('kindergarten')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                categoryFilter === 'kindergarten'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              อนุบาล (ปฐมวัย)
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            สรุป: <strong className="text-slate-800">{finishedMatchesCount}</strong> แมตช์จบแล้ว •{' '}
            <strong className="text-rose-600">{liveMatchesCount}</strong> แมตช์สด •{' '}
            <strong className="text-slate-800">{totalMatchesCount}</strong> แมตช์ทั้งหมด
          </div>
        </div>

        {/* 8-Sports Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {sportsList.map(sport => {
            const info = SPORT_LABELS[sport];
            const sportMatches = getSportMatches(sport);
            const finishedMatches = sportMatches.filter(m => m.status === 'finished');
            const liveMatches = sportMatches.filter(m => m.status === 'live');
            const scheduledMatches = sportMatches.filter(m => m.status === 'scheduled');

            // Find best highlight or latest final match
            const finalMatch =
              finishedMatches.find(m => m.stage === 'final') ||
              finishedMatches[finishedMatches.length - 1];
            const currentLive = liveMatches[0];

            const hasGoldAwarded = !!finalMatch && finalMatch.status === 'finished';

            // Distinct categories in this sport
            const categoriesSet = new Set<CategoryLevel>(sportMatches.map(m => m.category));
            const hasSecondary = categoriesSet.has('secondary_lower');

            return (
              <div
                key={sport}
                className={`rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 shadow-sm hover:shadow-md ${
                  liveMatches.length > 0
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                    : hasGoldAwarded
                    ? 'bg-gradient-to-b from-amber-50/50 via-white to-white border-amber-200'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                {/* Sport Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                        {info.icon}
                      </span>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                          {info.nameTh}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {info.nameEn}
                        </span>
                      </div>
                    </div>

                    <div>
                      {liveMatches.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-300 flex items-center gap-1 animate-pulse">
                          <Radio className="w-3 h-3" />
                          สด ({liveMatches.length})
                        </span>
                      ) : hasGoldAwarded ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          มีเหรียญทอง
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                          {sportMatches.length} คู่
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Categories Tags */}
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {Array.from(categoriesSet).map(catKey => {
                      const catInfo = CATEGORY_LABELS[catKey];
                      const isSec = catKey === 'secondary_lower';
                      return (
                        <span
                          key={catKey}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
                            isSec
                              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                              : catInfo?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {catInfo?.shortTh || catKey}
                        </span>
                      );
                    })}
                  </div>

                  {/* Winner / Live / Scheduled Status Block */}
                  <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    {currentLive ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-rose-700 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            กำลังแข่งขันสด
                          </span>
                          <span>{currentLive.score.currentPeriod || 'ครึ่งหลัง'}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs">
                          {currentLive.team1Name} {currentLive.score.team1Score} - {currentLive.score.team2Score} {currentLive.team2Name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {STAGE_LABELS[currentLive.stage]} • {currentLive.venue}
                        </div>
                      </div>
                    ) : finalMatch ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span>🥇</span>
                            <span>ชนะเลิศ (เหรียญทอง)</span>
                          </span>
                          <span className="text-slate-500 font-normal">
                            {CATEGORY_LABELS[finalMatch.category]?.shortTh}
                          </span>
                        </div>
                        <div className="font-black text-slate-900 text-xs leading-snug">
                          {finalMatch.winnerTeamId === finalMatch.team1Id
                            ? finalMatch.team1Name
                            : finalMatch.team2Name}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          {finalMatch.winnerTeamId === finalMatch.team1Id
                            ? finalMatch.team1School
                            : finalMatch.team2School}
                        </div>
                        <div className="mt-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                          ผล: {finalMatch.score.currentPeriod || `${finalMatch.score.team1Score}-${finalMatch.score.team2Score}`}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[11px] py-1">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>อยู่ระหว่างการแข่งขัน</span>
                        </div>
                        <p className="mt-0.5">รอประกาศผลการแข่งขันทางการ</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => broadcastSportResult(sport)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-102"
                    title="ประกาศแจ้งผลกีฬาชนิดนี้ทันที"
                  >
                    <Megaphone className="w-3 h-3 text-amber-600" />
                    <span>ประกาศผล</span>
                  </button>

                  <button
                    onClick={() => onSelectSport(sport)}
                    className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="ดูกระดานคะแนนและแมตช์ทั้งหมดของกีฬานี้"
                  >
                    <span>ดูกระดาน</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Print Summary Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-xl font-black text-slate-900">
                    ใบประกาศผลการแข่งขันอย่างเป็นทางการ (Official Results Report)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  การแข่งขันกีฬานักเรียนอำเภอคลองหาด ประจำปีการศึกษา 2569 • อำเภอคลองหาด จังหวัดสระแก้ว
                </p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Content Table */}
            <div className="space-y-4 text-xs" id="official-print-bulletin">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
                <span>
                  <strong>ระดับที่จัดแข่งขัน:</strong> อนุบาล, ประถมต้น (ป.1-3), ประถมปลาย (ป.4-6 ช/ญ), <strong>มัธยมศึกษาตอนต้น (ม.1-3)</strong>
                </span>
                <span>
                  <strong>วันที่ออกรายงาน:</strong> {new Date().toLocaleDateString('th-TH')}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-[11px] font-bold border-b border-slate-200">
                      <th className="p-3">ชนิดกีฬา</th>
                      <th className="p-3">ระดับชั้น</th>
                      <th className="p-3">ผู้ชนะเลิศ (เหรียญทอง 🥇)</th>
                      <th className="p-3">รองชนะเลิศ (เหรียญเงิน 🥈)</th>
                      <th className="p-3 text-right">คะแนน/สถิติ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matches
                      .filter(m => m.status === 'finished')
                      .map(m => {
                        const sp = SPORT_LABELS[m.sport];
                        const cat = CATEGORY_LABELS[m.category];
                        const winner =
                          m.winnerTeamId === m.team1Id ? m.team1Name : m.team2Name;
                        const runnerUp =
                          m.winnerTeamId === m.team1Id ? m.team2Name : m.team1Name;
                        return (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{sp.icon}</span>
                              <span>{sp.nameTh}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                                {cat?.shortTh || m.category}
                              </span>
                            </td>
                            <td className="p-3 font-black text-amber-700">
                              {winner}
                            </td>
                            <td className="p-3 text-slate-600">
                              {runnerUp}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              {m.score.currentPeriod || `${m.score.team1Score} - ${m.score.team2Score}`}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Print Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>สั่งพิมพ์เอกสารสรุปผล (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
