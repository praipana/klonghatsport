import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  SportType,
  CategoryLevel,
  Match,
  SPORT_LABELS,
  CATEGORY_LABELS,
  STAGE_LABELS,
  Referee,
} from '../types';
import {
  ShieldAlert,
  Radio,
  Sparkles,
  Trophy,
  Plus,
  Minus,
  Trash2,
  Send,
  UserCheck,
  Award,
  RefreshCw,
  Clock,
  Play,
  CheckCircle2,
  GitFork,
  Sliders,
  FileSpreadsheet,
  Users,
  Scale,
  ExternalLink,
  Edit,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { GoogleAuthBanner } from './GoogleAuthBanner';

export const AdminControlPanel: React.FC = () => {
  const {
    matches,
    teams,
    referees,
    schools,
    updateMatchScore,
    updateMatchStatus,
    assignReferees,
    autoGenerateBracket,
    createMatch,
    deleteMatch,
    addReferee,
    deleteReferee,
    sendNotification,
    batchGenerateCertificatesForMatch,
    resetToDefaultData,
    simulateLiveEvent,
    setActiveTab,
  } = useTournament();

  const [activeAdminSection, setActiveAdminSection] = useState<
    'scores' | 'brackets' | 'referees' | 'broadcast' | 'certs'
  >('scores');
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  // Quick Score Selector
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const selectedMatch = matches.find(m => m.id === selectedMatchId) || matches[0];

  // New Match Form State
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [newSport, setNewSport] = useState<SportType>('football');
  const [newCategory, setNewCategory] = useState<CategoryLevel>('primary_upper_male');
  const [newStage, setNewStage] = useState<Match['stage']>('semi');
  const [newTeam1Id, setNewTeam1Id] = useState('');
  const [newTeam2Id, setNewTeam2Id] = useState('');
  const [newVenue, setNewVenue] = useState('สนามฟุตบอล 1 (สนามกลางอำเภอคลองหาด)');
  const [newTime, setNewTime] = useState('14:00 น.');
  const [newDate, setNewDate] = useState('2026-09-03');

  // Referee Modal State
  const [showNewRefModal, setShowNewRefModal] = useState(false);
  const [refName, setRefName] = useState('');
  const [refAffiliation, setRefAffiliation] = useState('สมาคมผู้ตัดสินกีฬาอำเภอคลองหาด');
  const [refPhone, setRefPhone] = useState('081-XXX-XXXX');

  // Custom Quick Broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Filter available teams for new match
  const filteredTeams = teams.filter(t => t.sport === newSport && t.category === newCategory);

  const handleCreateMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam1Id || !newTeam2Id || newTeam1Id === newTeam2Id) {
      alert('กรุณาเลือกทีมที่ 1 และทีมที่ 2 ให้ถูกต้อง (ต้องไม่เป็นทีมเดียวกัน)');
      return;
    }

    const t1 = teams.find(t => t.id === newTeam1Id);
    const t2 = teams.find(t => t.id === newTeam2Id);
    if (!t1 || !t2) return;

    createMatch({
      sport: newSport,
      category: newCategory,
      stage: newStage,
      team1Id: t1.id,
      team1Name: t1.name,
      team1School: t1.schoolName,
      team2Id: t2.id,
      team2Name: t2.name,
      team2School: t2.schoolName,
      venue: newVenue,
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'scheduled',
      score: { team1Score: 0, team2Score: 0, events: [] },
      referees: { head: referees[0], scorer: referees[3] },
    });

    setShowNewMatchModal(false);
  };

  const handleAddRefereeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName) return;
    addReferee({
      name: refName,
      role: 'head_referee',
      affiliation: refAffiliation,
      phone: refPhone,
      sportsSpecialty: ['football', 'volleyball', 'takraw', 'petanque'],
    });
    setRefName('');
    setShowNewRefModal(false);
  };

  const handleQuickBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    sendNotification(broadcastTitle, broadcastMessage, 'announcement');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Command Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              TOURNAMENT COMMAND CENTER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            แผงควบคุมฝ่ายจัดการแข่งขัน (Admin Dashboard)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            จัดการข้อมูลการแข่งขันทั้งหมดภายในหน้าเดียว บันทึกผลการแข่งขัน นัดหมายกรรมการ จัดสายอัตโนมัติ และออกเกียรติบัตร
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowSheetsModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="บันทึกและเชื่อมโยงฐานข้อมูลทุกลิงก์ไปยัง Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ซิงค์ Google Sheets</span>
          </button>

          <button
            onClick={() => {
              if (confirm('คุณต้องการคืนค่าข้อมูลเริ่มต้นของการแข่งขันทั้งหมดใช่หรือไม่?')) {
                resetToDefaultData();
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Google Authentication & Permissions Banner */}
      <GoogleAuthBanner contextName="ศูนย์ควบคุมจัดการการแข่งขัน (Admin Panel)" />

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 scrollbar-none">
        <button
          onClick={() => setActiveAdminSection('scores')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeAdminSection === 'scores'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>บันทึกผลการแข่งขัน</span>
        </button>

        <button
          onClick={() => setActiveAdminSection('brackets')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeAdminSection === 'brackets'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>จัดสายแข่ง & เพิ่มแมตช์</span>
        </button>

        <button
          onClick={() => setActiveAdminSection('referees')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeAdminSection === 'referees'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>แต่งตั้งกรรมการ</span>
        </button>

        <button
          onClick={() => setActiveAdminSection('broadcast')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeAdminSection === 'broadcast'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>กระจายแจ้งเตือนด่วน</span>
        </button>

        <button
          onClick={() => setActiveAdminSection('certs')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeAdminSection === 'certs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>อนุมัติเกียรติบัตร</span>
        </button>

        <button
          onClick={() => setActiveTab('registration')}
          className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 ml-auto border border-slate-200 bg-white"
          title="ไปที่ระบบลงทะเบียนเพื่อแก้ไขข้อมูลทีมกีฬาทุกประเภท"
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>แก้ไขข้อมูลทีมกีฬา ({teams.length} ทีม)</span>
        </button>
      </div>

      {/* SECTION 1: SCORE CONTROLLER */}
      {activeAdminSection === 'scores' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Match Selector List */}
          <div className="lg:col-span-4 space-y-3 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>เลือกคู่การแข่งขัน</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">{matches.length} คู่</span>
            </h3>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {matches.map(m => {
                const isSelected = selectedMatch?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-emerald-800">
                        {SPORT_LABELS[m.sport]?.nameTh} (คู่ที่ {m.matchNumber})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'live'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : m.status === 'finished'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {m.status === 'live' ? 'สด 🔴' : m.status === 'finished' ? 'จบ' : 'รอแข่ง'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span className="truncate flex-1">{m.team1Name}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 font-mono text-emerald-700 mx-2 shadow-xs">
                        {m.score.team1Score} - {m.score.team2Score}
                      </span>
                      <span className="truncate flex-1 text-right">{m.team2Name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Match Controller Panel */}
          {selectedMatch ? (
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-emerald-700">
                    {SPORT_LABELS[selectedMatch.sport]?.nameTh} • {CATEGORY_LABELS[selectedMatch.category]?.nameTh}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    คู่ที่ {selectedMatch.matchNumber}: {selectedMatch.team1Name} พบ {selectedMatch.team2Name}
                  </h3>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => updateMatchStatus(selectedMatch.id, 'scheduled')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMatch.status === 'scheduled' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    รอแข่ง
                  </button>
                  <button
                    onClick={() => updateMatchStatus(selectedMatch.id, 'live')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMatch.status === 'live' ? 'bg-rose-500 text-white shadow-sm animate-pulse' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    สด (LIVE)
                  </button>
                  <button
                    onClick={() => {
                      const winner =
                        selectedMatch.score.team1Score > selectedMatch.score.team2Score
                          ? selectedMatch.team1Id
                          : selectedMatch.score.team2Score > selectedMatch.score.team1Score
                          ? selectedMatch.team2Id
                          : undefined;
                      updateMatchStatus(selectedMatch.id, 'finished', winner);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMatch.status === 'finished' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    จบการแข่งขัน
                  </button>
                </div>
              </div>

              {/* Quick Score Increments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                {/* Team 1 Control */}
                <div className="text-center space-y-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{selectedMatch.team1Name}</h4>
                  <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-700">
                    {selectedMatch.score.team1Score}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          Math.max(0, selectedMatch.score.team1Score - 1),
                          selectedMatch.score.team2Score
                        )
                      }
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      title="ลด 1 แต้ม"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          selectedMatch.score.team1Score + 1,
                          selectedMatch.score.team2Score
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      +1 คะแนน
                    </button>
                    <button
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          selectedMatch.score.team1Score + 3,
                          selectedMatch.score.team2Score
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer"
                    >
                      +3
                    </button>
                  </div>
                </div>

                {/* Team 2 Control */}
                <div className="text-center space-y-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{selectedMatch.team2Name}</h4>
                  <div className="text-4xl sm:text-5xl font-mono font-black text-amber-700">
                    {selectedMatch.score.team2Score}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          selectedMatch.score.team1Score,
                          Math.max(0, selectedMatch.score.team2Score - 1)
                        )
                      }
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      title="ลด 1 แต้ม"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          selectedMatch.score.team1Score,
                          selectedMatch.score.team2Score + 1
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                    >
                      +1 คะแนน
                    </button>
                    <button
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          selectedMatch.score.team1Score,
                          selectedMatch.score.team2Score + 3
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold cursor-pointer"
                    >
                      +3
                    </button>
                  </div>
                </div>
              </div>

              {/* Period / Halftime Quick Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">ช่วงเวลาการแข่งขันปัจจุบัน</label>
                <div className="flex flex-wrap items-center gap-2">
                  {['ครึ่งแรก', 'พักครึ่งเวลา', 'ครึ่งหลัง', 'ต่อเวลาพิเศษ', 'ดวลจุดโทษ', 'เซตที่ 1', 'เซตที่ 2', 'เซตที่ 3 ตัดสิน', 'จบการแข่งขัน'].map(period => (
                    <button
                      key={period}
                      onClick={() =>
                        updateMatchScore(
                          selectedMatch.id,
                          selectedMatch.score.team1Score,
                          selectedMatch.score.team2Score,
                          period
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedMatch.score.currentPeriod === period
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Winner Selector & Auto Certificate Batch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">กำหนดผู้ชนะการแข่งขัน</span>
                    <span className="text-[11px] text-slate-500">
                      ปัจจุบัน:{' '}
                      {selectedMatch.winnerTeamId === selectedMatch.team1Id
                        ? selectedMatch.team1Name
                        : selectedMatch.winnerTeamId === selectedMatch.team2Id
                        ? selectedMatch.team2Name
                        : 'ยังไม่ระบุ'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMatchStatus(selectedMatch.id, 'finished', selectedMatch.team1Id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    🏆 {selectedMatch.team1Name} ชนะ
                  </button>
                  <button
                    onClick={() => updateMatchStatus(selectedMatch.id, 'finished', selectedMatch.team2Id)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    🏆 {selectedMatch.team2Name} ชนะ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              ไม่มีแมตช์ที่เลือก
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: BRACKETS & NEW MATCH MAKER */}
      {activeAdminSection === 'brackets' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitFork className="w-5 h-5 text-emerald-600" />
                <span>เครื่องมือจับสลากประกบคู่ & จัดโปรแกรมการแข่งขัน</span>
              </h3>
              <p className="text-xs text-slate-500">
                สุ่มจับคู่สายการแข่งขันอัตโนมัติจากทีมที่ลงทะเบียน หรือสร้างโปรแกรมแมตช์แบบกำหนดเอง
              </p>
            </div>

            <button
              onClick={() => setShowNewMatchModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มคู่แข่งขันเดี่ยว</span>
            </button>
          </div>

          {/* Quick 1-Click Auto-Draw Generator Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(SPORT_LABELS) as SportType[]).map(sport => (
              <div key={sport} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{SPORT_LABELS[sport].icon}</span>
                  <h4 className="text-sm font-bold text-slate-900">{SPORT_LABELS[sport].nameTh}</h4>
                </div>

                <div className="space-y-1.5">
                  {(Object.keys(CATEGORY_LABELS) as CategoryLevel[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => autoGenerateBracket(sport, cat)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate">{CATEGORY_LABELS[cat].shortTh}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">สุ่มสาย ➔</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Match List Management Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">คู่ที่</th>
                  <th className="p-3">กีฬา / รุ่น</th>
                  <th className="p-3">รอบ</th>
                  <th className="p-3">การประกบคู่</th>
                  <th className="p-3">สนาม / เวลา</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.map(m => (
                  <tr key={m.id} className="text-slate-800 hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-700">#{m.matchNumber}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900">{SPORT_LABELS[m.sport]?.nameTh}</span>
                      <span className="block text-[10px] text-slate-500">{CATEGORY_LABELS[m.category]?.shortTh}</span>
                    </td>
                    <td className="p-3 text-slate-700">{STAGE_LABELS[m.stage]}</td>
                    <td className="p-3 font-medium">
                      {m.team1Name} <span className="text-slate-400 font-normal">พบ</span> {m.team2Name}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{m.venue}</div>
                      <div className="text-[10px] text-slate-400">{m.scheduledDate} ({m.scheduledTime})</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'live'
                            ? 'bg-rose-500 text-white'
                            : m.status === 'finished'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteMatch(m.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="ลบแมตช์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: REFEREES APPOINTMENT */}
      {activeAdminSection === 'referees' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>บัญชีรายชื่อกรรมการผู้ตัดสิน & ผู้บันทึกเวลา ({referees.length} ท่าน)</span>
              </h3>
              <p className="text-xs text-slate-500">
                แต่งตั้งคณะกรรมการผู้ตัดสินและเจ้าหน้าที่เทคนิคประจำการแข่งขันแต่ละสนาม
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('referees')}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-105"
              >
                <Scale className="w-4 h-4 text-amber-700" />
                <span>เปิดระบบลงทะเบียน & จัดตารางผู้ตัดสิน</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              </button>

              <button
                onClick={() => setShowNewRefModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ แต่งตั้งกรรมการใหม่</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {referees.map(ref => (
              <div key={ref.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{ref.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ref.affiliation}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">โทร: {ref.phone}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ref.sportsSpecialty.map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-emerald-800 text-[10px] font-medium">
                        {SPORT_LABELS[s]?.nameTh || s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteReferee(ref.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  title="ลบ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: BROADCAST ALERT */}
      {activeAdminSection === 'broadcast' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <span>กระจายข้อความแจ้งเตือนด่วน (Instant In-App Push Dispatcher)</span>
          </h3>
          <p className="text-xs text-slate-500">
            ส่งการแจ้งเตือนแบบป๊อปอัปและเสียงนกหวีดไปยังผู้ใช้งานและผู้ชมแอปพลิเคชันทุกคนทันที
          </p>

          <form onSubmit={handleQuickBroadcast} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">หัวข้อการแจ้งเตือน</label>
              <input
                type="text"
                placeholder="เช่น 🚨 เปลี่ยนแปลงสนามแข่งขันคู่ที่ 103"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ข้อความรายละเอียด</label>
              <textarea
                rows={3}
                placeholder="พิมพ์ข้อความที่ต้องการแจ้งเตือน..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>กระจายการแจ้งเตือนทันที</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 5: CERTIFICATES APPROVAL */}
      {activeAdminSection === 'certs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>ระบบออกเกียรติบัตรอัตโนมัติสำหรับคู่ชิงชนะเลิศ</span>
          </h3>
          <p className="text-xs text-slate-500">
            ระบบจะสร้างเกียรติบัตรเหรียญทอง เหรียญเงิน เหรียญทองแดง และผู้ฝึกสอนโดยอัตโนมัติเมื่อสิ้นสุดทัวร์นาเมนต์
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {matches
              .filter(m => m.stage === 'final' || m.status === 'finished')
              .map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">{SPORT_LABELS[m.sport]?.nameTh}</span>
                    <span className="text-slate-500 font-mono">คู่ที่ {m.matchNumber}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {m.team1Name} VS {m.team2Name}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    ผู้ชนะ: {m.winnerTeamId ? (m.winnerTeamId === m.team1Id ? m.team1Name : m.team2Name) : 'ยังไม่จบ'}
                  </div>

                  <button
                    onClick={() => {
                      batchGenerateCertificatesForMatch(m.id);
                      setActiveTab('certificates');
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>ออกเกียรติบัตรชุดนี้ ➔</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* New Match Modal */}
      {showNewMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleCreateMatchSubmit} className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            <h3 className="text-base font-bold text-slate-900">สร้างคู่การแข่งขันใหม่</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">กีฬา</label>
                <select
                  value={newSport}
                  onChange={e => setNewSport(e.target.value as SportType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                >
                  {(Object.keys(SPORT_LABELS) as SportType[]).map(s => (
                    <option key={s} value={s}>{SPORT_LABELS[s].nameTh}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ระดับชั้น</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as CategoryLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                >
                  {(Object.keys(CATEGORY_LABELS) as CategoryLevel[]).map(c => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c].shortTh}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ทีมที่ 1</label>
                <select
                  value={newTeam1Id}
                  onChange={e => setNewTeam1Id(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                  required
                >
                  <option value="">-- เลือกทีม 1 --</option>
                  {filteredTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.schoolName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ทีมที่ 2</label>
                <select
                  value={newTeam2Id}
                  onChange={e => setNewTeam2Id(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900"
                  required
                >
                  <option value="">-- เลือกทีม 2 --</option>
                  {filteredTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.schoolName})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">สถานที่แข่งขัน / สนาม</label>
              <input
                type="text"
                value={newVenue}
                onChange={e => setNewVenue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">วันที่</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">เวลา</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewMatchModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                สร้างแมตช์
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Referee Modal */}
      {showNewRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleAddRefereeSubmit} className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            <h3 className="text-base font-bold text-slate-900">แต่งตั้งกรรมการผู้ตัดสินใหม่</h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ชื่อ-นามสกุล พร้อมคำนำหน้า</label>
              <input
                type="text"
                placeholder="เช่น อาจารย์ประสิทธิ์ พัฒนา"
                value={refName}
                onChange={e => setRefName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">สังกัด / หน่วยงาน</label>
              <input
                type="text"
                value={refAffiliation}
                onChange={e => setRefAffiliation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={refPhone}
                onChange={e => setRefPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewRefModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                บันทึกรายชื่อ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Google Sheets Multi-Database Sync Modal */}
      <GoogleSheetsSyncModal isOpen={showSheetsModal} onClose={() => setShowSheetsModal(false)} />
    </div>
  );
};
