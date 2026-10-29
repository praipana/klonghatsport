import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SchoolInfo, SPORT_LABELS, CATEGORY_LABELS } from '../types';
import {
  Trophy,
  Medal,
  Award,
  Users,
  School,
  Search,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const MedalStandingsTab: React.FC = () => {
  const { schools, teams } = useTournament();

  const [activeSubTab, setActiveSubTab] = useState<'medals' | 'schools' | 'athletes'>('medals');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort schools by Gold, Silver, Bronze, Total Points
  const sortedSchools = [...schools].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return b.totalPoints - a.totalPoints;
  });

  // Extract all athletes
  const allAthletes = teams.flatMap(t =>
    t.roster.map(ath => ({
      ...ath,
      teamName: t.name,
      schoolName: t.schoolName,
      sport: t.sport,
      category: t.category,
      teamColor: t.teamColor,
    }))
  );

  const filteredAthletes = allAthletes.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.schoolName.toLowerCase().includes(q) ||
      a.teamName.toLowerCase().includes(q) ||
      (a.studentId && a.studentId.toLowerCase().includes(q))
    );
  });

  const totalGold = schools.reduce((sum, s) => sum + s.gold, 0);
  const totalSilver = schools.reduce((sum, s) => sum + s.silver, 0);
  const totalBronze = schools.reduce((sum, s) => sum + s.bronze, 0);
  const totalAthletesCount = teams.reduce((sum, t) => sum + t.roster.length, 0);

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 border border-amber-200 flex items-center gap-3 sm:gap-3.5 shadow-sm hover:border-amber-400 transition-all hover:scale-[1.01]">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-sm">
            🥇
          </div>
          <div>
            <span className="text-xs text-amber-900 font-bold">เหรียญทองรวม</span>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 font-mono">{totalGold}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-3 sm:gap-3.5 shadow-sm hover:border-slate-300 transition-all hover:scale-[1.01]">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-sm">
            🥈
          </div>
          <div>
            <span className="text-xs text-slate-700 font-bold">เหรียญเงินรวม</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-mono">{totalSilver}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-orange-50/70 border border-orange-200 flex items-center gap-3 sm:gap-3.5 shadow-sm hover:border-orange-300 transition-all hover:scale-[1.01]">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-sm">
            🥉
          </div>
          <div>
            <span className="text-xs text-orange-900 font-bold">เหรียญทองแดงรวม</span>
            <h3 className="text-xl sm:text-2xl font-black text-orange-700 font-mono">{totalBronze}</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 sm:gap-3.5 shadow-sm hover:border-emerald-300 transition-all hover:scale-[1.01]">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-sm">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-900 font-bold">นักกีฬาทั้งหมด</span>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">{totalAthletesCount}</h3>
          </div>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-fit">
        <button
          onClick={() => setActiveSubTab('medals')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'medals'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>ตารางสรุปเหรียญรางวัล</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schools')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'schools'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <School className="w-4 h-4" />
          <span>ฐานข้อมูลโรงเรียน ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('athletes')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'athletes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ทำเนียบนักกีฬา ({allAthletes.length})</span>
        </button>
      </div>

      {/* Medal Table View */}
      {activeSubTab === 'medals' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>ตารางสรุปเหรียญรางวัล ครองตำแหน่งเจ้าเหรียญทอง</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                การจัดอันดับคำนวณตามมาตรฐานสากล: เหรียญทอง ➔ เหรียญเงิน ➔ เหรียญทองแดง ➔ คะแนนรวม
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              อัปเดตคะแนนอัตโนมัติ Real-Time
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-14">อันดับ</th>
                  <th className="p-3">โรงเรียน / สังกัด</th>
                  <th className="p-3 text-center text-amber-600 font-bold">🥇 ทอง</th>
                  <th className="p-3 text-center text-slate-700 font-bold">🥈 เงิน</th>
                  <th className="p-3 text-center text-orange-700 font-bold">🥉 ทองแดง</th>
                  <th className="p-3 text-center text-blue-700 font-bold">คะแนนรวม</th>
                  <th className="p-3 text-center">นักกีฬา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSchools.map((sch, index) => {
                  const isFirst = index === 0;

                  return (
                    <tr
                      key={sch.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isFirst ? 'bg-amber-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm">
                            1
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow-sm">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-300 text-slate-900 font-black text-xs shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono font-bold">{index + 1}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: sch.color }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 sm:text-sm block">
                              {sch.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {sch.principalRole || 'ผู้อำนวยการ'}: {sch.principalName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-sm text-amber-600">
                        {sch.gold}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-sm text-slate-700">
                        {sch.silver}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-sm text-orange-600">
                        {sch.bronze}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-sm text-blue-700 bg-blue-50/40">
                        {sch.totalPoints}
                      </td>
                      <td className="p-3 text-center text-slate-600 font-semibold">
                        {sch.totalAthletes} คน
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* School Directory Cards */}
      {activeSubTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map(sch => (
            <div
              key={sch.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 shadow-sm"
                style={{ backgroundColor: sch.color }}
              >
                <School className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">{sch.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sch.district} {sch.province} (สพป.สระแก้ว เขต 1)
                </p>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  {sch.principalRole || 'ผู้อำนวยการ'}: {sch.principalName}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-amber-600 font-bold">🥇 {sch.gold}</span>
                  <span className="text-slate-700 font-bold">🥈 {sch.silver}</span>
                  <span className="text-orange-600 font-bold">🥉 {sch.bronze}</span>
                  <span className="text-blue-700 font-bold ml-auto">
                    คะแนน: {sch.totalPoints} แต้ม
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Athlete Directory */}
      {activeSubTab === 'athletes' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว, โรงเรียน..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAthletes.map((ath, idx) => (
              <div
                key={`${ath.id}_${idx}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: ath.teamColor || '#059669' }}
                >
                  #{ath.jerseyNumber || (idx + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{ath.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{ath.schoolName}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">{ath.grade}</span>
                    <span>{ath.position || 'นักกีฬา'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
