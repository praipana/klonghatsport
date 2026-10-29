import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SportType, CategoryLevel, Athlete, SPORT_LABELS, CATEGORY_LABELS, Team } from '../types';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { GoogleAuthBanner } from './GoogleAuthBanner';
import {
  UserPlus,
  Users,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  School,
  Search,
  Printer,
  X,
  FileText,
  Pencil,
  Save,
  Clock,
  AlertCircle,
  Tag,
  FileSpreadsheet,
} from 'lucide-react';

const SPORT_POSITION_PRESETS: Record<SportType, string[]> = {
  football: ['กัปตันทีม', 'ผู้รักษาประตู', 'กองหลัง', 'กองกลาง', 'กองหน้า', 'ตัวสำรอง'],
  volleyball: ['กัปตันทีม', 'ตัวเซ็ต', 'หัวเสา', 'บอลเร็ว/บล็อกกลาง', 'บีหลัง', 'ลิเบอโร่', 'ตัวสำรอง'],
  takraw: ['กัปตันทีม', 'ตัวเสิร์ฟ (หลัง)', 'ตัวชง (หน้าซ้าย)', 'ตัวฟาด (หน้าขวา)', 'ตัวสำรอง'],
  petanque: ['กัปตันทีม', 'มือวาง (Pointer)', 'มือยิง (Shooter)', 'มือกลาง (Middle)', 'ตัวสำรอง'],
  tug_of_war: ['หัวหน้าทีม (กัปตัน)', 'คนหน้าสุด (Front Puller)', 'ตัวดึงหลัก (Puller)', 'คนคุมจังหวะ/ตะโกน (Caller)', 'คนท้ายสุด (Anchor)', 'ตัวสำรอง'],
  running_50m: ['นักวิ่งตัวจริง (ช่องวิ่ง)', 'นักวิ่งสำรอง'],
  running_80m: ['นักวิ่งตัวจริง (ช่องวิ่ง)', 'นักวิ่งสำรอง'],
  running_100m: ['นักวิ่งตัวจริง (ช่องวิ่ง)', 'นักวิ่งสำรอง'],
};

const COLOR_PRESETS = [
  { name: 'เขียวมรกต', value: '#059669' },
  { name: 'น้ำเงินฟ้า', value: '#0284c7' },
  { name: 'น้ำเงินเข้ม', value: '#2563eb' },
  { name: 'แดงชาด', value: '#dc2626' },
  { name: 'ส้มอำพัน', value: '#d97706' },
  { name: 'ม่วงเข้ม', value: '#7c3aed' },
  { name: 'ชมพูเข้ม', value: '#db2777' },
  { name: 'เขียวหัวเป็ด', value: '#0d9488' },
];

export const RegistrationTab: React.FC = () => {
  const { teams, schools, registerTeam, updateTeam, updateTeamStatus, deleteTeam, isAdmin, isGoogleSheetsConnected } = useTournament();

  const [showForm, setShowForm] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportType>('football');
  const [selectedCategory, setSelectedCategory] = useState<CategoryLevel>('primary_upper_male');
  const [schoolName, setSchoolName] = useState<string>(schools[0]?.name || '');
  const [teamName, setTeamName] = useState<string>('');
  const [coachName, setCoachName] = useState<string>('');
  const [coachPhone, setCoachPhone] = useState<string>('');
  const [teamColor, setTeamColor] = useState<string>('#059669');

  // Athletes list in registration form
  const [roster, setRoster] = useState<Athlete[]>([
    { id: '1', name: '', studentId: '', grade: 'ป.5/1', jerseyNumber: 10, position: 'กัปตันทีม', age: 11 },
    { id: '2', name: '', studentId: '', grade: 'ป.5/2', jerseyNumber: 7, position: 'ผู้เล่น', age: 11 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState<SportType | 'all'>('all');
  const [activeTeamCard, setActiveTeamCard] = useState<Team | null>(null);

  // Editing Team State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState<{
    sport: SportType;
    category: CategoryLevel;
    schoolName: string;
    name: string;
    coachName: string;
    coachPhone: string;
    teamColor: string;
    status: 'pending' | 'approved' | 'rejected';
    roster: Athlete[];
  } | null>(null);

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditForm({
      sport: team.sport,
      category: team.category,
      schoolName: team.schoolName,
      name: team.name,
      coachName: team.coachName,
      coachPhone: team.coachPhone,
      teamColor: team.teamColor || '#059669',
      status: team.status || 'approved',
      roster: team.roster.map(a => ({ ...a })),
    });
  };

  const closeEditModal = () => {
    setEditingTeam(null);
    setEditForm(null);
  };

  const addEditAthleteRow = () => {
    if (!editForm) return;
    const newAthlete: Athlete = {
      id: `ath_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      studentId: `KH-${Math.floor(100 + Math.random() * 900)}`,
      grade: 'ป.5/1',
      jerseyNumber: editForm.roster.length + 1,
      position: 'ผู้เล่น',
      age: 11,
    };
    setEditForm(prev => (prev ? { ...prev, roster: [...prev.roster, newAthlete] } : null));
  };

  const removeEditAthleteRow = (athleteId: string) => {
    if (!editForm || editForm.roster.length <= 1) return;
    setEditForm(prev =>
      prev ? { ...prev, roster: prev.roster.filter(a => a.id !== athleteId) } : null
    );
  };

  const updateEditAthleteField = (athleteId: string, field: keyof Athlete, value: any) => {
    if (!editForm) return;
    setEditForm(prev =>
      prev
        ? {
            ...prev,
            roster: prev.roster.map(a => (a.id === athleteId ? { ...a, [field]: value } : a)),
          }
        : null
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editForm) return;

    if (!editForm.name.trim() || !editForm.schoolName.trim() || !editForm.coachName.trim()) {
      alert('กรุณากรอกชื่อทีม โรงเรียน และชื่อผู้ฝึกสอนให้ครบถ้วน');
      return;
    }

    const validRoster = editForm.roster.filter(a => a.name.trim() !== '');
    if (validRoster.length === 0) {
      alert('กรุณากรอกรายชื่อนักกีฬาอย่างน้อย 1 คน');
      return;
    }

    const matchingSchool = schools.find(s => s.name === editForm.schoolName);

    const updatedData: Partial<Team> = {
      name: editForm.name.trim(),
      schoolName: editForm.schoolName.trim(),
      schoolId: matchingSchool ? matchingSchool.id : editingTeam.schoolId,
      sport: editForm.sport,
      category: editForm.category,
      coachName: editForm.coachName.trim(),
      coachPhone: editForm.coachPhone.trim() || '08X-XXX-XXXX',
      teamColor: editForm.teamColor,
      status: editForm.status,
      roster: validRoster,
    };

    updateTeam(editingTeam.id, updatedData);

    // Sync active view modal if open
    if (activeTeamCard && activeTeamCard.id === editingTeam.id) {
      setActiveTeamCard({
        ...activeTeamCard,
        ...updatedData,
      } as Team);
    }

    closeEditModal();
  };

  const addAthleteRow = () => {
    setRoster(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        studentId: `KH-${Math.floor(100 + Math.random() * 900)}`,
        grade: 'ป.5/1',
        jerseyNumber: prev.length + 1,
        position: 'ผู้เล่น',
        age: 11,
      },
    ]);
  };

  const removeAthleteRow = (id: string) => {
    if (roster.length <= 1) return;
    setRoster(prev => prev.filter(a => a.id !== id));
  };

  const updateAthleteField = (id: string, field: keyof Athlete, value: any) => {
    setRoster(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !schoolName || !coachName) {
      alert('กรุณากรอกชื่อทีม โรงเรียน และชื่อผู้ฝึกสอนให้ครบถ้วน');
      return;
    }

    const validRoster = roster.filter(a => a.name.trim() !== '');
    if (validRoster.length === 0) {
      alert('กรุณากรอกรายชื่อนักกีฬาอย่างน้อย 1 คน');
      return;
    }

    const matchingSchool = schools.find(s => s.name === schoolName);

    registerTeam({
      name: teamName,
      schoolName,
      schoolId: matchingSchool ? matchingSchool.id : `sch_${Date.now()}`,
      sport: selectedSport,
      category: selectedCategory,
      coachName,
      coachPhone: coachPhone || '08X-XXX-XXXX',
      teamColor,
      roster: validRoster,
    });

    // Reset Form
    setTeamName('');
    setCoachName('');
    setCoachPhone('');
    setRoster([
      { id: '1', name: '', studentId: '', grade: 'ป.5/1', jerseyNumber: 10, position: 'กัปตันทีม', age: 11 },
      { id: '2', name: '', studentId: '', grade: 'ป.5/2', jerseyNumber: 7, position: 'ผู้เล่น', age: 11 },
    ]);
    setShowForm(false);
  };

  const filteredTeams = teams.filter(t => {
    if (filterSport !== 'all' && t.sport !== filterSport) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.schoolName.toLowerCase().includes(q) ||
        t.coachName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ระบบลงทะเบียนทีมและนักกีฬา (Team & Athlete Registration)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            ลงทะเบียนทีมเข้าร่วมการแข่งขันกีฬา 4 ชนิด พร้อมจัดการรายชื่อผู้เล่น เบอร์เสื้อ และบัตรประจำตัวนักกีฬา
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setShowSheetsModal(true)}
            title="เชื่อมต่อและซิงค์ข้อมูลทีม/นักกีฬาและทุกระบบไปยัง Google Sheets"
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ซิงค์ Google Sheets</span>
            {isGoogleSheetsConnected() && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'ปิดแบบฟอร์ม' : '+ ลงทะเบียนทีมใหม่'}</span>
          </button>
        </div>
      </div>

      {/* Google Authentication & Permissions Banner */}
      <GoogleAuthBanner contextName="ระบบลงทะเบียนทีมและจัดการข้อมูลนักกีฬา" />

      {/* Registration Form Accordion */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-emerald-300 rounded-3xl p-5 sm:p-7 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>แบบฟอร์มลงทะเบียนทีมเข้าร่วมการแข่งขัน</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold">* กรุณากรอกข้อมูลตามความเป็นจริง</span>
          </div>

          {/* Sport & Category Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">ชนิดกีฬาที่สมัคร</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(SPORT_LABELS) as SportType[]).map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSelectedSport(s)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedSport === s
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xl">{SPORT_LABELS[s].icon}</span>
                    <span>{SPORT_LABELS[s].nameTh}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">รุ่นอายุ / ระดับชั้น</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as CategoryLevel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
              >
                {(Object.keys(CATEGORY_LABELS) as CategoryLevel[]).map(c => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c].nameTh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School & Team Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">โรงเรียนต้นสังกัด</label>
              <select
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm"
              >
                {schools.map(sch => (
                  <option key={sch.id} value={sch.name}>
                    {sch.name} ({sch.principalRole || 'ผู้อำนวยการ'}: {sch.principalName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">ชื่อทีม (Team Name)</label>
              <input
                type="text"
                placeholder="เช่น คลองหาด ยูไนเต็ด"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">สีชุดแข่งขันประจำทีม</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={teamColor}
                  onChange={e => setTeamColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-mono font-bold">{teamColor}</span>
              </div>
            </div>
          </div>

          {/* Coach Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">ชื่อ-นามสกุล ผู้ฝึกสอน/ผู้ควบคุมทีม</label>
              <input
                type="text"
                placeholder="เช่น นายสมชาย สุขใจ"
                value={coachName}
                onChange={e => setCoachName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">เบอร์โทรศัพท์ติดต่อผู้ฝึกสอน</label>
              <input
                type="tel"
                placeholder="เช่น 081-234-5678"
                value={coachPhone}
                onChange={e => setCoachPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                required
              />
            </div>
          </div>

          {/* Athletes Roster Table Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold text-slate-900">รายชื่อนักกีฬาในทีม ({roster.length} คน)</label>
                <p className="text-[11px] text-slate-500">กรอกชื่อ-นามสกุล ชั้นเรียน เบอร์เสื้อ และตำแหน่ง</p>
              </div>
              <button
                type="button"
                onClick={addAthleteRow}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มนักกีฬา
              </button>
            </div>

            {/* Position presets badges for chosen sport */}
            <div className="mb-2.5 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                ตำแหน่งแนะนำ ({SPORT_LABELS[selectedSport].nameTh}):
              </span>
              {SPORT_POSITION_PRESETS[selectedSport].map(pos => (
                <span
                  key={pos}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
                >
                  {pos}
                </span>
              ))}
            </div>

            <datalist id="reg-positions-list">
              {SPORT_POSITION_PRESETS[selectedSport].map(pos => (
                <option key={pos} value={pos} />
              ))}
            </datalist>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {roster.map((ath, index) => (
                <div
                  key={ath.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs shadow-sm"
                >
                  <div className="col-span-1 text-center font-bold text-slate-500">
                    #{index + 1}
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล นักเรียน *"
                      value={ath.name}
                      onChange={e => updateAthleteField(ath.id, 'name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="ชั้น เช่น ป.5/1"
                      value={ath.grade}
                      onChange={e => updateAthleteField(ath.id, 'grade', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="เบอร์เสื้อ"
                      value={ath.jerseyNumber || ''}
                      onChange={e => updateAthleteField(ath.id, 'jerseyNumber', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="ตำแหน่ง"
                      list="reg-positions-list"
                      value={ath.position || ''}
                      onChange={e => updateAthleteField(ath.id, 'position', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeAthleteRow(ath.id)}
                      disabled={roster.length <= 1}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              ยืนยันการลงทะเบียนทีม
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterSport('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterSport === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            ทุกกีฬา ({teams.length})
          </button>
          {(Object.keys(SPORT_LABELS) as SportType[]).map(s => {
            const count = teams.filter(t => t.sport === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterSport(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  filterSport === s
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <span>{SPORT_LABELS[s].icon}</span>
                <span>{SPORT_LABELS[s].nameTh}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  filterSport === s ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อทีม หรือโรงเรียน..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map(team => {
          const sport = SPORT_LABELS[team.sport];
          const cat = CATEGORY_LABELS[team.category];

          return (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badge Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span>{sport.icon}</span>
                    <span>{sport.nameTh}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        team.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : team.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {team.status === 'approved' ? '✓ อนุมัติแล้ว' : team.status === 'pending' ? '⏳ รอตรวจ' : '✕ ไม่อนุมัติ'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cat.badgeColor}`}>
                      {cat.shortTh}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0"
                    style={{ backgroundColor: team.teamColor || '#059669' }}
                  >
                    <Shield className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">{team.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      {team.schoolName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ผู้ฝึกสอน:</span>
                    <span className="text-slate-800 font-semibold">{team.coachName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">เบอร์โทร:</span>
                    <span className="text-slate-700 font-mono">{team.coachPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">จำนวนนักกีฬา:</span>
                    <span className="text-emerald-700 font-bold">{team.roster.length} คน</span>
                  </div>
                </div>
              </div>

              {/* Actions Bottom */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveTeamCard(team)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    title="ดูใบรายชื่อและพิมพ์บัตรประจำตัวทีม"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>ใบรายชื่อ</span>
                  </button>

                  <button
                    onClick={() => openEditModal(team)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 shadow-xs"
                    title="แก้ไขข้อมูลทีม ชนิดกีฬา รุ่นอายุ และรายชื่อนักกีฬา"
                  >
                    <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                    <span>แก้ไขข้อมูล</span>
                  </button>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบทีม "${team.name}" ออกจากการแข่งขันใช่หรือไม่?`)) {
                        deleteTeam(team.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบทีมนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Roster / Print Card Modal */}
      {activeTeamCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl p-5 sm:p-7 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: activeTeamCard.teamColor }}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeTeamCard.name}</h3>
                  <p className="text-xs text-slate-500">{activeTeamCard.schoolName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTeamCard(null)}
                className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Info Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs shadow-sm">
              <div>
                <span className="text-slate-500 block">กีฬา:</span>
                <span className="font-bold text-emerald-700">{SPORT_LABELS[activeTeamCard.sport].nameTh}</span>
              </div>
              <div>
                <span className="text-slate-500 block">รุ่นอายุ:</span>
                <span className="font-bold text-slate-800">{CATEGORY_LABELS[activeTeamCard.category].shortTh}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ผู้ฝึกสอน:</span>
                <span className="font-bold text-slate-800">{activeTeamCard.coachName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">โทรศัพท์:</span>
                <span className="font-bold text-slate-800">{activeTeamCard.coachPhone}</span>
              </div>
            </div>

            {/* Athlete Roster Table */}
            <h4 className="text-xs font-bold text-slate-800 mb-2">บัญชีรายชื่อนักกีฬาทางการ</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 sm:p-3">เบอร์</th>
                    <th className="p-2.5 sm:p-3">ชื่อ-นามสกุล</th>
                    <th className="p-2.5 sm:p-3">รหัสนักเรียน</th>
                    <th className="p-2.5 sm:p-3">ชั้น</th>
                    <th className="p-2.5 sm:p-3">ตำแหน่ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTeamCard.roster.map(ath => (
                    <tr key={ath.id} className="text-slate-800 hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 sm:p-3 font-bold font-mono text-emerald-700">#{ath.jerseyNumber || '-'}</td>
                      <td className="p-2.5 sm:p-3 font-medium">{ath.name}</td>
                      <td className="p-2.5 sm:p-3 text-slate-500 font-mono">{ath.studentId || '-'}</td>
                      <td className="p-2.5 sm:p-3">{ath.grade}</td>
                      <td className="p-2.5 sm:p-3 text-slate-600">{ath.position || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 flex-wrap gap-2">
              <span className="text-[11px] text-slate-500">ลงทะเบียนเมื่อ: {activeTeamCard.registeredAt}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(activeTeamCard)}
                  className="px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 shadow-xs cursor-pointer transition-all"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                  แก้ไขข้อมูลทีมนี้
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์เอกสารทีม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TEAM MODAL */}
      {editingTeam && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl p-5 sm:p-7 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                  style={{ backgroundColor: editForm.teamColor }}
                >
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>แก้ไขข้อมูลการลงทะเบียนทีม</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {SPORT_LABELS[editForm.sport].nameTh}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ปรับปรุงรายละเอียดทีม ชนิดกีฬา รุ่นอายุ ผู้ฝึกสอน และรายชื่อนักกีฬา
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
              {/* Sport Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  ชนิดกีฬา (เลือกเพื่อเปลี่ยนประเภทกีฬา)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(SPORT_LABELS) as SportType[]).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setEditForm(prev => (prev ? { ...prev, sport: s } : null))}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        editForm.sport === s
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm font-black ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span className="text-xl">{SPORT_LABELS[s].icon}</span>
                      <span>{SPORT_LABELS[s].nameTh}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">รุ่นอายุ / ระดับชั้น</label>
                  <select
                    value={editForm.category}
                    onChange={e =>
                      setEditForm(prev =>
                        prev ? { ...prev, category: e.target.value as CategoryLevel } : null
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                  >
                    {(Object.keys(CATEGORY_LABELS) as CategoryLevel[]).map(c => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c].nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">สถานะการรับรองทีม</label>
                  <select
                    value={editForm.status}
                    onChange={e =>
                      setEditForm(prev =>
                        prev ? { ...prev, status: e.target.value as 'pending' | 'approved' | 'rejected' } : null
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm font-bold"
                  >
                    <option value="approved">✓ อนุมัติแล้ว (Approved)</option>
                    <option value="pending">⏳ รอตรวจสอบเอกสาร (Pending)</option>
                    <option value="rejected">✕ ไม่อนุมัติ / ส่งกลับแก้ไข (Rejected)</option>
                  </select>
                </div>
              </div>

              {/* School, Team Name, and Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">โรงเรียนต้นสังกัด</label>
                  <select
                    value={editForm.schoolName}
                    onChange={e =>
                      setEditForm(prev => (prev ? { ...prev, schoolName: e.target.value } : null))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm"
                  >
                    {schools.map(sch => (
                      <option key={sch.id} value={sch.name}>
                        {sch.name} ({sch.principalRole || 'ผู้อำนวยการ'}: {sch.principalName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">ชื่อทีม (Team Name)</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => (prev ? { ...prev, name: e.target.value } : null))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">สีชุดแข่งขัน</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editForm.teamColor}
                      onChange={e =>
                        setEditForm(prev => (prev ? { ...prev, teamColor: e.target.value } : null))
                      }
                      className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {COLOR_PRESETS.slice(0, 5).map(cp => (
                        <button
                          type="button"
                          key={cp.value}
                          onClick={() =>
                            setEditForm(prev => (prev ? { ...prev, teamColor: cp.value } : null))
                          }
                          className="w-5 h-5 rounded-full border border-slate-200 cursor-pointer transition-transform hover:scale-125"
                          style={{ backgroundColor: cp.value }}
                          title={cp.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">ชื่อผู้ฝึกสอน/ผู้ควบคุมทีม</label>
                  <input
                    type="text"
                    value={editForm.coachName}
                    onChange={e =>
                      setEditForm(prev => (prev ? { ...prev, coachName: e.target.value } : null))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    value={editForm.coachPhone}
                    onChange={e =>
                      setEditForm(prev => (prev ? { ...prev, coachPhone: e.target.value } : null))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Roster Athletes Editor */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>รายชื่อนักกีฬาในทีม ({editForm.roster.length} คน)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      แก้ไขชื่อ เบอร์เสื้อ ชั้นเรียน และตำแหน่ง หรือกดเพิ่มนักกีฬาคนใหม่
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addEditAthleteRow}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มนักกีฬา
                  </button>
                </div>

                {/* Quick Position Suggestion Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px]">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    ตำแหน่งแนะนำ ({SPORT_LABELS[editForm.sport].nameTh}):
                  </span>
                  {SPORT_POSITION_PRESETS[editForm.sport].map(pos => (
                    <span
                      key={pos}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
                    >
                      {pos}
                    </span>
                  ))}
                </div>

                {/* Datalist for position suggestions */}
                <datalist id="edit-positions-list">
                  {SPORT_POSITION_PRESETS[editForm.sport].map(pos => (
                    <option key={pos} value={pos} />
                  ))}
                </datalist>

                {/* Athletes Rows */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {editForm.roster.map((ath, index) => (
                    <div
                      key={ath.id}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs shadow-xs"
                    >
                      <div className="col-span-1 text-center font-bold text-slate-500 text-[11px]">
                        #{index + 1}
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="ชื่อ-นามสกุล นักเรียน *"
                          value={ath.name}
                          onChange={e => updateEditAthleteField(ath.id, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="รหัสนักเรียน"
                          value={ath.studentId || ''}
                          onChange={e => updateEditAthleteField(ath.id, 'studentId', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="ชั้น (ป.5/1)"
                          value={ath.grade}
                          onChange={e => updateEditAthleteField(ath.id, 'grade', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="เบอร์"
                          value={ath.jerseyNumber || ''}
                          onChange={e =>
                            updateEditAthleteField(ath.id, 'jerseyNumber', Number(e.target.value))
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-1.5 py-1.5 text-xs text-center text-slate-900 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          list="edit-positions-list"
                          placeholder="ตำแหน่ง"
                          value={ath.position || ''}
                          onChange={e => updateEditAthleteField(ath.id, 'position', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-1.5 py-1.5 text-[11px] text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeEditAthleteRow(ath.id)}
                          disabled={editForm.roster.length <= 1}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-20 cursor-pointer"
                          title="ลบนักกีฬาคนนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
                <span className="text-[11px] text-slate-500">
                  * การแก้ไขจะอัปเดตสายการแข่งขันและผลสกอร์ของทีมนี้โดยอัตโนมัติ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    บันทึกการแก้ไขข้อมูลทีม
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
      />
    </div>
  );
};
