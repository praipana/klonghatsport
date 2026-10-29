import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Announcement, AppNotification } from '../types';
import {
  Newspaper,
  Bell,
  Send,
  Pin,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Activity,
  Megaphone,
} from 'lucide-react';

export const NewsNotificationTab: React.FC = () => {
  const {
    announcements,
    notifications,
    addAnnouncement,
    deleteAnnouncement,
    sendNotification,
    markNotificationRead,
    markAllNotificationsRead,
    isAdmin,
  } = useTournament();

  const [activeSubTab, setActiveSubTab] = useState<'news' | 'notifications'>('news');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('general');
  const [newAuthor, setNewAuthor] = useState('ฝ่ายประชาสัมพันธ์ คลองหาดเกมส์');
  const [isPinned, setIsPinned] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    addAnnouncement({
      title: newTitle,
      content: newContent,
      category: newCategory,
      author: newAuthor,
      pinned: isPinned,
    });

    setNewTitle('');
    setNewContent('');
    setShowPostForm(false);
  };

  const getCategoryBadge = (cat: Announcement['category']) => {
    switch (cat) {
      case 'urgent':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">🚨 ประกาศด่วน</span>;
      case 'result':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">🏆 สรุปผลแข่ง</span>;
      case 'schedule':
        return <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold">📅 กำหนดการ</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">📢 ข่าวทั่วไป</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              ศูนย์ข่าวสาร & ระบบแจ้งเตือนผลการแข่งขัน (News & Alert Broadcast)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            ประกาศทางการจากคณะกรรมการจัดการแข่งขัน และประวัติการแจ้งเตือนผลการแข่งขัน
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>+ ออกประกาศข่าวสารใหม่</span>
          </button>
        )}
      </div>

      {/* Admin Post Announcement Form */}
      {showPostForm && (
        <form onSubmit={handlePostAnnouncement} className="bg-white border border-emerald-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <span>สร้างประกาศข่าวสาร / ผลการแข่งขันใหม่</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">หัวข้อข่าว / ประกาศ</label>
              <input
                type="text"
                placeholder="เช่น ผลการแข่งขันฟุตบอลรอบรองชนะเลิศ..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">หมวดหมู่</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="general">📢 ข่าวทั่วไป</option>
                <option value="urgent">🚨 ประกาศด่วน</option>
                <option value="result">🏆 สรุปผลการแข่งขัน</option>
                <option value="schedule">📅 แจ้งปรับตารางเวลา</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">เนื้อหาประกาศ</label>
            <textarea
              rows={4}
              placeholder="พิมพ์รายละเอียดประกาศข่าวสาร..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-4 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>ปักหมุดไว้บนสุด (Pin to top)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">ผู้ประกาศ:</span>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPostForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                เผยแพร่ประกาศทันที
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab('news')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'news'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>บอร์ดประกาศทางการ ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>ประวัติแจ้งเตือนในระบบ ({notifications.length})</span>
        </button>
      </div>

      {/* Feed Area */}
      {activeSubTab === 'news' ? (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className={`bg-white border rounded-3xl p-5 sm:p-7 shadow-sm transition-all ${
                ann.pinned
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {ann.pinned && (
                    <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700" title="ปักหมุด">
                      <Pin className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {getCategoryBadge(ann.category)}
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {ann.timestamp}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="ลบประกาศนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>ประกาศโดย: <strong className="text-slate-800 font-semibold">{ann.author}</strong></span>
                <span className="text-emerald-700 font-semibold">กองอำนวยการคลองหาดเกมส์</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Notifications Log View */
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>ประวัติการแจ้งเตือน Real-Time ทั้งหมด</span>
            </h3>
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-emerald-700 hover:text-emerald-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  !notif.read
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-700 mt-0.5 shrink-0 text-base shadow-xs">
                  {notif.type === 'score_update' ? '⚽' : notif.type === 'award' ? '🏆' : '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 shrink-0 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
