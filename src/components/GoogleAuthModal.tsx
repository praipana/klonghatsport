import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  LogOut,
  AlertCircle,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';

export const GoogleAuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authPromptReason,
    currentUser,
    isGoogleUser,
    signInWithGoogle,
    signOutUser,
    authLoading,
  } = useTournament();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const success = await signInWithGoogle();
      if (success) {
        setShowAuthModal(false);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('หน้าต่างลงชื่อเข้าใช้ถูกปิดก่อนทำรายการเสร็จสิ้น');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('มีการเปิดหน้าต่างลงชื่อเข้าใช้อยู่แล้ว');
      } else {
        setErrorMsg('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden space-y-5">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-emerald-100 blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 -ml-12 -mt-12 w-40 h-40 rounded-full bg-blue-100 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-1 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center p-3">
            {/* Google G Logo SVG */}
            <svg className="w-full h-full" viewBox="0 0 24 24">
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
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {currentUser && isGoogleUser ? 'บัญชีผู้ใช้งาน Google' : 'ลงชื่อเข้าใช้ด้วย Google'}
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {authPromptReason ||
              'เฉพาะผู้ที่มีบัญชีอีเมล Google (@gmail.com หรือ Google Workspace) เท่านั้นที่มีสิทธิ์แก้ไขและเพิ่มเติมข้อมูลในระบบการแข่งขัน'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* If Already Signed In */}
        {currentUser && isGoogleUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google Profile'}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  {currentUser.displayName?.[0] || currentUser.email?.[0] || 'G'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {currentUser.displayName || 'ผู้ใช้งาน Google'}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{currentUser.email}</span>
                </p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  สิทธิ์ผู้แก้ไขข้อมูล (Editor / Admin)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                สิทธิ์การใช้งานที่ได้รับ:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>แก้ไขผลคะแนนสดและบันทึกสถิตินักกีฬา</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ลงทะเบียนทีมแข่งขันและเพิ่มรายชื่อนักกีฬา</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>เข้าถึงและบันทึกไฟล์ลง Google Drive และ Google Sheets อัตโนมัติ</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>บันทึกและซิงค์ฐานข้อมูลขึ้น Cloud Firestore แบบเรียลไทม์</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>ออกจากระบบ</span>
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>พร้อมใช้งาน</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Signed In: Show Sign-In Options */
          <div className="space-y-4">
            {/* Feature preview list */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>การจำกัดสิทธิ์ความปลอดภัย:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li>ผู้ชมทั่วไปสามารถดูผลสด สรุปเหรียญ และผังสายแข่งได้โดยไม่ต้องลงชื่อเข้าใช้</li>
                <li>
                  <strong className="text-slate-900">ต้องใช้บัญชี Google</strong> เพื่อยืนยันตัวตนก่อนบันทึกคะแนน เพิ่มทีม หรือแก้ไขข้อมูล
                </li>
              </ul>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={loading || authLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm border-2 border-slate-200 hover:border-slate-300 shadow-md flex items-center justify-center gap-3 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              )}
              <span>{loading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google (Sign in with Google)'}</span>
            </button>

            <p className="text-[10px] text-center text-slate-400">
              รองรับบัญชี @gmail.com หรือบัญชี Google Workspace ของโรงเรียน/สพป.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
