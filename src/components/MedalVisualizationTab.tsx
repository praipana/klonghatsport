import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SPORT_LABELS, SportType } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  BarChart2,
  Trophy,
  Medal,
  Award,
  Layers,
  BarChart3,
  TrendingUp,
  Filter,
  ArrowUpDown,
  PieChart as PieIcon,
  Sparkles,
  Download,
  Printer,
  Shield,
  Users,
} from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomMedalTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs text-slate-900 max-w-xs ring-1 ring-slate-900/5">
        <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: data.color || '#10b981' }}
          />
          <h4 className="font-bold text-sm text-slate-900 truncate">{data.fullName || label}</h4>
        </div>

        <div className="space-y-1.5 font-medium">
          <div className="flex items-center justify-between gap-4 text-amber-700">
            <span className="flex items-center gap-1.5">
              <span>🥇</span> เหรียญทอง:
            </span>
            <span className="font-mono font-bold text-sm">{data.gold} เหรียญ</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>🥈</span> เหรียญเงิน:
            </span>
            <span className="font-mono font-bold text-sm">{data.silver} เหรียญ</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-amber-800">
            <span className="flex items-center gap-1.5">
              <span>🥉</span> เหรียญทองแดง:
            </span>
            <span className="font-mono font-bold text-sm">{data.bronze} เหรียญ</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4 text-emerald-700 font-bold">
            <span>รวมเหรียญทั้งหมด:</span>
            <span className="font-mono font-bold text-sm">{data.totalMedals} เหรียญ</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-indigo-700 font-bold">
            <span>คะแนนสะสมรวม:</span>
            <span className="font-mono font-bold text-sm">{data.totalPoints} แต้ม</span>
          </div>

          {data.principalName && (
            <p className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
              {data.principalRole || 'ผู้อำนวยการ'}: {data.principalName}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const MedalVisualizationTab: React.FC = () => {
  const { schools, teams, matches } = useTournament();

  const [chartMode, setChartMode] = useState<'grouped' | 'stacked' | 'points'>('grouped');
  const [viewScope, setViewScope] = useState<'schools' | 'sports'>('schools');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'gold' | 'total' | 'points' | 'name'>('gold');

  // Prepare chart dataset for schools
  const chartData = useMemo(() => {
    let list = schools.map(sch => {
      const totalMedals = sch.gold + sch.silver + sch.bronze;
      return {
        id: sch.id,
        name: sch.shortName || sch.name.replace('โรงเรียน', ''),
        fullName: sch.name,
        principalName: sch.principalName,
        principalRole: sch.principalRole || 'ผู้อำนวยการ',
        color: sch.color,
        gold: sch.gold,
        silver: sch.silver,
        bronze: sch.bronze,
        totalMedals,
        totalPoints: sch.totalPoints,
        totalAthletes: sch.totalAthletes,
      };
    });

    // Sorting logic
    list.sort((a, b) => {
      if (sortBy === 'gold') {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return b.totalPoints - a.totalPoints;
      }
      if (sortBy === 'total') {
        if (b.totalMedals !== a.totalMedals) return b.totalMedals - a.totalMedals;
        return b.gold - a.gold;
      }
      if (sortBy === 'points') {
        return b.totalPoints - a.totalPoints;
      }
      return a.fullName.localeCompare(b.fullName, 'th');
    });

    return list;
  }, [schools, sortBy]);

  // Aggregate stats
  const totalGoldSum = useMemo(() => schools.reduce((acc, s) => acc + s.gold, 0), [schools]);
  const totalSilverSum = useMemo(() => schools.reduce((acc, s) => acc + s.silver, 0), [schools]);
  const totalBronzeSum = useMemo(() => schools.reduce((acc, s) => acc + s.bronze, 0), [schools]);
  const totalAllMedals = totalGoldSum + totalSilverSum + totalBronzeSum;

  const topSchool = useMemo(() => {
    return [...schools].sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      return b.bronze - a.bronze;
    })[0];
  }, [schools]);

  const topPointsSchool = useMemo(() => {
    return [...schools].sort((a, b) => b.totalPoints - a.totalPoints)[0];
  }, [schools]);

  // Data for Pie Distribution of Total Medals across Schools
  const pieData = useMemo(() => {
    return chartData.map(item => ({
      name: item.name,
      fullName: item.fullName,
      value: item.totalMedals,
      color: item.color,
      gold: item.gold,
      silver: item.silver,
      bronze: item.bronze,
      totalMedals: item.totalMedals,
      totalPoints: item.totalPoints,
    }));
  }, [chartData]);

  // Sport distribution breakdown
  const sportBreakdown = useMemo(() => {
    const counts: Record<SportType, { name: string; count: number; color: string }> = {
      football: { name: 'ฟุตบอล 7 คน', count: 0, color: '#10b981' },
      volleyball: { name: 'วอลเลย์บอล', count: 0, color: '#f59e0b' },
      takraw: { name: 'เซปักตะกร้อ', count: 0, color: '#f43f5e' },
      petanque: { name: 'เปตอง', count: 0, color: '#06b6d4' },
      tug_of_war: { name: 'ชักเย่อ', count: 0, color: '#ea580c' },
      running_50m: { name: 'วิ่ง 50 เมตร', count: 0, color: '#3b82f6' },
      running_80m: { name: 'วิ่ง 80 เมตร', count: 0, color: '#6366f1' },
      running_100m: { name: 'วิ่ง 100 เมตร', count: 0, color: '#8b5cf6' },
    };

    matches.forEach(m => {
      if (m.status === 'finished') {
        counts[m.sport].count += 1;
      }
    });

    return Object.entries(counts).map(([sportKey, val]) => ({
      sport: sportKey as SportType,
      name: val.name,
      finishedMatches: val.count,
      color: val.color,
      totalTeams: teams.filter(t => t.sport === sportKey).length,
    }));
  }, [matches, teams]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              แผนภูมิวิเคราะห์สถิติเหรียญรางวัล (Recharts Medal Analytics)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            ระบบแสดงผลแผนภูมิแท่งเปรียบเทียบ (Comparative Bar Chart) จำนวนเหรียญรางวัล ทอง เงิน ทองแดง และคะแนนรวมของแต่ละโรงเรียนในสังกัดอำเภอคลองหาด
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงานสถิติ</span>
          </button>
        </div>
      </div>

      {/* Hero Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Gold Champion */}
        <div className="p-5 rounded-3xl bg-white border border-amber-300 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shrink-0">
            🥇
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">
              ผู้นำเหรียญทอง (Champion)
            </span>
            <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">{topSchool?.name || '-'}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span className="font-bold text-amber-700">{topSchool?.gold} ทอง</span>
              <span>•</span>
              <span>{topSchool?.totalPoints} คะแนน</span>
            </div>
          </div>
        </div>

        {/* Top Points Leader */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-300 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">
              คะแนนรวมสูงสุด (Points Leader)
            </span>
            <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">{topPointsSchool?.name || '-'}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span className="font-bold text-emerald-700">{topPointsSchool?.totalPoints} แต้ม</span>
              <span>•</span>
              <span>{topPointsSchool?.gold + topPointsSchool?.silver + topPointsSchool?.bronze} เหรียญรวม</span>
            </div>
          </div>
        </div>

        {/* Total Medals Awarded */}
        <div className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-indigo-800 block uppercase tracking-wider">
              เหรียญที่ชิงชัยทั้งหมด
            </span>
            <h3 className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{totalAllMedals} <span className="text-xs font-normal text-slate-500">เหรียญ</span></h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
              <span>🥇{totalGoldSum}</span>
              <span>🥈{totalSilverSum}</span>
              <span>🥉{totalBronzeSum}</span>
            </div>
          </div>
        </div>

        {/* Participating Schools */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
              โรงเรียนร่วมแข่งขัน
            </span>
            <h3 className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{schools.length} <span className="text-xs font-normal text-slate-500">สถาบัน</span></h3>
            <p className="text-[11px] text-slate-500 mt-1">
              สังกัด สพป.สระแก้ว เขต 1
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          {/* Chart Type Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              รูปแบบแผนภูมิ:
            </span>

            <button
              onClick={() => setChartMode('grouped')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'grouped'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>แท่งเปรียบเทียบแยกเหรียญ</span>
            </button>

            <button
              onClick={() => setChartMode('stacked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'stacked'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>แท่งซ้อนเหรียญสะสม</span>
            </button>

            <button
              onClick={() => setChartMode('points')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'points'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>คะแนนสะสมรวม</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              เรียงตาม:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="gold">🥇 เหรียญทอง (มาก ➔ น้อย)</option>
              <option value="total">🏆 เหรียญรวมทั้งหมด</option>
              <option value="points">⚡ คะแนนรวมสะสม</option>
              <option value="name">🔤 ชื่อโรงเรียน</option>
            </select>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="w-full h-[400px] sm:h-[460px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 65 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                dy={8}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomMedalTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 600 }}
              />

              {chartMode === 'grouped' && (
                <>
                  <Bar
                    dataKey="gold"
                    name="🥇 เหรียญทอง (Gold)"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar
                    dataKey="silver"
                    name="🥈 เหรียญเงิน (Silver)"
                    fill="#94a3b8"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                  />
                  <Bar
                    dataKey="bronze"
                    name="🥉 เหรียญทองแดง (Bronze)"
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1400}
                  />
                </>
              )}

              {chartMode === 'stacked' && (
                <>
                  <Bar
                    dataKey="gold"
                    name="🥇 เหรียญทอง"
                    stackId="medals"
                    fill="#f59e0b"
                    animationDuration={1000}
                  />
                  <Bar
                    dataKey="silver"
                    name="🥈 เหรียญเงิน"
                    stackId="medals"
                    fill="#94a3b8"
                    animationDuration={1200}
                  />
                  <Bar
                    dataKey="bronze"
                    name="🥉 เหรียญทองแดง"
                    stackId="medals"
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1400}
                  />
                </>
              )}

              {chartMode === 'points' && (
                <Bar
                  dataKey="totalPoints"
                  name="⚡ คะแนนรวมสะสม (Total Points)"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
              เหรียญทอง (5 แต้ม)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#94a3b8]" />
              เหรียญเงิน (3 แต้ม)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#d97706]" />
              เหรียญทองแดง (1 แต้ม)
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            * สถิติอัปเดตอัตโนมัติเมื่อแมตช์จบการแข่งขัน
          </span>
        </div>
      </div>

      {/* Secondary Visualization Insights (Pie Chart & School Ranking Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Medal Share by School */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              สัดส่วนการครองเหรียญรางวัล (Medal Share %)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            เปอร์เซ็นต์ส่วนแบ่งเหรียญรางวัลรวมทั้งหมด {totalAllMedals} เหรียญ ตามสถาบัน
          </p>

          <div className="w-full h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`pie-cell-${idx}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomMedalTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 font-mono">{totalAllMedals}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">เหรียญทั้งหมด</span>
            </div>
          </div>

          {/* Mini Legend List */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-xs">
            {pieData.map((sch, i) => (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sch.color }} />
                <span className="text-slate-700 truncate text-[11px] font-medium">{sch.name}</span>
                <span className="text-slate-500 font-mono text-[11px] ml-auto font-bold">{sch.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown Comparison Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  ตารางสรุปเปรียบเทียบเชิงลึก (Comparative Data Matrix)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">{schools.length} โรงเรียน</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 font-bold border-b border-slate-200 pb-2">
                    <th className="pb-2 text-center w-10">#</th>
                    <th className="pb-2">โรงเรียน</th>
                    <th className="pb-2 text-center text-amber-700">🥇 ทอง</th>
                    <th className="pb-2 text-center text-slate-600">🥈 เงิน</th>
                    <th className="pb-2 text-center text-amber-800">🥉 ทองแดง</th>
                    <th className="pb-2 text-center text-slate-800">รวมเหรียญ</th>
                    <th className="pb-2 text-center text-emerald-700">คะแนนสะสม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {chartData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 text-center font-mono text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-slate-900 truncate max-w-[140px] sm:max-w-none">
                            {item.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold text-amber-700">{item.gold}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-slate-600">{item.silver}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-amber-800">{item.bronze}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-slate-900 bg-slate-100 rounded-lg">
                        {item.totalMedals}
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold text-emerald-700">
                        {item.totalPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>คำนวณเกณฑ์คะแนน: ชนะเลิศ (5) • รองอันดับ 1 (3) • รองอันดับ 2 (1)</span>
            <span className="font-semibold text-emerald-700">KlongHat Games 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
