export type SportType =
  | 'football'
  | 'volleyball'
  | 'takraw'
  | 'petanque'
  | 'tug_of_war'
  | 'running_50m'
  | 'running_80m'
  | 'running_100m';

export type CategoryLevel = 
  | 'kindergarten' // อนุบาล
  | 'primary_lower' // ประถมต้น (ป.1-3)
  | 'primary_upper_male' // ประถมปลายชาย (ป.4-6 ชาย)
  | 'primary_upper_female' // ประถมปลายหญิง (ป.4-6 หญิง)
  | 'secondary_lower' // มัธยมศึกษาตอนต้น (ม.1-3)
  | 'secondary_lower_male' // มัธยมศึกษาตอนต้น ชาย (ม.1-3 ชาย)
  | 'secondary_lower_female'; // มัธยมศึกษาตอนต้น หญิง (ม.1-3 หญิง)

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'delayed';

export type MatchStage = 'group' | 'quarter' | 'semi' | 'bronze' | 'final';

export interface Athlete {
  id: string;
  name: string;
  studentId: string;
  grade: string; // e.g. "ป.5/1", "อนุบาล 3"
  jerseyNumber?: number;
  position?: string;
  age: number;
}

export interface Team {
  id: string;
  name: string;
  schoolName: string;
  schoolId: string;
  sport: SportType;
  category: CategoryLevel;
  coachName: string;
  coachPhone: string;
  teamColor: string;
  roster: Athlete[];
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  logoUrl?: string;
}

export interface Referee {
  id: string;
  name: string;
  role: 'head_referee' | 'assistant_1' | 'assistant_2' | 'scorer' | 'umpire';
  affiliation: string; // สังกัด เช่น โรงเรียนบ้านคลองหาด, สมาคมผู้ตัดสินสระแก้ว
  phone: string;
  sportsSpecialty: SportType[];
  licenseId?: string; // เลขที่ใบอนุญาต/วุฒิบัตรผู้ตัดสิน
  experienceYears?: number; // ประสบการณ์ (ปี)
  notes?: string;
}

export const REFEREE_ROLE_CONFIG: Record<
  Referee['role'],
  { titleTh: string; shortTh: string; badgeColor: string; icon: string }
> = {
  head_referee: {
    titleTh: 'หัวหน้าผู้ตัดสิน (ผู้ตัดสินหลัก)',
    shortTh: 'ผู้ตัดสินหลัก',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '⚖️',
  },
  assistant_1: {
    titleTh: 'ผู้ช่วยผู้ตัดสินที่ 1 (กรรมการกำกับเส้น/ไลน์แมน)',
    shortTh: 'ผู้ช่วยผู้ตัดสิน 1',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '🚩',
  },
  assistant_2: {
    titleTh: 'ผู้ช่วยผู้ตัดสินที่ 2 (กรรมการโต๊ะ/ผู้ตัดสินที่ 4)',
    shortTh: 'ผู้ช่วยผู้ตัดสิน 2',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    icon: '📋',
  },
  scorer: {
    titleTh: 'ผู้บันทึกคะแนนและเวลา (Scorer / Timekeeper)',
    shortTh: 'ผู้บันทึกคะแนน',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '⏱️',
  },
  umpire: {
    titleTh: 'กรรมการชี้ขาด / กรรมการตัดสินทั่วไป',
    shortTh: 'กรรมการชี้ขาด',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🛡️',
  },
};

export interface MatchScoreEvent {
  id: string;
  timeMinute: number; // e.g. 14'
  teamId: string;
  type: 'goal' | 'point' | 'yellow_card' | 'red_card' | 'foul' | 'timeout' | 'substitute' | 'set_win';
  detail: string; // e.g. "ยิงประตูโดย เด็กชายสมศักดิ์", "ขอเวลานอก (Time-out)"
  scorerName?: string;
}

export interface MatchScore {
  team1Score: number;
  team2Score: number;
  team1Sets?: number[]; // e.g. [25, 23, 15] for volleyball/takraw
  team2Sets?: number[]; // e.g. [22, 25, 12]
  currentPeriod?: string; // "ครึ่งแรก", "ครึ่งหลัง", "เซตที่ 2", "รอบที่ 5"
  events: MatchScoreEvent[];
}

export interface Match {
  id: string;
  matchNumber: number;
  sport: SportType;
  category: CategoryLevel;
  stage: MatchStage;
  team1Id: string;
  team1Name: string;
  team1School: string;
  team2Id: string;
  team2Name: string;
  team2School: string;
  venue: string; // e.g. "สนามฟุตบอล 1 (สนามกลางอำเภอคลองหาด)"
  scheduledTime: string; // "10:30 น."
  scheduledDate: string; // "2026-09-02"
  status: MatchStatus;
  score: MatchScore;
  referees: {
    head?: Referee;
    assistants?: Referee[];
    scorer?: Referee;
  };
  winnerTeamId?: string;
  bracketPosition?: {
    round: number; // 1: Quarter, 2: Semi, 3: Final
    matchIndex: number;
  };
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'result' | 'general' | 'schedule';
  author: string;
  timestamp: string;
  pinned?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'score_update' | 'match_start' | 'match_end' | 'announcement' | 'award';
  matchId?: string;
  timestamp: string;
  read: boolean;
}

export interface SchoolInfo {
  id: string;
  name: string;
  shortName: string;
  district: string;
  province: string;
  principalName: string;
  principalRole?: string;
  color: string;
  accentColor: string;
  gold: number;
  silver: number;
  bronze: number;
  totalPoints: number;
  totalAthletes: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // e.g. "KHG-2026-FB-001"
  recipientName: string;
  recipientRole: 'athlete' | 'coach' | 'referee' | 'team';
  schoolName: string;
  sport: SportType;
  category: CategoryLevel;
  awardRank: 'champion' | 'first_runner_up' | 'second_runner_up' | 'participant' | 'honorary';
  issueDate: string;
  verificationCode: string;
  signatoryTitle1: string; // "นายอำเภอคลองหาด"
  signatoryName1: string; // "นายธีรเดช สุขประเสริฐ"
  signatoryTitle2: string; // "ผู้อำนวยการ สพป.สระแก้ว เขต 1"
  signatoryName2: string; // "ดร.สมเกียรติ พัฒนวงศ์"
}

export const SPORT_LABELS: Record<SportType, { nameTh: string; nameEn: string; icon: string; color: string }> = {
  football: { nameTh: 'ฟุตบอล 7 คน', nameEn: 'Football', icon: '⚽', color: 'emerald' },
  volleyball: { nameTh: 'วอลเลย์บอล', nameEn: 'Volleyball', icon: '🏐', color: 'amber' },
  takraw: { nameTh: 'เซปักตะกร้อ', nameEn: 'Sepak Takraw', icon: '🏸', color: 'rose' },
  petanque: { nameTh: 'เปตอง', nameEn: 'Petanque', icon: '🎯', color: 'cyan' },
  tug_of_war: { nameTh: 'ชักเย่อ', nameEn: 'Tug of War', icon: '🪢', color: 'orange' },
  running_50m: { nameTh: 'วิ่ง 50 เมตร', nameEn: '50m Sprint', icon: '🏃', color: 'blue' },
  running_80m: { nameTh: 'วิ่ง 80 เมตร', nameEn: '80m Sprint', icon: '⚡', color: 'indigo' },
  running_100m: { nameTh: 'วิ่ง 100 เมตร', nameEn: '100m Sprint', icon: '🥇', color: 'violet' },
};

export const CATEGORY_LABELS: Record<CategoryLevel, { nameTh: string; shortTh: string; badgeColor: string }> = {
  kindergarten: { nameTh: 'ระดับอนุบาล (ปฐมวัย)', shortTh: 'อนุบาล', badgeColor: 'bg-pink-500/20 text-pink-700 border-pink-500/30' },
  primary_lower: { nameTh: 'ระดับประถมต้น (ป.1 - ป.3)', shortTh: 'ประถมต้น', badgeColor: 'bg-sky-500/20 text-sky-700 border-sky-500/30' },
  primary_upper_male: { nameTh: 'ระดับประถมปลาย ชาย (ป.4 - ป.6)', shortTh: 'ประถมปลาย (ช)', badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' },
  primary_upper_female: { nameTh: 'ระดับประถมปลาย หญิง (ป.4 - ป.6)', shortTh: 'ประถมปลาย (ญ)', badgeColor: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
  secondary_lower: { nameTh: 'ระดับมัธยมศึกษาตอนต้น (ม.1 - ม.3)', shortTh: 'มัธยมต้น', badgeColor: 'bg-amber-500/20 text-amber-800 border-amber-500/40' },
  secondary_lower_male: { nameTh: 'ระดับมัธยมศึกษาตอนต้น ชาย (ม.1 - ม.3)', shortTh: 'มัธยมต้น (ช)', badgeColor: 'bg-blue-500/20 text-blue-800 border-blue-500/40' },
  secondary_lower_female: { nameTh: 'ระดับมัธยมศึกษาตอนต้น หญิง (ม.1 - ม.3)', shortTh: 'มัธยมต้น (ญ)', badgeColor: 'bg-rose-500/20 text-rose-800 border-rose-500/40' },
};

export const STAGE_LABELS: Record<MatchStage, string> = {
  group: 'รอบแบ่งกลุ่ม',
  quarter: 'รอบ 8 ทีม (ก่อนรองฯ)',
  semi: 'รอบรองชนะเลิศ',
  bronze: 'ชิงอันดับ 3 (เหรียญทองแดง)',
  final: 'รอบชิงชนะเลิศ (ชิงเหรียญทอง)',
};

export const AWARD_LABELS = {
  champion: { labelTh: 'รางวัลชนะเลิศ (เหรียญทอง)', medal: '🥇', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40' },
  first_runner_up: { labelTh: 'รางวัลรองชนะเลิศ อันดับ 1 (เหรียญเงิน)', medal: '🥈', color: 'text-slate-300', bg: 'bg-slate-500/20 border-slate-500/40' },
  second_runner_up: { labelTh: 'รางวัลรองชนะเลิศ อันดับ 2 (เหรียญทองแดง)', medal: '🥉', color: 'text-amber-600', bg: 'bg-amber-700/20 border-amber-700/40' },
  participant: { labelTh: 'เกียรติบัตรเข้าร่วมการแข่งขัน', medal: '🎗️', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/40' },
  honorary: { labelTh: 'เกียรติบัตรผู้ฝึกสอน/กรรมการผู้ตัดสิน', medal: '🎖️', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40' },
};
