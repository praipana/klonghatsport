import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import {
  Trophy,
  Activity,
  Calendar,
  UserPlus,
  Medal,
  Award,
  Bell,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Newspaper,
  CheckCircle2,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Scale,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAdmin,
    setIsAdmin,
    soundEnabled,
    setSoundEnabled,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    matches,
    referees,
    simulateLiveEvent,
    isGoogleSheetsConnected,
    autoSyncToSheets,
    currentUser,
    isGoogleUser,
    setShowAuthModal,
    requireGoogleAuth,
  } = useTournament();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const liveMatches = matches.filter(m => m.status === 'live');
  const sheetsConnected = isGoogleSheetsConnected();

  const navItems = [
    { id: 'bracket', label: 'ตาราง & ผังสายแข่ง', icon: Calendar },
    { id: 'register', label: 'ลงทะเบียนทีม', icon: UserPlus },
    { id: 'referees', label: 'ลงทะเบียนผู้ตัดสิน', icon: Scale, badge: `${referees.length} ท่าน` },
    { id: 'standings', label: 'สรุปเหรียญรางวัล', icon: Medal },
    { id: 'visualize', label: 'แผนภูมิเหรียญ (Recharts)', icon: BarChart3 },
    { id: 'certificates', label: 'เกียรติบัตรออนไลน์', icon: Award },
    { id: 'news', label: 'ประกาศ & ข่าวสาร', icon: Newspaper, badge: unreadCount ? `${unreadCount}` : null },
    { id: 'admin', label: 'แผงควบคุม (Admin)', icon: ShieldAlert, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      {/* Top Banner / District Header with Custom Sports Background */}
      <div className="relative overflow-hidden bg-slate-950 px-3 sm:px-4 py-2.5 sm:py-3.5 border-b border-slate-800 text-white shadow-md">
        {/* Background Sports Image from User */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src="/header_sports_bg.jpg"
            alt="Sports Header Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-right sm:object-center"
          />
          {/* Subtle gradient overlay to guarantee excellent legibility while retaining the sports motif */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-slate-950/30" />
        </div>

        {/* Decorative Sports Wordmark on Right (Matching 1.jpg motif) */}
        <div className="hidden lg:flex absolute right-40 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-25">
          <span className="text-4xl font-black italic tracking-wider text-white font-sans">
            SPORTS
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/logo.png"
              alt="โลโก้ครูอำเภอคลองหาด"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg border-2 border-white/90 shrink-0 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5 sm:gap-2 drop-shadow-sm">
                  <span>KLONGHAT GAMES 2026</span>
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-100 border border-emerald-400/50 font-bold shadow-sm backdrop-blur-xs">
                    สระแก้ว
                  </span>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 font-medium line-clamp-1 drop-shadow-xs">
                การแข่งขันกีฬานักเรียนอำเภอคลองหาด สพป.สระแก้ว เขต 1
              </p>
            </div>
          </div>

          {/* Quick Actions & Admin Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
            {/* Google Sheets Sync Quick Button */}
            <button
              onClick={() => setShowSheetsModal(true)}
              title={sheetsConnected ? 'Google Sheets เชื่อมต่อแล้ว (คลิกเพื่อดูสเปรดชีตหรืออัปเดต)' : 'บันทึกและซิงค์ฐานข้อมูลไปยัง Google Sheets'}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer backdrop-blur-xs ${
                sheetsConnected
                  ? 'bg-emerald-600/90 text-white border-emerald-300 ring-2 ring-emerald-300/40'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">Google Sheets</span>
              {sheetsConnected && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" title="เชื่อมต่อแล้ว" />
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) soundEffects.playWhistle();
              }}
              title={soundEnabled ? 'เปิดเสียงนกหวีด/การแจ้งเตือน' : 'ปิดเสียง'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all hover:scale-105 cursor-pointer backdrop-blur-xs ${
                soundEnabled
                  ? 'bg-white/20 text-white border-white/40 shadow-sm'
                  : 'bg-black/30 text-slate-300 border-white/20 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-1.5 sm:p-2 rounded-xl bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all hover:scale-105 relative cursor-pointer backdrop-blur-xs"
                title="การแจ้งเตือน"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md shadow-rose-500/50">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 text-slate-900 ring-1 ring-slate-900/5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-900">การแจ้งเตือนล่าสุด</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {unreadCount} ใหม่
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">ยังไม่มีการแจ้งเตือน</p>
                    ) : (
                      notifications.slice(0, 8).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`pt-2.5 first:pt-0 cursor-pointer group transition-all ${
                            !notif.read ? 'opacity-100 bg-emerald-50/50 p-2 rounded-xl' : 'opacity-70 hover:opacity-100 p-2'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                              {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />}
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifMenu(false);
                        setActiveTab('news');
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      ดูข่าวสารและประวัติแจ้งเตือนทั้งหมด →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Google Authentication & Account Pill */}
            {currentUser && isGoogleUser ? (
              <button
                onClick={() => setShowAuthModal(true)}
                title={`เข้าสู่ระบบด้วยบัญชี Google: ${currentUser.email} (คลิกเพื่อดูรายละเอียดหรือออกจากระบบ)`}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/40 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-4 h-4 rounded-full border border-white/60"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-emerald-700 text-[9px] font-black flex items-center justify-center text-white">
                    {(currentUser.email?.[0] || 'G').toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline max-w-[110px] truncate text-emerald-100">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black">
                  แก้ไขได้
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                title="ลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อแก้ไขและเพิ่มเติมข้อมูล"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">เข้าสู่ระบบ Google</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Admin Switcher Mode */}
            <button
              onClick={() => {
                if (!isAdmin) {
                  // If turning on admin mode, check for Google auth
                  if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อเปิดใช้งานโหมดผู้ดูแลระบบและแก้ไขข้อมูล')) {
                    return;
                  }
                  setIsAdmin(true);
                  setActiveTab('admin');
                } else {
                  setIsAdmin(false);
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all hover:scale-105 cursor-pointer ${
                isAdmin
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-950/20'
                  : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">โหมด Admin</span>
                  <span className="sm:hidden">Admin</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-emerald-200" />
                  <span className="hidden sm:inline">โหมดผู้ชม</span>
                  <span className="sm:hidden">ผู้ชม</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-1.5 py-2 sm:py-2.5 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all relative cursor-pointer select-none ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-md shadow-amber-500/20'
                      : 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white font-black shadow-md shadow-emerald-600/25'
                    : item.highlight
                    ? 'text-amber-700 hover:bg-amber-50 border border-amber-200 font-bold'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/70 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Google Sheets Multi-Database Sync Modal */}
      <GoogleSheetsSyncModal isOpen={showSheetsModal} onClose={() => setShowSheetsModal(false)} />
    </header>
  );
};
