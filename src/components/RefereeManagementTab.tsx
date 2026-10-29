import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Referee,
  SportType,
  SPORT_LABELS,
  REFEREE_ROLE_CONFIG,
  Match,
} from '../types';
import {
  Scale,
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Filter,
  Search,
  Award,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  Tag,
  UserCheck,
  Plus,
  RefreshCw,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';

export const RefereeManagementTab: React.FC = () => {
  const {
    referees,
    matches,
    addReferee,
    updateReferee,
    deleteReferee,
    assignReferees,
    autoAssignRefereesBySport,
    isAdmin,
    setIsAdmin,
    isGoogleSheetsConnected,
  } = useTournament();

  // Sub-view: 'directory' (รายชื่อ & ทะเบียน) or 'assignment' (จัดใส่ตารางแข่งขัน)
  const [subView, setSubView] = useState<'directory' | 'assignment'>('directory');

  // Filters for Directory
  const [selectedSportFilter, setSelectedSportFilter] = useState<SportType | 'all'>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<Referee['role'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters for Match Assignment
  const [assignmentSportFilter, setAssignmentSportFilter] = useState<SportType | 'all'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [refereeToDelete, setRefereeToDelete] = useState<Referee | null>(null);
  const [showDutySchedulePrint, setShowDutySchedulePrint] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<Referee['role']>('head_referee');
  const [formAffiliation, setFormAffiliation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSports, setFormSports] = useState<SportType[]>(['football']);
  const [formLicenseId, setFormLicenseId] = useState('');
  const [formExperience, setFormExperience] = useState<number | ''>('');
  const [formNotes, setFormNotes] = useState('');

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setFormName('');
    setFormRole('head_referee');
    setFormAffiliation('โรงเรียนบ้านคลองหาด');
    setFormPhone('081-');
    setFormSports(selectedSportFilter !== 'all' ? [selectedSportFilter] : ['football']);
    setFormLicenseId('');
    setFormExperience('');
    setFormNotes('');
    setEditingReferee(null);
    setShowAddModal(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (ref: Referee) => {
    setEditingReferee(ref);
    setFormName(ref.name);
    setFormRole(ref.role);
    setFormAffiliation(ref.affiliation);
    setFormPhone(ref.phone);
    setFormSports([...ref.sportsSpecialty]);
    setFormLicenseId(ref.licenseId || '');
    setFormExperience(ref.experienceYears ?? '');
    setFormNotes(ref.notes || '');
    setShowAddModal(true);
  };

  // Toggle sport in form
  const handleToggleFormSport = (sp: SportType) => {
    if (formSports.includes(sp)) {
      if (formSports.length === 1) return; // Keep at least one
      setFormSports(formSports.filter(s => s !== sp));
    } else {
      setFormSports([...formSports, sp]);
    }
  };

  // Select all sports
  const handleSelectAllSports = () => {
    setFormSports(Object.keys(SPORT_LABELS) as SportType[]);
  };

  // Form submit (Add or Edit)
  const handleSaveReferee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAffiliation.trim()) {
      alert('กรุณากรอกชื่อและสังกัดหน่วยงานให้ครบถ้วน');
      return;
    }

    if (editingReferee) {
      updateReferee({
        ...editingReferee,
        name: formName.trim(),
        role: formRole,
        affiliation: formAffiliation.trim(),
        phone: formPhone.trim(),
        sportsSpecialty: formSports,
        licenseId: formLicenseId.trim() || undefined,
        experienceYears: typeof formExperience === 'number' ? formExperience : undefined,
        notes: formNotes.trim() || undefined,
      });
    } else {
      addReferee({
        name: formName.trim(),
        role: formRole,
        affiliation: formAffiliation.trim(),
        phone: formPhone.trim(),
        sportsSpecialty: formSports,
        licenseId: formLicenseId.trim() || undefined,
        experienceYears: typeof formExperience === 'number' ? formExperience : undefined,
        notes: formNotes.trim() || undefined,
      });
    }

    setShowAddModal(false);
    setEditingReferee(null);
  };

  // Filtered referees list
  const filteredReferees = useMemo(() => {
    return referees.filter(r => {
      if (selectedSportFilter !== 'all' && !r.sportsSpecialty.includes(selectedSportFilter)) {
        return false;
      }
      if (selectedRoleFilter !== 'all' && r.role !== selectedRoleFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesAffil = r.affiliation.toLowerCase().includes(query);
        const matchesPhone = r.phone.includes(query);
        const matchesLicense = (r.licenseId || '').toLowerCase().includes(query);
        if (!matchesName && !matchesAffil && !matchesPhone && !matchesLicense) {
          return false;
        }
      }
      return true;
    });
  }, [referees, selectedSportFilter, selectedRoleFilter, searchQuery]);

  // Matches for assignment view
  const matchesForAssignment = useMemo(() => {
    return matches.filter(m => {
      if (assignmentSportFilter !== 'all' && m.sport !== assignmentSportFilter) {
        return false;
      }
      return true;
    });
  }, [matches, assignmentSportFilter]);

  // Count how many matches each referee is assigned to
  const getRefereeMatchCount = (refId: string) => {
    return matches.filter(m => {
      const isHead = m.referees?.head?.id === refId;
      const isScorer = m.referees?.scorer?.id === refId;
      const isAssistant = m.referees?.assistants?.some(a => a.id === refId);
      return isHead || isScorer || isAssistant;
    }).length;
  };

  // Quick auto-assign handler
  const handleAutoAssign = () => {
    const target = assignmentSportFilter !== 'all' ? assignmentSportFilter : undefined;
    const assigned = autoAssignRefereesBySport(target);
    if (assigned === 0) {
      alert('ไม่พบแมตช์ที่ตรงกับเงื่อนไข หรือยังไม่มีผู้ตัดสินที่มีความเชี่ยวชาญในชนิดกีฬานี้');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm">
                <Scale className="w-3.5 h-3.5" />
                คณะกรรมการผู้ตัดสินคลองหาดเกมส์ 2026
              </span>
              <span className="text-xs text-emerald-200">
                ระบบจัดการคุณวุฒิ & จัดตารางตัดสินตามชนิดกีฬา
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              ลงทะเบียน & มอบหมายหน้าที่ผู้ตัดสิน
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
              บันทึกรายชื่อ คุณวุฒิ และความเชี่ยวชาญของกรรมการผู้ตัดสินแยกตามชนิดกีฬาทั้ง 8 ชนิด
              สามารถเพิ่มหรือแก้ไขข้อมูลได้ตลอดเวลา พร้อมระบบจัดรายชื่อลงตารางแข่งขันอัตโนมัติ
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ลงทะเบียนผู้ตัดสินใหม่</span>
            </button>

            <button
              onClick={() => setShowDutySchedulePrint(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/25 transition-all hover:scale-105 cursor-pointer"
              title="ดูตารางคำสั่งแต่งตั้งและมอบหมายหน้าที่"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">พิมพ์คำสั่งมอบหมาย</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-white">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">ผู้ตัดสินทั้งหมด</span>
            <span className="text-xl sm:text-2xl font-black text-white">{referees.length} ท่าน</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">หัวหน้าผู้ตัดสิน</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">
              {referees.filter(r => r.role === 'head_referee').length} ท่าน
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">ผู้บันทึกคะแนน & เวลา</span>
            <span className="text-xl sm:text-2xl font-black text-teal-200">
              {referees.filter(r => r.role === 'scorer').length} ท่าน
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">แมตช์ที่ได้รับการจัดแล้ว</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300">
              {matches.filter(m => m.referees?.head).length} / {matches.length} คู่
            </span>
          </div>
        </div>
      </div>

      {/* Main Sub-View Switcher (Directory vs Match Assignment) */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSubView('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'directory'
                ? 'bg-white text-emerald-800 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>ทะเบียนรายชื่อผู้ตัดสิน ({filteredReferees.length})</span>
          </button>

          <button
            onClick={() => setSubView('assignment')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'assignment'
                ? 'bg-white text-emerald-800 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>จัดผู้ตัดสินลงตารางการแข่งขัน ({matches.length} คู่)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs">
          <button
            onClick={() => setShowSheetsModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ซิงค์ชีตผู้ตัดสิน</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: REFEREE DIRECTORY
          ========================================================================= */}
      {subView === 'directory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
            {/* Sport Filter Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  เลือกชนิดกีฬาที่รับผิดชอบ:
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  แสดง {filteredReferees.length} จาก {referees.length} ท่าน
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedSportFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedSportFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ทั้งหมด (ทุกกีฬา)
                </button>
                {(Object.keys(SPORT_LABELS) as SportType[]).map(s => {
                  const info = SPORT_LABELS[s];
                  const isSel = selectedSportFilter === s;
                  const countForSport = referees.filter(r => r.sportsSpecialty.includes(s)).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSportFilter(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{info.icon}</span>
                      <span>{info.nameTh}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSel ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {countForSport}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search and Role Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้ตัดสิน, สังกัดโรงเรียน, เบอร์โทรศัพท์, หรือเลขที่ใบอนุญาต..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedRoleFilter}
                  onChange={e => setSelectedRoleFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">-- ทุกตำแหน่ง/บทบาท --</option>
                  {(Object.keys(REFEREE_ROLE_CONFIG) as Referee['role'][]).map(r => (
                    <option key={r} value={r}>
                      {REFEREE_ROLE_CONFIG[r].titleTh}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Referees Grid Cards */}
          {filteredReferees.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ไม่พบรายชื่อผู้ตัดสินที่ตรงกับเงื่อนไข</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                กรุณาลองเปลี่ยนคำค้นหา หรือกดปุ่ม &quot;ลงทะเบียนผู้ตัดสินใหม่&quot; เพื่อเพิ่มรายชื่อเข้าสู่ระบบ
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ ลงทะเบียนผู้ตัดสิน</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReferees.map(ref => {
                const roleConfig = REFEREE_ROLE_CONFIG[ref.role] || REFEREE_ROLE_CONFIG.head_referee;
                const assignedMatches = getRefereeMatchCount(ref.id);

                return (
                  <div
                    key={ref.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all hover:border-emerald-300 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Row: Role Badge & Action Buttons */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${roleConfig.badgeColor}`}
                        >
                          <span>{roleConfig.icon}</span>
                          <span>{roleConfig.titleTh}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(ref)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลผู้ตัดสิน"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRefereeToDelete(ref)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ลบรายชื่อ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Referee Name & Affiliation */}
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{ref.name}</h3>
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ref.affiliation}</span>
                      </p>

                      {/* Contact & License Info */}
                      <div className="mt-3 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            เบอร์โทร:
                          </span>
                          <a
                            href={`tel:${ref.phone}`}
                            className="font-mono font-bold text-emerald-800 hover:underline"
                          >
                            {ref.phone}
                          </a>
                        </div>
                        {ref.licenseId && (
                          <div className="flex items-center justify-between text-slate-700 text-[11px]">
                            <span className="text-slate-500">เลขที่ใบอนุญาต:</span>
                            <span className="font-mono font-semibold text-slate-800">{ref.licenseId}</span>
                          </div>
                        )}
                        {ref.experienceYears !== undefined && (
                          <div className="flex items-center justify-between text-slate-700 text-[11px]">
                            <span className="text-slate-500">ประสบการณ์:</span>
                            <span className="font-semibold text-slate-800">{ref.experienceYears} ปี</span>
                          </div>
                        )}
                      </div>

                      {/* Sports Specialty Badges */}
                      <div className="mt-3.5">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                          กีฬาที่ได้รับมอบหมาย / เชี่ยวชาญ ({ref.sportsSpecialty.length} ชนิด):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ref.sportsSpecialty.map(sp => {
                            const spLabel = SPORT_LABELS[sp];
                            return (
                              <span
                                key={sp}
                                className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1"
                              >
                                <span>{spLabel?.icon || '🏅'}</span>
                                <span>{spLabel?.nameTh || sp}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {ref.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-2.5 line-clamp-2">
                          &quot;{ref.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Bottom Status & Duty Assignment Count */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        มอบหมายแล้ว:{' '}
                        <strong className="text-emerald-800 font-bold">{assignedMatches} คู่</strong>
                      </span>
                      <button
                        onClick={() => {
                          setAssignmentSportFilter(ref.sportsSpecialty[0] || 'all');
                          setSubView('assignment');
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>จัดลงตาราง</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MATCH REFEREE ASSIGNMENT
          ========================================================================= */}
      {subView === 'assignment' && (
        <div className="space-y-4">
          {/* Control Bar for Assignment */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>มอบหมายกรรมการผู้ตัดสินประจำแมตช์การแข่งขัน</span>
                </h3>
                <p className="text-xs text-slate-500">
                  เลือกระบุหัวหน้าผู้ตัดสิน ผู้ช่วยผู้ตัดสิน และผู้บันทึกคะแนน โดยระบบจะคัดกรองผู้ตัดสินที่เชี่ยวชาญกีฬานั้นๆ ให้โดยเฉพาะ
                </p>
              </div>

              {/* Auto Assign Button */}
              <button
                onClick={handleAutoAssign}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>จัดผู้ตัดสินอัตโนมัติ (ตามชนิดกีฬา)</span>
              </button>
            </div>

            {/* Sport Filter for Matches */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 shrink-0">เลือกกีฬา:</span>
              <button
                onClick={() => setAssignmentSportFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  assignmentSportFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ทุกชนิดกีฬา ({matches.length})
              </button>
              {(Object.keys(SPORT_LABELS) as SportType[]).map(s => {
                const info = SPORT_LABELS[s];
                const isSel = assignmentSportFilter === s;
                const matchCount = matches.filter(m => m.sport === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setAssignmentSportFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.nameTh}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSel ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {matchCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matches List with Referee Selectors */}
          <div className="space-y-3.5">
            {matchesForAssignment.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-sm">
                ไม่พบแมตช์การแข่งขันในชนิดกีฬานี้
              </div>
            ) : (
              matchesForAssignment.map(m => {
                const sportInfo = SPORT_LABELS[m.sport];
                // Referees specialized in this match sport
                const qualifiedReferees = referees.filter(r => r.sportsSpecialty.includes(m.sport));

                return (
                  <MatchRefereeAssignmentCard
                    key={m.id}
                    match={m}
                    sportInfo={sportInfo}
                    allReferees={referees}
                    qualifiedReferees={qualifiedReferees}
                    onSaveReferees={(newRefs) => assignReferees(m.id, newRefs)}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT REFEREE
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {editingReferee ? 'แก้ไขข้อมูลคณะกรรมการผู้ตัดสิน' : 'ลงทะเบียนกรรมการผู้ตัดสินใหม่'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    กำหนดบทบาท สังกัด และเลือกชนิดกีฬาที่รับผิดชอบได้ตามต้องการ
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReferee(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReferee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อ-นามสกุล (พร้อมคำนำหน้า) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น อาจารย์ประสิทธิ์ พัฒนา หรือ ร.ต.ต.สมศักดิ์"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    บทบาท / ตำแหน่งหลัก <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    required
                  >
                    {(Object.keys(REFEREE_ROLE_CONFIG) as Referee['role'][]).map(r => (
                      <option key={r} value={r}>
                        {REFEREE_ROLE_CONFIG[r].titleTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    สังกัด / โรงเรียน / หน่วยงาน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น โรงเรียนบ้านคลองหาด หรือ สมาคมผู้ตัดสินกีฬา"
                    value={formAffiliation}
                    onChange={e => setFormAffiliation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 081-234-5678"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เลขที่ใบอนุญาต / วุฒิบัตรผู้ตัดสิน (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น SKW-REF-FB01"
                    value={formLicenseId}
                    onChange={e => setFormLicenseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ประสบการณ์การตัดสิน (ปี)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    placeholder="เช่น 8"
                    value={formExperience}
                    onChange={e => setFormExperience(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sports Specialty Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>ชนิดกีฬาที่รับผิดชอบและเชี่ยวชาญ</span>
                    <span className="text-rose-500">*</span>
                    <span className="text-slate-400 font-normal">
                      (เลือกได้หลายชนิดกีฬาที่ท่านได้รับมอบหมาย)
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllSports}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                    >
                      เลือกทุกชนิดกีฬา
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {(Object.keys(SPORT_LABELS) as SportType[]).map(sp => {
                    const info = SPORT_LABELS[sp];
                    const isChecked = formSports.includes(sp);
                    return (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => handleToggleFormSport(sp)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-sm">{info.icon}</span>
                        <span className="truncate">{info.nameTh}</span>
                        {isChecked && (
                          <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-200 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  หมายเหตุ / คุณวุฒิเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ผู้ตัดสินระดับเขต, ผ่านการอบรมผู้ตัดสินสมาคมกีฬาปี 2568"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingReferee(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {editingReferee ? 'บันทึกการแก้ไข' : 'บันทึกรายชื่อผู้ตัดสิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE CONFIRMATION
          ========================================================================= */}
      {refereeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบรายชื่อผู้ตัดสิน</h3>
              <p className="text-xs text-slate-600 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{refereeToDelete.name}</strong> ออกจากระบบทะเบียน?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setRefereeToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  deleteReferee(refereeToDelete.id);
                  setRefereeToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRINT OFFICIAL DUTY SCHEDULE
          ========================================================================= */}
      {showDutySchedulePrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>คำสั่งแต่งตั้งและมอบหมายหน้าที่คณะกรรมการผู้ตัดสิน (คลองหาดเกมส์ 2026)</span>
              </h3>
              <button
                onClick={() => setShowDutySchedulePrint(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Document Sheet */}
            <div className="space-y-5 text-slate-900 font-sans">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  บัญชีรายชื่อและการมอบหมายหน้าที่คณะกรรมการผู้ตัดสิน
                </h2>
                <h3 className="text-sm font-bold text-emerald-800">
                  การแข่งขันกีฬานักเรียนอำเภอคลองหาด &quot;คลองหาดเกมส์ 2026&quot;
                </h3>
                <p className="text-xs text-slate-500">
                  สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสระแก้ว เขต 1
                </p>
              </div>

              {/* Table of Referees by Sport */}
              <div className="space-y-4">
                {(Object.keys(SPORT_LABELS) as SportType[]).map(sp => {
                  const spInfo = SPORT_LABELS[sp];
                  const spRefs = referees.filter(r => r.sportsSpecialty.includes(sp));
                  if (spRefs.length === 0) return null;

                  return (
                    <div key={sp} className="border border-slate-200 rounded-2xl p-3.5 space-y-2">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <span>{spInfo.icon}</span>
                        <span>คณะกรรมการผู้ตัดสิน ชนิดกีฬา: {spInfo.nameTh} ({spRefs.length} ท่าน)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {spRefs.map(r => (
                          <div
                            key={r.id}
                            className="p-2 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{r.name}</span>
                              <span className="text-[11px] text-slate-500 block">{r.affiliation}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                              {REFEREE_ROLE_CONFIG[r.role]?.shortTh || r.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>ออกเอกสาร ณ วันที่ 2 กันยายน 2569</span>
                <span className="font-bold text-slate-700">ฝ่ายจัดการแข่งขันและผู้ตัดสิน อำเภอคลองหาด</span>
              </div>
            </div>

            {/* Print & Close Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setShowDutySchedulePrint(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสารนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal isOpen={showSheetsModal} onClose={() => setShowSheetsModal(false)} />
    </div>
  );
};

/**
 * Sub-component for individual match referee assignment card
 */
interface MatchRefereeAssignmentCardProps {
  match: Match;
  sportInfo: { nameTh: string; icon: string };
  allReferees: Referee[];
  qualifiedReferees: Referee[];
  onSaveReferees: (newRefs: Match['referees']) => void;
}

const MatchRefereeAssignmentCard: React.FC<MatchRefereeAssignmentCardProps> = ({
  match,
  sportInfo,
  allReferees,
  qualifiedReferees,
  onSaveReferees,
}) => {
  const [selectedHeadId, setSelectedHeadId] = useState(match.referees?.head?.id || '');
  const [selectedScorerId, setSelectedScorerId] = useState(match.referees?.scorer?.id || '');
  const [selectedAssistant1Id, setSelectedAssistant1Id] = useState(
    match.referees?.assistants?.[0]?.id || ''
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const head = allReferees.find(r => r.id === selectedHeadId);
    const scorer = allReferees.find(r => r.id === selectedScorerId);
    const asst1 = allReferees.find(r => r.id === selectedAssistant1Id);

    onSaveReferees({
      head,
      scorer,
      assistants: asst1 ? [asst1] : [],
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm hover:border-emerald-300 transition-all space-y-4">
      {/* Top: Match Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
            #{match.matchNumber}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1">
            <span>{sportInfo.icon}</span>
            <span>{sportInfo.nameTh}</span>
          </span>
          <span className="text-sm font-black text-slate-900">
            {match.team1Name} <span className="text-emerald-700 font-bold px-1">VS</span> {match.team2Name}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            {match.scheduledDate} ({match.scheduledTime})
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            {match.venue}
          </span>
        </div>
      </div>

      {/* Assignment Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Head Referee Selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
            <span>⚖️ หัวหน้าผู้ตัดสิน:</span>
            {qualifiedReferees.length > 0 && (
              <span className="text-[10px] text-emerald-700 font-semibold">
                (มีผู้เชี่ยวชาญ {qualifiedReferees.length} ท่าน)
              </span>
            )}
          </label>
          <select
            value={selectedHeadId}
            onChange={e => setSelectedHeadId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">-- ไม่ได้ระบุ --</option>
            {qualifiedReferees.length > 0 && (
              <optgroup label="⭐ ผู้ตัดสินที่เชี่ยวชาญกีฬานี้">
                {qualifiedReferees.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({REFEREE_ROLE_CONFIG[r.role]?.shortTh || r.role} - {r.affiliation})
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="ผู้ตัดสินท่านอื่นในระบบ">
              {allReferees
                .filter(r => !r.sportsSpecialty.includes(match.sport))
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({REFEREE_ROLE_CONFIG[r.role]?.shortTh || r.role})
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Scorer / Timekeeper */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            ⏱️ ผู้บันทึกคะแนน & เวลา:
          </label>
          <select
            value={selectedScorerId}
            onChange={e => setSelectedScorerId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">-- ไม่ได้ระบุ --</option>
            {allReferees.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({REFEREE_ROLE_CONFIG[r.role]?.shortTh || r.role})
                {r.sportsSpecialty.includes(match.sport) ? ' ⭐' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Assistant Referee */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            🚩 ผู้ช่วยผู้ตัดสิน / กรรมการกำกับเส้น:
          </label>
          <select
            value={selectedAssistant1Id}
            onChange={e => setSelectedAssistant1Id(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">-- ไม่ได้ระบุ --</option>
            {allReferees.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({REFEREE_ROLE_CONFIG[r.role]?.shortTh || r.role})
                {r.sportsSpecialty.includes(match.sport) ? ' ⭐' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save Button for this Match */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-slate-500">
          {match.referees?.head ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              จัดหน้าที่แล้ว: {match.referees.head.name}
            </span>
          ) : (
            <span className="text-amber-600">ยังไม่ได้บันทึกมอบหมายหน้าที่</span>
          )}
        </div>

        <button
          onClick={handleSave}
          className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isSaved
              ? 'bg-emerald-700 text-white shadow-sm scale-105'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>บันทึกแล้ว!</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>บันทึกการมอบหมาย</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
