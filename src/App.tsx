/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/Header';
import { ToastNotification } from './components/ToastNotification';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { MatchDetailModal } from './components/MatchDetailModal';
import { ScheduleBracketTab } from './components/ScheduleBracketTab';
import { RegistrationTab } from './components/RegistrationTab';
import { MedalStandingsTab } from './components/MedalStandingsTab';
import { CertificateGenerator } from './components/CertificateGenerator';
import { NewsNotificationTab } from './components/NewsNotificationTab';
import { AdminControlPanel } from './components/AdminControlPanel';
import { MedalVisualizationTab } from './components/MedalVisualizationTab';
import { RefereeManagementTab } from './components/RefereeManagementTab';
import {
  Trophy,
  Shield,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  School,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { soundEffects } from './utils/audio';

const TournamentAppContent: React.FC = () => {
  const { activeTab, soundEnabled, setSoundEnabled, simulateLiveEvent } = useTournament();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'live':
      case 'bracket':
      case 'brackets':
        return <ScheduleBracketTab />;
      case 'register':
        return <RegistrationTab />;
      case 'referees':
        return <RefereeManagementTab />;
      case 'standings':
        return <MedalStandingsTab />;
      case 'visualize':
        return <MedalVisualizationTab />;
      case 'certificates':
        return <CertificateGenerator />;
      case 'news':
        return <NewsNotificationTab />;
      case 'admin':
        return <AdminControlPanel />;
      default:
        return <ScheduleBracketTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-600 selection:text-white relative overflow-x-hidden">
      {/* Background ambient subtle light glow meshes with fresh green & crisp white accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-teal-100/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Toast Notifications */}
      <ToastNotification />

      {/* Google Authentication Modal */}
      <GoogleAuthModal />

      {/* App Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {renderActiveTab()}
      </main>

      {/* Persistent Floating Controls (Sound Toggle) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) soundEffects.playWhistle();
          }}
          className={`p-2 sm:p-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
            soundEnabled
              ? 'bg-white border border-emerald-400 text-emerald-600 hover:bg-emerald-50 shadow-emerald-500/20'
              : 'bg-white border border-slate-300 text-slate-400 hover:bg-slate-100'
          }`}
          title={soundEnabled ? 'ปิดเสียงแจ้งเตือนและนกหวีด' : 'เปิดเสียงแจ้งเตือนและนกหวีด'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Footer with District & Educational Service Area Credits */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200 py-6 sm:py-8 px-4 mt-8 sm:mt-12 relative shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="โลโก้ครูอำเภอคลองหาด"
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200 shrink-0 bg-white"
            />
            <div>
              <span className="font-bold text-slate-900 text-sm block tracking-wide">KLONGHAT GAMES 2026</span>
              <span className="text-slate-500 text-xs">กีฬานักเรียนอำเภอคลองหาด จังหวัดสระแก้ว</span>
            </div>
          </div>

          <div className="text-center md:text-right space-y-0.5">
            <p className="text-slate-700 font-medium">
              จัดการแข่งขันโดย <strong className="text-slate-900 font-bold">อำเภอคลองหาด</strong> ร่วมกับ{' '}
              <strong className="text-slate-900 font-bold">สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสระแก้ว เขต 1</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              ฟุตบอล • วอลเลย์บอล • เซปักตะกร้อ • เปตอง | ระดับอนุบาล, ประถมต้น และประถมปลาย
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TournamentProvider>
      <TournamentAppContent />
    </TournamentProvider>
  );
}
