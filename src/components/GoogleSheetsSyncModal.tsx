import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { GoogleWorkspaceService, GoogleSheetsSyncResult } from '../services/googleSheetsService';
import {
  FileSpreadsheet,
  CloudCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Sparkles,
  Award,
  Users,
  Calendar,
  Activity,
  LogOut,
  HardDrive,
} from 'lucide-react';

export const GoogleSheetsSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    schools,
    teams,
    matches,
    referees,
    announcements,
    certificates,
    autoSyncToSheets,
    setAutoSyncToSheets,
    signInWithGoogle,
    currentUser,
  } = useTournament();

  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<GoogleSheetsSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(GoogleWorkspaceService.hasToken());
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showManualToken, setShowManualToken] = useState(false);

  useEffect(() => {
    setHasToken(GoogleWorkspaceService.hasToken());
    const saved = GoogleWorkspaceService.getSavedSheetInfo();
    if (saved.spreadsheetId && saved.spreadsheetUrl) {
      setSyncResult({
        spreadsheetId: saved.spreadsheetId,
        spreadsheetUrl: saved.spreadsheetUrl,
        sheetsCreated: [
          '📊 ตารางเหรียญและสถิติ',
          '⚽ รายชื่อทีมและนักกีฬา',
          '⏱️ สรุปคู่แข่งขันและผลการแข่งขัน',
          '🏆 ทะเบียนเกียรติบัตรออนไลน์',
          '👨‍⚖️ คณะกรรมการและผู้ตัดสิน',
          '📢 ข่าวและประกาศทางการ',
        ],
        lastSyncedAt: 'บันทึกพร้อมใช้งานในระบบ',
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. If no in-memory Workspace token, initiate Google OAuth popup
      if (!GoogleWorkspaceService.getToken()) {
        try {
          await signInWithGoogle();
        } catch (e: any) {
          setShowManualToken(true);
          throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่ออนุญาตสิทธิ์เข้าถึง Google Sheets & Google Drive');
        }
      }

      // 2. Perform Full Data Sync across all modules
      const result = await GoogleWorkspaceService.syncTournamentToGoogleSheets({
        schools,
        teams,
        matches,
        referees,
        announcements,
        certificates,
      });

      setSyncResult(result);
      setHasToken(true);
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets & Drive API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveManualToken = () => {
    if (manualTokenInput.trim()) {
      GoogleWorkspaceService.setToken(manualTokenInput.trim());
      setHasToken(true);
      setShowManualToken(false);
      handleSync();
    }
  };

  const handleDisconnect = () => {
    GoogleWorkspaceService.clearAuth();
    setHasToken(false);
    setSyncResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30">
                  Google Workspace
                </span>
                <span className="text-xs text-emerald-100 font-semibold">Google Sheets & Drive API</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white mt-1">
                บันทึกฐานข้อมูลทุกระบบย่อยลง Google Sheets
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Overview modules being synced */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>ระบบย่อยที่จะถูกสร้างและบันทึกลงใน Google Spreadsheet (7 แผ่นงาน):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 shadow-sm">
                <Award className="w-4 h-4 text-amber-500" />
                <span>ตารางเหรียญ ({schools.length} รร.)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 shadow-sm">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>ทีม/นักกีฬา ({teams.length} ทีม)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 shadow-sm">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>คู่แข่งขัน ({matches.length} คู่)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 shadow-sm">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>ไทม์ไลน์สด (Live)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>เกียรติบัตร ({certificates.length} ใบ)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 shadow-sm">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>กรรมการ & ข่าวสาร</span>
              </div>
            </div>
          </div>

          {/* Auto-Sync Toggle Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${autoSyncToSheets && hasToken ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-slate-800">
                  ซิงค์อัตโนมัติเมื่อมีการเพิ่ม/แก้ไขข้อมูล (Auto-Sync on Changes)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                เมื่อเปิดใช้งาน การลงทะเบียนทีมใหม่ แก้ไขข้อมูลทีม อัปเดตผลการแข่งขัน หรือออกเกียรติบัตร จะถูกส่งไปอัปเดตบน Google Sheets ให้อัตโนมัติทันที
              </p>
            </div>

            <button
              onClick={() => setAutoSyncToSheets(!autoSyncToSheets)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                autoSyncToSheets
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {autoSyncToSheets ? 'เปิดทำงานอยู่' : 'ปิดอยู่'}
            </button>
          </div>

          {/* Sync Success Result Box */}
          {syncResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>บันทึกและซิงค์ข้อมูลสำเร็จเรียบร้อย!</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {syncResult.lastSyncedAt}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                ระบบได้สร้าง Google Sheet ออนไลน์พร้อม 7 แผ่นงาน (Sheets) ครอบคลุมทุกระบบย่อยเรียบร้อยแล้ว ท่านสามารถคลิกลิงก์ด้านล่างเพื่อเปิดดูหรือดาวน์โหลดเป็น Excel / PDF ได้ทันที:
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={syncResult.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>เปิด Google Spreadsheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`https://drive.google.com/open?id=${syncResult.spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>เปิดดูใน Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {hasToken && (
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="ล้าง Token"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ยกเลิกการเชื่อมต่อ</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold block">เกิดข้อผิดพลาดในการซิงค์:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Manual Token Option if Popup Blocked */}
          {showManualToken && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">
                หรือกรอก Google OAuth Access Token ด้วยตนเอง:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="ya29.a0..."
                  value={manualTokenInput}
                  onChange={e => setManualTokenInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveManualToken}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 cursor-pointer shadow-sm"
                >
                  บันทึก & ซิงค์
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            ข้อมูลอัปเดตแบบ Direct Multi-sheet Write
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังบันทึกลง Google Sheet...' : 'กดบันทึก / อัปเดตข้อมูล'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
