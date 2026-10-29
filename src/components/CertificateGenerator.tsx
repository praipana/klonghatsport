import React, { useState, useRef, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Certificate, SportType, CategoryLevel, SPORT_LABELS, CATEGORY_LABELS, AWARD_LABELS } from '../types';
import {
  Award,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CertificateGenerator: React.FC = () => {
  const { certificates, generateCertificate, deleteCertificate, schools, isAdmin } = useTournament();

  const [selectedCert, setSelectedCert] = useState<Certificate>(certificates[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual Form States
  const [manualName, setManualName] = useState('');
  const [manualSchool, setManualSchool] = useState(schools[0]?.name || '');
  const [manualSport, setManualSport] = useState<SportType>('football');
  const [manualCategory, setManualCategory] = useState<CategoryLevel>('primary_upper_male');
  const [manualRank, setManualRank] = useState<Certificate['awardRank']>('champion');
  const [manualRole, setManualRole] = useState<Certificate['recipientRole']>('athlete');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw certificate on canvas with high DPI and authentic Thai ornate royal layout
  useEffect(() => {
    if (!selectedCert || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution (1920x1080 landscape)
    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background base
    ctx.fillStyle = '#fcfbf7';
    ctx.fillRect(0, 0, width, height);

    // Decorative Outer Border - Deep Navy & Gold
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#0f2942'; // Dark Royal Navy
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d4af37'; // Golden Accent
    ctx.strokeRect(50, 50, width - 100, height - 100);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#d4af37';
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Corner Ornaments (Golden Geometric Filigree)
    const drawCorner = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = '#c59b27';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 0);
      ctx.lineTo(50, 10);
      ctx.lineTo(10, 10);
      ctx.lineTo(10, 50);
      ctx.lineTo(0, 50);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };

    drawCorner(70, 70, 0);
    drawCorner(width - 70, 70, Math.PI / 2);
    drawCorner(width - 70, height - 70, Math.PI);
    drawCorner(70, height - 70, -Math.PI / 2);

    // Background Watermark Emblem
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 260, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';
    ctx.fill();
    ctx.restore();

    // Top Emblem Icon
    ctx.save();
    ctx.fillStyle = '#0f2942';
    ctx.beginPath();
    ctx.arc(width / 2, 160, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 36px "Sarabun", "Prompt", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', width / 2, 160);
    ctx.restore();

    // Top Titles
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f2942';
    ctx.font = 'bold 38px "Prompt", "Sarabun", sans-serif';
    ctx.fillText('อำเภอคลองหาด ร่วมกับ สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสระแก้ว เขต 1', width / 2, 250);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 24px "Sarabun", "Prompt", sans-serif';
    ctx.fillText('การแข่งขันกีฬานักเรียนอำเภอคลองหาด "KLONGHAT GAMES 2569"', width / 2, 290);

    ctx.fillStyle = '#c59b27';
    ctx.font = 'bold 44px "Prompt", sans-serif';
    ctx.fillText('เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า', width / 2, 360);

    // Recipient Name Highlight
    ctx.fillStyle = '#0f2942';
    ctx.font = 'bold 64px "Prompt", "Sarabun", sans-serif';
    ctx.fillText(selectedCert.recipientName, width / 2, 450);

    // Underline for name
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 300, 475);
    ctx.lineTo(width / 2 + 300, 475);
    ctx.stroke();

    // School & Role
    ctx.fillStyle = '#334155';
    ctx.font = '600 32px "Sarabun", sans-serif';
    ctx.fillText(`${selectedCert.schoolName}`, width / 2, 530);

    // Achievement text
    const rankInfo = AWARD_LABELS[selectedCert.awardRank];
    const sportName = SPORT_LABELS[selectedCert.sport]?.nameTh || selectedCert.sport;
    const catName = CATEGORY_LABELS[selectedCert.category]?.nameTh || selectedCert.category;

    ctx.fillStyle = '#0f2942';
    ctx.font = '500 30px "Sarabun", sans-serif';
    ctx.fillText(`ได้รับ ${rankInfo.labelTh}`, width / 2, 600);

    ctx.fillStyle = '#475569';
    ctx.font = '500 26px "Sarabun", sans-serif';
    ctx.fillText(`ชนิดกีฬา ${sportName} ${catName}`, width / 2, 645);

    ctx.font = '400 22px "Sarabun", sans-serif';
    ctx.fillText(`ขอให้มีความสุข ความเจริญ และมีน้ำใจนักกีฬา "รู้แพ้ รู้ชนะ รู้อภัย" ตลอดไป`, width / 2, 700);

    ctx.fillText(`ให้ไว้ ณ วันที่ ${selectedCert.issueDate}`, width / 2, 740);

    // Signatories (Dual Official Signatures)
    const sigY = 870;

    // Signatory 1 (นายอำเภอคลองหาด)
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 4 - 150, sigY);
    ctx.lineTo(width / 4 + 150, sigY);
    ctx.stroke();

    // Simulated signature script
    ctx.font = 'italic 28px "Prompt", cursive';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('ธีรเดช สุขประเสริฐ', width / 4, sigY - 20);

    ctx.fillStyle = '#0f2942';
    ctx.font = 'bold 24px "Sarabun", sans-serif';
    ctx.fillText(`(${selectedCert.signatoryName1})`, width / 4, sigY + 35);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 20px "Sarabun", sans-serif';
    ctx.fillText(selectedCert.signatoryTitle1, width / 4, sigY + 65);

    // Signatory 2 (ผอ. สพป.สระแก้ว เขต 1)
    ctx.beginPath();
    ctx.moveTo((width / 4) * 3 - 150, sigY);
    ctx.lineTo((width / 4) * 3 + 150, sigY);
    ctx.stroke();

    ctx.font = 'italic 28px "Prompt", cursive';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('สมเกียรติ พัฒนวงศ์', (width / 4) * 3, sigY - 20);

    ctx.fillStyle = '#0f2942';
    ctx.font = 'bold 24px "Sarabun", sans-serif';
    ctx.fillText(`(${selectedCert.signatoryName2})`, (width / 4) * 3, sigY + 35);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 20px "Sarabun", sans-serif';
    ctx.fillText(selectedCert.signatoryTitle2, (width / 4) * 3, sigY + 65);

    // Official Seal in Middle
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, sigY + 10, 52, 0, Math.PI * 2);
    ctx.fillStyle = '#b91c1c'; // Red Wax Seal
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px "Prompt", sans-serif';
    ctx.fillText('สพป.สระแก้ว ๑', width / 2, sigY + 5);
    ctx.font = '12px "Prompt", sans-serif';
    ctx.fillText('คลองหาดเกมส์', width / 2, sigY + 25);
    ctx.restore();

    // Bottom Verification Bar & Certificate Serial Code
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 16px "Sarabun", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`เลขที่เกียรติบัตร: ${selectedCert.certificateNumber}`, 75, height - 70);

    ctx.textAlign = 'right';
    ctx.fillText(`รหัสตรวจสอบ (Verify): ${selectedCert.verificationCode}`, width - 75, height - 70);
  }, [selectedCert]);

  // Download High-Res PNG
  const handleDownload = () => {
    if (!canvasRef.current || !selectedCert) return;
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
    const link = document.createElement('a');
    link.download = `เกียรติบัตร_${selectedCert.certificateNumber}_${selectedCert.recipientName}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  // Print PDF directly
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>พิมพ์เกียรติบัตร - ${selectedCert.recipientName}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #eee; }
              img { width: 100%; max-width: 1100px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
              @media print {
                body { background: white; }
                img { width: 100%; max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualSchool) return;

    const newCert = generateCertificate({
      recipientName: manualName,
      recipientRole: manualRole,
      schoolName: manualSchool,
      sport: manualSport,
      category: manualCategory,
      awardRank: manualRank,
      signatoryTitle1: 'นายอำเภอคลองหาด',
      signatoryName1: 'นายธีรเดช สุขประเสริฐ',
      signatoryTitle2: 'ผู้อำนวยการ สพป.สระแก้ว เขต 1',
      signatoryName2: 'ดร.สมเกียรติ พัฒนวงศ์',
    });

    setSelectedCert(newCert);
    setManualName('');
    setShowManualForm(false);
    confetti({ particleCount: 70, spread: 50 });
  };

  const filteredCerts = certificates.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.recipientName.toLowerCase().includes(q) ||
      c.schoolName.toLowerCase().includes(q) ||
      c.certificateNumber.toLowerCase().includes(q) ||
      c.verificationCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              ระบบการออกเกียรติบัตรออนไลน์อัตโนมัติ (E-Certificate Center)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            ออกเกียรติบัตรทางการพร้อมลายเซ็นนายอำเภอคลองหาดและ ผอ.สพป.สระแก้ว เขต 1 พิมพ์และดาวน์โหลดความละเอียดสูงได้ทันที
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ออกเกียรติบัตรแบบกำหนดเอง</span>
          </button>
        )}
      </div>

      {/* Manual Certificate Modal / Form */}
      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-white border border-amber-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>กรอกข้อมูลเพื่อออกเกียรติบัตรใหม่</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">ชื่อ-นามสกุล ผู้รับเกียรติบัตร</label>
              <input
                type="text"
                placeholder="เช่น เด็กชายวรวุฒิ นามดี"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">โรงเรียน / สังกัด</label>
              <select
                value={manualSchool}
                onChange={e => setManualSchool(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">กีฬา</label>
              <select
                value={manualSport}
                onChange={e => setManualSport(e.target.value as SportType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {(Object.keys(SPORT_LABELS) as SportType[]).map(s => (
                  <option key={s} value={s}>
                    {SPORT_LABELS[s].nameTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">รุ่นอายุ/ระดับ</label>
              <select
                value={manualCategory}
                onChange={e => setManualCategory(e.target.value as CategoryLevel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {(Object.keys(CATEGORY_LABELS) as CategoryLevel[]).map(c => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c].shortTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">รางวัล / ผลงาน</label>
              <select
                value={manualRank}
                onChange={e => setManualRank(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="champion">🥇 ชนะเลิศ (เหรียญทอง)</option>
                <option value="first_runner_up">🥈 รองชนะเลิศ อันดับ 1 (เงิน)</option>
                <option value="second_runner_up">🥉 รองชนะเลิศ อันดับ 2 (ทองแดง)</option>
                <option value="participant">🎗️ เข้าร่วมการแข่งขัน</option>
                <option value="honorary">🎖️ ผู้ฝึกสอน / กรรมการ</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">บทบาท</label>
              <select
                value={manualRole}
                onChange={e => setManualRole(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="athlete">นักกีฬา</option>
                <option value="coach">ผู้ฝึกสอน</option>
                <option value="referee">กรรมการผู้ตัดสิน</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              ออกเกียรติบัตรทันที
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Preview Canvas & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Certificate Previewer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  ตัวอย่างเกียรติบัตรฉบับจริง (Live High-Resolution Canvas)
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด PNG</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-slate-300 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ / PDF</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-3">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md border border-slate-200"
              />
            </div>

            {/* Certificate Meta & Verification */}
            {selectedCert && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600">
                    เลขที่: <strong className="font-mono text-slate-900">{selectedCert.certificateNumber}</strong>
                  </span>
                </div>

                <div className="text-slate-600">
                  รหัสตรวจสอบความถูกต้อง: <span className="text-amber-800 font-mono font-bold">{selectedCert.verificationCode}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate List Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>ทำเนียบเกียรติบัตร ({certificates.length})</span>
              <span className="text-xs font-semibold text-slate-500">เลือกเพื่อดูและพิมพ์</span>
            </h3>

            {/* Search */}
            <div className="relative mb-3.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, โรงเรียน, เลขเกียรติบัตร..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 flex-1">
              {filteredCerts.map(cert => {
                const isSelected = selectedCert?.id === cert.id;
                const rank = AWARD_LABELS[cert.awardRank];

                return (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCert(cert)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{rank.medal}</span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{cert.recipientName}</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{cert.schoolName}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="font-semibold text-amber-800">{SPORT_LABELS[cert.sport]?.nameTh}</span>
                        <span>•</span>
                        <span className="font-mono">{cert.certificateNumber}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteCertificate(cert.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
