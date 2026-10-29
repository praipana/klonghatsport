import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Team,
  Match,
  SchoolInfo,
  Referee,
  Announcement,
  AppNotification,
  Certificate,
  SportType,
  CategoryLevel,
  MatchScoreEvent,
  MatchStatus,
  SPORT_LABELS,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_REFEREES,
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CERTIFICATES,
} from '../data/initialData';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import { GoogleWorkspaceService } from '../services/googleSheetsService';
import {
  auth,
  db,
  signInWithGoogle as fbSignInWithGoogle,
  signOutUser as fbSignOutUser,
  isGoogleUser as checkIsGoogleUser,
  testFirestoreConnection,
  User,
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface TournamentContextType {
  // State
  schools: SchoolInfo[];
  teams: Team[];
  matches: Match[];
  referees: Referee[];
  announcements: Announcement[];
  notifications: AppNotification[];
  certificates: Certificate[];
  activeTab: string;
  isAdmin: boolean;
  soundEnabled: boolean;
  activeToast: AppNotification | null;

  // Google Authentication & Editor Rights
  currentUser: User | null;
  authLoading: boolean;
  isGoogleUser: boolean;
  canEdit: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  requireGoogleAuth: (reason?: string) => boolean;
  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;
  authPromptReason: string;
  firestoreSynced: boolean;

  // Setters / Actions
  setActiveTab: (tab: string) => void;
  setIsAdmin: (val: boolean) => void;
  setSoundEnabled: (val: boolean) => void;
  closeToast: () => void;

  // Registration actions
  registerTeam: (teamData: Omit<Team, 'id' | 'status' | 'registeredAt'>) => Team;
  updateTeam: (teamId: string, updatedData: Partial<Team>) => void;
  updateTeamStatus: (teamId: string, status: 'approved' | 'rejected' | 'pending') => void;
  deleteTeam: (teamId: string) => void;

  // Match / Bracket actions
  createMatch: (matchData: Omit<Match, 'id' | 'matchNumber'>) => Match;
  updateMatchScore: (
    matchId: string,
    team1Score: number,
    team2Score: number,
    currentPeriod?: string,
    team1Sets?: number[],
    team2Sets?: number[]
  ) => void;
  addMatchEvent: (matchId: string, event: Omit<MatchScoreEvent, 'id'>) => void;
  updateMatchStatus: (matchId: string, status: MatchStatus, winnerTeamId?: string) => void;
  assignReferees: (matchId: string, referees: Match['referees']) => void;
  autoGenerateBracket: (sport: SportType, category: CategoryLevel) => void;
  deleteMatch: (matchId: string) => void;

  // Announcement & Notification actions
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp'>) => void;
  deleteAnnouncement: (id: string) => void;
  sendNotification: (title: string, message: string, type?: AppNotification['type'], matchId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Certificate actions
  generateCertificate: (certData: Omit<Certificate, 'id' | 'certificateNumber' | 'issueDate' | 'verificationCode'>) => Certificate;
  batchGenerateCertificatesForMatch: (matchId: string) => void;
  deleteCertificate: (id: string) => void;

  // Referee actions
  addReferee: (referee: Omit<Referee, 'id'>) => Referee;
  updateReferee: (referee: Referee) => void;
  deleteReferee: (id: string) => void;
  getRefereesBySport: (sport: SportType) => Referee[];
  autoAssignRefereesBySport: (sport?: SportType) => number;

  // Reset / Simulation demo
  resetToDefaultData: () => void;
  simulateLiveEvent: () => void;

  // Google Sheets & Drive Sync
  syncToGoogleSheets: () => Promise<any>;
  isGoogleSheetsConnected: () => boolean;
  autoSyncToSheets: boolean;
  setAutoSyncToSheets: (val: boolean) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TEAMS: 'kloghat_teams_v3',
  MATCHES: 'kloghat_matches_v3',
  SCHOOLS: 'kloghat_schools_v3',
  REFEREES: 'kloghat_referees_v3',
  ANNOUNCEMENTS: 'kloghat_announcements_v3',
  NOTIFICATIONS: 'kloghat_notifications_v3',
  CERTIFICATES: 'kloghat_certificates_v3',
  SOUND: 'kloghat_sound_v3',
};

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<SchoolInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [referees, setReferees] = useState<Referee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REFEREES);
    return saved ? JSON.parse(saved) : INITIAL_REFEREES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [activeTab, setActiveTab] = useState<string>('bracket');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [autoSyncToSheets, setAutoSyncToSheetsState] = useState<boolean>(() => {
    return GoogleWorkspaceService.isAutoSyncEnabled();
  });

  // Google Authentication & Authorization States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authPromptReason, setAuthPromptReason] = useState<string>('');
  const [firestoreSynced, setFirestoreSynced] = useState<boolean>(false);

  const isGoogleUser = checkIsGoogleUser(currentUser);
  const canEdit = Boolean(currentUser && isGoogleUser);

  const requireGoogleAuth = (
    reason: string = 'กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อแก้ไขหรือเพิ่มเติมข้อมูล'
  ): boolean => {
    if (currentUser && isGoogleUser) {
      return true;
    }
    setAuthPromptReason(reason);
    setShowAuthModal(true);
    if (soundEnabled) {
      soundEffects.playWhistle();
    }
    return false;
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const user = await fbSignInWithGoogle();
      if (user) {
        setCurrentUser(user);
        setIsAdmin(true);
        if (soundEnabled) {
          soundEffects.playScoreAlert();
        }
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        sendNotification(
          'ลงชื่อเข้าใช้สำเร็จ',
          `เข้าสู่ระบบด้วยบัญชี Google (${user.email}) เรียบร้อยแล้ว พร้อมสิทธิ์แก้ไขและเพิ่มเติมข้อมูล`,
          'announcement'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const signOutUser = async (): Promise<void> => {
    await fbSignOutUser();
    setCurrentUser(null);
    setIsAdmin(false);
    sendNotification(
      'ออกจากระบบแล้ว',
      'ระบบเปลี่ยนเป็นโหมดอ่านอย่างเดียว (View-Only Mode) เรียบร้อยแล้ว',
      'announcement'
    );
  };

  // Listen to Firebase Auth state & fetch initial Cloud Firestore snapshot
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user && checkIsGoogleUser(user)) {
        setIsAdmin(true);
      }
    });

    const loadCloudData = async () => {
      try {
        const snap = await getDoc(doc(db, 'tournaments', 'klonghat2569'));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.matches) && data.matches.length > 0) setMatches(data.matches);
          if (Array.isArray(data.teams) && data.teams.length > 0) setTeams(data.teams);
          if (Array.isArray(data.announcements) && data.announcements.length > 0) setAnnouncements(data.announcements);
          if (Array.isArray(data.referees) && data.referees.length > 0) setReferees(data.referees);
          setFirestoreSynced(true);
        }
      } catch (err) {
        console.warn('Firestore initial data fetch:', err);
      }
    };
    loadCloudData();

    return () => unsubscribe();
  }, []);

  // Automatic Cloud Firestore Sync when an authorized Google user makes modifications
  useEffect(() => {
    if (!currentUser || !checkIsGoogleUser(currentUser)) return;
    const timer = setTimeout(async () => {
      try {
        await setDoc(
          doc(db, 'tournaments', 'klonghat2569'),
          {
            id: 'klonghat2569',
            matches,
            teams,
            referees,
            announcements,
            updatedBy: currentUser.uid,
            updatedByEmail: currentUser.email || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setFirestoreSynced(true);
      } catch (err) {
        console.warn('Sync to Cloud Firestore:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [matches, teams, referees, announcements, currentUser]);

  const setAutoSyncToSheets = (val: boolean) => {
    setAutoSyncToSheetsState(val);
    GoogleWorkspaceService.setAutoSyncEnabled(val);
  };

  // Sync sounds
  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    soundEffects.setEnabled(val);
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(val));
  };

  // Persist storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REFEREES, JSON.stringify(referees));
  }, [referees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  }, [certificates]);

  // Direct sync to Google Sheets helper
  const syncToGoogleSheets = async () => {
    return GoogleWorkspaceService.syncTournamentToGoogleSheets({
      schools,
      teams,
      matches,
      referees,
      announcements,
      certificates,
    });
  };

  const isGoogleSheetsConnected = () => {
    return GoogleWorkspaceService.isConnected();
  };

  // Debounced Auto-Sync to Google Sheets whenever any data changes (if user is connected & auto-sync enabled)
  useEffect(() => {
    if (!autoSyncToSheets || !GoogleWorkspaceService.isConnected()) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await GoogleWorkspaceService.syncTournamentToGoogleSheets({
          schools,
          teams,
          matches,
          referees,
          announcements,
          certificates,
        });
        console.log('⚡ Auto-synced all tournament changes to Google Sheets successfully');
      } catch (err) {
        console.warn('Auto-sync to Google Sheets paused:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [schools, teams, matches, referees, announcements, certificates, autoSyncToSheets]);

  // Recalculate School Medal Table and Points
  const recalculateMedals = (currentMatches: Match[], currentTeams: Team[]) => {
    const schoolStats: Record<string, { gold: number; silver: number; bronze: number; athletes: number }> = {};

    // Initialize all schools
    INITIAL_SCHOOLS.forEach(sch => {
      schoolStats[sch.name] = { gold: 0, silver: 0, bronze: 0, athletes: 0 };
    });

    // Count athletes from approved teams
    currentTeams.forEach(team => {
      if (team.status === 'approved' && schoolStats[team.schoolName]) {
        schoolStats[team.schoolName].athletes += team.roster.length;
      }
    });

    // Count medals from finished matches
    currentMatches.forEach(m => {
      if (m.status === 'finished' && m.winnerTeamId) {
        const isWinnerTeam1 = m.winnerTeamId === m.team1Id;
        const winnerSchool = isWinnerTeam1 ? m.team1School : m.team2School;
        const runnerUpSchool = isWinnerTeam1 ? m.team2School : m.team1School;

        if (m.stage === 'final') {
          if (schoolStats[winnerSchool]) schoolStats[winnerSchool].gold += 1;
          if (schoolStats[runnerUpSchool]) schoolStats[runnerUpSchool].silver += 1;
        } else if (m.stage === 'bronze') {
          if (schoolStats[winnerSchool]) schoolStats[winnerSchool].bronze += 1;
        }
      }
    });

    // Update schools with new points (Gold=5, Silver=3, Bronze=1)
    setSchools(prevSchools =>
      prevSchools.map(sch => {
        const stat = schoolStats[sch.name] || { gold: 0, silver: 0, bronze: 0, athletes: 0 };
        const gold = stat.gold;
        const silver = stat.silver;
        const bronze = stat.bronze;
        const totalPoints = gold * 5 + silver * 3 + bronze * 1;
        return {
          ...sch,
          gold,
          silver,
          bronze,
          totalPoints,
          totalAthletes: Math.max(sch.totalAthletes, stat.athletes),
        };
      })
    );
  };

  const closeToast = () => setActiveToast(null);

  const sendNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'announcement',
    matchId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      matchId,
      timestamp: 'เมื่อสักครู่',
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    if (type === 'score_update') {
      soundEffects.playScoreAlert();
    } else if (type === 'match_start' || type === 'match_end') {
      soundEffects.playWhistle();
    } else {
      soundEffects.playNotification();
    }
  };

  // Register Team
  const registerTeam = (teamData: Omit<Team, 'id' | 'status' | 'registeredAt'>): Team => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อลงทะเบียนทีมและเพิ่มรายชื่อนักกีฬา')) {
      return null as any;
    }
    const newTeam: Team = {
      ...teamData,
      id: `team_${Date.now()}`,
      status: 'approved',
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setTeams(prev => [newTeam, ...prev]);
    sendNotification(
      '📋 ลงทะเบียนทีมสำเร็จ',
      `ทีม ${newTeam.name} (${newTeam.schoolName}) ลงทะเบียนกีฬาสำเร็จพร้อมนักกีฬา ${newTeam.roster.length} คน`,
      'announcement'
    );
    return newTeam;
  };

  const updateTeam = (teamId: string, updatedData: Partial<Team>) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อแก้ไขข้อมูลทีม')) {
      return;
    }
    let oldTeamName = '';
    let newTeamName = '';
    let newSchoolName = '';

    setTeams(prev => {
      const existing = prev.find(t => t.id === teamId);
      if (!existing) return prev;
      oldTeamName = existing.name;
      newTeamName = updatedData.name || existing.name;
      newSchoolName = updatedData.schoolName || existing.schoolName;

      return prev.map(t => (t.id === teamId ? { ...t, ...updatedData } : t));
    });

    // If team name or school name changed, also update any matches featuring this team
    if (updatedData.name || updatedData.schoolName) {
      setMatches(prevMatches =>
        prevMatches.map(m => {
          let updated = { ...m };
          if (m.team1Id === teamId) {
            if (updatedData.name) updated.team1Name = updatedData.name;
            if (updatedData.schoolName) updated.team1School = updatedData.schoolName;
          }
          if (m.team2Id === teamId) {
            if (updatedData.name) updated.team2Name = updatedData.name;
            if (updatedData.schoolName) updated.team2School = updatedData.schoolName;
          }
          return updated;
        })
      );
    }

    sendNotification(
      '✏️ บันทึกการแก้ไขข้อมูลทีมสำเร็จ',
      `อัปเดตข้อมูลทีม "${updatedData.name || oldTeamName}" สำหรับการแข่งขันเรียบร้อยแล้ว`,
      'announcement'
    );
  };

  const updateTeamStatus = (teamId: string, status: 'approved' | 'rejected' | 'pending') => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อเปลี่ยนสถานะทีม')) {
      return;
    }
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, status } : t)));
  };

  const deleteTeam = (teamId: string) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อลบข้อมูลทีม')) {
      return;
    }
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  // Create match
  const createMatch = (matchData: Omit<Match, 'id' | 'matchNumber'>): Match => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อเพิ่มคู่แข่งขันใหม่')) {
      return null as any;
    }
    const maxNum = matches.reduce((max, m) => Math.max(max, m.matchNumber), 100);
    const newMatch: Match = {
      ...matchData,
      id: `match_${Date.now()}`,
      matchNumber: maxNum + 1,
    };
    const updated = [newMatch, ...matches];
    setMatches(updated);
    sendNotification(
      '📅 เพิ่มคู่แข่งขันใหม่',
      `คู่ที่ ${newMatch.matchNumber}: ${newMatch.team1Name} พบ ${newMatch.team2Name} ณ ${newMatch.venue}`,
      'match_start',
      newMatch.id
    );
    return newMatch;
  };

  // Update match score
  const updateMatchScore = (
    matchId: string,
    team1Score: number,
    team2Score: number,
    currentPeriod?: string,
    team1Sets?: number[],
    team2Sets?: number[]
  ) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อบันทึกหรือปรับแก้ไขผลคะแนน')) {
      return;
    }
    setMatches(prevMatches => {
      const match = prevMatches.find(m => m.id === matchId);
      if (!match) return prevMatches;

      const scoreChanged = match.score.team1Score !== team1Score || match.score.team2Score !== team2Score;
      const updatedMatch: Match = {
        ...match,
        score: {
          ...match.score,
          team1Score,
          team2Score,
          currentPeriod: currentPeriod !== undefined ? currentPeriod : match.score.currentPeriod,
          team1Sets: team1Sets !== undefined ? team1Sets : match.score.team1Sets,
          team2Sets: team2Sets !== undefined ? team2Sets : match.score.team2Sets,
        },
      };

      if (scoreChanged) {
        sendNotification(
          `⚡ อัปเดตสกอร์: ${match.team1Name} ${team1Score} - ${team2Score} ${match.team2Name}`,
          `${match.sport.toUpperCase()} | ${currentPeriod || match.score.currentPeriod || 'กำลังแข่งขัน'}`,
          'score_update',
          matchId
        );
      }

      return prevMatches.map(m => (m.id === matchId ? updatedMatch : m));
    });
  };

  // Add match event
  const addMatchEvent = (matchId: string, eventData: Omit<MatchScoreEvent, 'id'>) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อบันทึกเหตุการณ์การแข่งขัน')) {
      return;
    }
    const newEvent: MatchScoreEvent = {
      ...eventData,
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };

    setMatches(prev =>
      prev.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          score: {
            ...m.score,
            events: [newEvent, ...m.score.events],
          },
        };
      })
    );

    sendNotification(
      `🔔 ไฮไลท์การแข่งขัน: ${eventData.detail}`,
      `${eventData.scorerName ? `โดย ${eventData.scorerName}` : 'เหตุการณ์ในเกม'} (นาทีที่ ${eventData.timeMinute})`,
      'score_update',
      matchId
    );
  };

  // Update match status & automatically handle medals / certificate triggers
  const updateMatchStatus = (matchId: string, status: MatchStatus, winnerTeamId?: string) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อเปลี่ยนสถานะการแข่งขัน')) {
      return;
    }
    let triggeredWinnerMatch: Match | undefined;

    setMatches(prevMatches => {
      const updated = prevMatches.map(m => {
        if (m.id !== matchId) return m;
        const finalWinner = winnerTeamId !== undefined ? winnerTeamId : m.winnerTeamId;
        const newMatch: Match = {
          ...m,
          status,
          winnerTeamId: finalWinner,
        };
        if (status === 'finished') {
          triggeredWinnerMatch = newMatch;
        }
        return newMatch;
      });

      recalculateMedals(updated, teams);
      return updated;
    });

    if (status === 'finished') {
      soundEffects.playWhistle();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const currentM = matches.find(m => m.id === matchId);
      if (currentM) {
        const winnerName = winnerTeamId === currentM.team1Id ? currentM.team1Name : currentM.team2Name;
        sendNotification(
          '🏆 จบการแข่งขัน!',
          `${currentM.team1Name} ${currentM.score.team1Score} - ${currentM.score.team2Score} ${currentM.team2Name} | ผู้ชนะ: ${winnerName}`,
          'award',
          matchId
        );

        // Auto batch generate certificate for champions if final
        if (currentM.stage === 'final' && winnerTeamId) {
          batchGenerateCertificatesForMatch(matchId);
        }
      }
    } else if (status === 'live') {
      soundEffects.playWhistle();
      sendNotification('▶️ เริ่มการแข่งขันแล้ว!', `การแข่งขันคู่ที่ ${matchId} ได้เริ่มขึ้นแล้ว`, 'match_start', matchId);
    }
  };

  const assignReferees = (matchId: string, refereesData: Match['referees']) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อมอบหมายผู้ตัดสิน')) {
      return;
    }
    setMatches(prev =>
      prev.map(m => (m.id === matchId ? { ...m, referees: refereesData } : m))
    );
  };

  // Auto Generate Bracket from registered teams for a sport/category
  const autoGenerateBracket = (sport: SportType, category: CategoryLevel) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อจัดสายการแข่งขัน')) {
      return;
    }
    const categoryTeams = teams.filter(t => t.sport === sport && t.category === category && t.status === 'approved');

    if (categoryTeams.length < 2) {
      alert('ต้องการทีมที่ลงทะเบียนและอนุมัติแล้วอย่างน้อย 2 ทีมเพื่อสร้างผังจับคู่การแข่งขัน');
      return;
    }

    // Shuffle teams
    const shuffled = [...categoryTeams].sort(() => Math.random() - 0.5);
    const newMatches: Match[] = [];
    let matchCounter = matches.reduce((max, m) => Math.max(max, m.matchNumber), 100) + 1;

    const getSportVenue = (sp: SportType) => {
      switch (sp) {
        case 'football': return 'สนามฟุตบอล 1 (สนามกลางอำเภอคลองหาด)';
        case 'volleyball': return 'สนามวอลเลย์บอล โรงเรียนบ้านคลองหาด';
        case 'takraw': return 'สนามเซปักตะกร้อ โรงเรียนบ้านคลองหาด';
        case 'petanque': return 'สนามเปตอง ลานอเนกประสงค์คลองหาด';
        case 'tug_of_war': return 'สนามหญ้ากลาง (ลานชักเย่อ) อำเภอคลองหาด';
        case 'running_50m': return 'ลู่วิ่ง 50 เมตร สนามกรีฑากลางคลองหาด';
        case 'running_80m': return 'ลู่วิ่ง 80 เมตร สนามกรีฑากลางคลองหาด';
        case 'running_100m': return 'ลู่วิ่ง 100 เมตร สนามกรีฑากลางคลองหาด';
        default: return 'สนามกีฬากลางอำเภอคลองหาด';
      }
    };

    // Get specialized referees for this sport
    const sportReferees = referees.filter(r => r.sportsSpecialty.includes(sport));
    const defaultHead = sportReferees.find(r => r.role === 'head_referee') || sportReferees[0] || referees[0];
    const defaultHead2 = sportReferees.find(r => r.role === 'head_referee' && r.id !== defaultHead?.id) || 
      sportReferees[1] || referees[1] || defaultHead;
    const defaultScorer = sportReferees.find(r => r.role === 'scorer') || 
      referees.find(r => r.role === 'scorer') || referees[3] || defaultHead;
    const defaultAssistant = sportReferees.find(r => 
      (r.role === 'assistant_1' || r.role === 'assistant_2' || r.role === 'umpire') && 
      r.id !== defaultHead?.id
    ) || referees[2] || sportReferees[1];

    // Build tournament rounds based on count
    if (shuffled.length >= 4) {
      // Semi 1
      newMatches.push({
        id: `match_gen_${Date.now()}_1`,
        matchNumber: matchCounter++,
        sport,
        category,
        stage: 'semi',
        team1Id: shuffled[0].id,
        team1Name: shuffled[0].name,
        team1School: shuffled[0].schoolName,
        team2Id: shuffled[1].id,
        team2Name: shuffled[1].name,
        team2School: shuffled[1].schoolName,
        venue: getSportVenue(sport),
        scheduledDate: '2026-09-03',
        scheduledTime: '09:00 น.',
        status: 'scheduled',
        score: { team1Score: 0, team2Score: 0, events: [] },
        referees: { head: defaultHead, scorer: defaultScorer },
        bracketPosition: { round: 2, matchIndex: 0 },
        notes: `รอบรองชนะเลิศ คู่ที่ 1`,
      });

      // Semi 2
      newMatches.push({
        id: `match_gen_${Date.now()}_2`,
        matchNumber: matchCounter++,
        sport,
        category,
        stage: 'semi',
        team1Id: shuffled[2].id,
        team1Name: shuffled[2].name,
        team1School: shuffled[2].schoolName,
        team2Id: shuffled[3].id,
        team2Name: shuffled[3].name,
        team2School: shuffled[3].schoolName,
        venue: getSportVenue(sport),
        scheduledDate: '2026-09-03',
        scheduledTime: '10:30 น.',
        status: 'scheduled',
        score: { team1Score: 0, team2Score: 0, events: [] },
        referees: { head: defaultHead2, scorer: defaultScorer },
        bracketPosition: { round: 2, matchIndex: 1 },
        notes: `รอบรองชนะเลิศ คู่ที่ 2`,
      });

      // Final Placeholder
      newMatches.push({
        id: `match_gen_${Date.now()}_final`,
        matchNumber: matchCounter++,
        sport,
        category,
        stage: 'final',
        team1Id: 'tbd_1',
        team1Name: 'ผู้ชนะคู่ที่ 1',
        team1School: 'รอผลรอบรองฯ',
        team2Id: 'tbd_2',
        team2Name: 'ผู้ชนะคู่ที่ 2',
        team2School: 'รอผลรอบรองฯ',
        venue: getSportVenue(sport),
        scheduledDate: '2026-09-03',
        scheduledTime: '14:00 น.',
        status: 'scheduled',
        score: { team1Score: 0, team2Score: 0, events: [] },
        referees: { head: defaultHead, assistants: defaultAssistant ? [defaultAssistant] : [], scorer: defaultScorer },
        bracketPosition: { round: 3, matchIndex: 0 },
        notes: `รอบชิงชนะเลิศ (ชิงเหรียญทอง)`,
      });
    } else {
      // Direct Final for 2-3 teams
      newMatches.push({
        id: `match_gen_${Date.now()}_direct_final`,
        matchNumber: matchCounter++,
        sport,
        category,
        stage: 'final',
        team1Id: shuffled[0].id,
        team1Name: shuffled[0].name,
        team1School: shuffled[0].schoolName,
        team2Id: shuffled[1].id,
        team2Name: shuffled[1].name,
        team2School: shuffled[1].schoolName,
        venue: getSportVenue(sport),
        scheduledDate: '2026-09-03',
        scheduledTime: '13:30 น.',
        status: 'scheduled',
        score: { team1Score: 0, team2Score: 0, events: [] },
        referees: { head: defaultHead, scorer: defaultScorer },
        bracketPosition: { round: 3, matchIndex: 0 },
        notes: `รอบชิงชนะเลิศโดยตรง`,
      });
    }

    setMatches(prev => [...newMatches, ...prev]);
    sendNotification(
      '🏆 จัดสายการแข่งขันสำเร็จ!',
      `สร้างผังการจับคู่การแข่งขันกีฬา ${SPORT_LABELS[sport]?.nameTh || sport} จำนวน ${newMatches.length} คู่ พร้อมแต่งตั้งกรรมการเรียบร้อยแล้ว`,
      'announcement'
    );
  };

  const deleteMatch = (matchId: string) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อลบคู่การแข่งขัน')) {
      return;
    }
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  // Announcements
  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'timestamp'>) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อออกประกาศข่าวสาร')) {
      return;
    }
    const dateStr = new Date().toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newAnn: Announcement = {
      ...annData,
      id: `ann_${Date.now()}`,
      timestamp: `${dateStr} น.`,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    sendNotification(`📢 ${newAnn.title}`, newAnn.content, 'announcement');
  };

  const deleteAnnouncement = (id: string) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อลบประกาศข่าวสาร')) {
      return;
    }
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Certificates
  const generateCertificate = (
    certData: Omit<Certificate, 'id' | 'certificateNumber' | 'issueDate' | 'verificationCode'>
  ): Certificate => {
    const certCount = certificates.length + 1;
    const certCode = `KHG-2026-${certData.sport.substring(0, 2).toUpperCase()}-${String(certCount).padStart(3, '0')}`;
    const newCert: Certificate = {
      ...certData,
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      certificateNumber: certCode,
      issueDate: '2 กันยายน 2569',
      verificationCode: `${certCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };
    setCertificates(prev => [newCert, ...prev]);
    return newCert;
  };

  // Batch generate certificates for match winners & runners-up athletes & coaches
  const batchGenerateCertificatesForMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.winnerTeamId) return;

    const winnerTeam = teams.find(t => t.id === match.winnerTeamId);
    const loserTeam = teams.find(t => t.id === (match.winnerTeamId === match.team1Id ? match.team2Id : match.team1Id));

    const newCerts: Certificate[] = [];

    if (winnerTeam) {
      // Winner Athletes -> Champion Gold
      winnerTeam.roster.forEach((ath, i) => {
        newCerts.push({
          id: `cert_auto_${Date.now()}_${i}`,
          certificateNumber: `KHG-2026-CHAMP-${String(certificates.length + i + 1).padStart(3, '0')}`,
          recipientName: ath.name,
          recipientRole: 'athlete',
          schoolName: winnerTeam.schoolName,
          sport: match.sport,
          category: match.category,
          awardRank: 'champion',
          issueDate: '2 กันยายน 2569',
          verificationCode: `VERIFY-CHAMP-${ath.studentId}`,
          signatoryTitle1: 'นายอำเภอคลองหาด',
          signatoryName1: 'นายธีรเดช สุขประเสริฐ',
          signatoryTitle2: 'ผู้อำนวยการ สพป.สระแก้ว เขต 1',
          signatoryName2: 'ดร.สมเกียรติ พัฒนวงศ์',
        });
      });

      // Winner Coach -> Honorary
      newCerts.push({
        id: `cert_auto_coach_${Date.now()}`,
        certificateNumber: `KHG-2026-COACH-${String(certificates.length + 50).padStart(3, '0')}`,
        recipientName: winnerTeam.coachName,
        recipientRole: 'coach',
        schoolName: winnerTeam.schoolName,
        sport: match.sport,
        category: match.category,
        awardRank: 'honorary',
        issueDate: '2 กันยายน 2569',
        verificationCode: `VERIFY-COACH-${winnerTeam.coachPhone.slice(-4)}`,
        signatoryTitle1: 'นายอำเภอคลองหาด',
        signatoryName1: 'นายธีรเดช สุขประเสริฐ',
        signatoryTitle2: 'ผู้อำนวยการ สพป.สระแก้ว เขต 1',
        signatoryName2: 'ดร.สมเกียรติ พัฒนวงศ์',
      });
    }

    if (loserTeam && match.stage === 'final') {
      // Runner up silver
      loserTeam.roster.forEach((ath, i) => {
        newCerts.push({
          id: `cert_auto_runner_${Date.now()}_${i}`,
          certificateNumber: `KHG-2026-RUNNER-${String(certificates.length + i + 20).padStart(3, '0')}`,
          recipientName: ath.name,
          recipientRole: 'athlete',
          schoolName: loserTeam.schoolName,
          sport: match.sport,
          category: match.category,
          awardRank: 'first_runner_up',
          issueDate: '2 กันยายน 2569',
          verificationCode: `VERIFY-RUNNER-${ath.studentId}`,
          signatoryTitle1: 'นายอำเภอคลองหาด',
          signatoryName1: 'นายธีรเดช สุขประเสริฐ',
          signatoryTitle2: 'ผู้อำนวยการ สพป.สระแก้ว เขต 1',
          signatoryName2: 'ดร.สมเกียรติ พัฒนวงศ์',
        });
      });
    }

    setCertificates(prev => [...newCerts, ...prev]);
    sendNotification(
      '📜 ออกเกียรติบัตรออนไลน์อัตโนมัติ!',
      `ระบบได้จัดทำเกียรติบัตรอิเล็กทรอนิกส์ให้กับทีมชนะเลิศและรองชนะเลิศจำนวน ${newCerts.length} ฉบับเรียบร้อยแล้ว`,
      'award'
    );
  };

  const deleteCertificate = (id: string) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
  };

  // Referee management
  const addReferee = (refereeData: Omit<Referee, 'id'>): Referee => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อลงทะเบียนผู้ตัดสินใหม่')) {
      return null as any;
    }
    const newRef: Referee = {
      ...refereeData,
      id: `ref_${Date.now()}`,
    };
    setReferees(prev => [...prev, newRef]);
    sendNotification(
      '⚖️ ลงทะเบียนผู้ตัดสินสำเร็จ',
      `เพิ่ม ${newRef.name} (${newRef.affiliation}) ลงในระบบทะเบียนผู้ตัดสินเรียบร้อยแล้ว`,
      'announcement'
    );
    return newRef;
  };

  const updateReferee = (updatedRef: Referee) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อแก้ไขข้อมูลผู้ตัดสิน')) {
      return;
    }
    setReferees(prev => prev.map(r => (r.id === updatedRef.id ? updatedRef : r)));

    // Synchronize referee data across all scheduled matches if they were assigned
    setMatches(prev =>
      prev.map(m => {
        let changed = false;
        const newReferees = { ...m.referees };
        if (newReferees.head?.id === updatedRef.id) {
          newReferees.head = updatedRef;
          changed = true;
        }
        if (newReferees.scorer?.id === updatedRef.id) {
          newReferees.scorer = updatedRef;
          changed = true;
        }
        if (newReferees.assistants && newReferees.assistants.some(a => a.id === updatedRef.id)) {
          newReferees.assistants = newReferees.assistants.map(a =>
            a.id === updatedRef.id ? updatedRef : a
          );
          changed = true;
        }
        return changed ? { ...m, referees: newReferees } : m;
      })
    );

    sendNotification(
      '✏️ อัปเดตข้อมูลผู้ตัดสินสำเร็จ',
      `แก้ไขข้อมูลและคุณวุฒิของ ${updatedRef.name} เรียบร้อยแล้ว`,
      'announcement'
    );
  };

  const deleteReferee = (id: string) => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อลบรายชื่อผู้ตัดสิน')) {
      return;
    }
    const target = referees.find(r => r.id === id);
    setReferees(prev => prev.filter(r => r.id !== id));
    if (target) {
      sendNotification(
        '🗑️ ลบรายชื่อผู้ตัดสิน',
        `นำรายชื่อ ${target.name} ออกจากระบบทะเบียนเรียบร้อยแล้ว`,
        'announcement'
      );
    }
  };

  const getRefereesBySport = (sport: SportType): Referee[] => {
    return referees.filter(r => r.sportsSpecialty.includes(sport));
  };

  const autoAssignRefereesBySport = (targetSport?: SportType): number => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อจัดผู้ตัดสินลงตารางแข่งขัน')) {
      return 0;
    }
    let count = 0;
    setMatches(prevMatches => {
      return prevMatches.map(match => {
        if (targetSport && match.sport !== targetSport) return match;

        const qualified = referees.filter(r => r.sportsSpecialty.includes(match.sport));
        if (qualified.length === 0) return match;

        const headRef =
          qualified.find(r => r.role === 'head_referee') || qualified[0];
        const scorerRef =
          qualified.find(r => r.role === 'scorer' && r.id !== headRef?.id) ||
          referees.find(r => r.role === 'scorer') ||
          qualified.find(r => r.id !== headRef?.id) ||
          headRef;
        const assistants = qualified.filter(
          r =>
            (r.role === 'assistant_1' || r.role === 'assistant_2' || r.role === 'umpire') &&
            r.id !== headRef?.id &&
            r.id !== scorerRef?.id
        );

        count++;
        return {
          ...match,
          referees: {
            head: headRef,
            assistants: assistants.length > 0 ? assistants.slice(0, 2) : (match.referees?.assistants || []),
            scorer: scorerRef || match.referees?.scorer,
          },
        };
      });
    });

    const sportLabel = targetSport ? SPORT_LABELS[targetSport]?.nameTh : 'ทุกชนิดกีฬา';
    sendNotification(
      '⚖️ จัดผู้ตัดสินลงตารางแข่งขันเรียบร้อย!',
      `มอบหมายรายชื่อกรรมการผู้ตัดสินและผู้บันทึกคะแนนตามชนิดกีฬา (${sportLabel}) ลงในโปรแกรมแข่งขันเรียบร้อยแล้ว`,
      'announcement'
    );
    soundEffects.playWhistle();
    return count;
  };

  // Reset to default
  const resetToDefaultData = () => {
    if (!requireGoogleAuth('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google เพื่อคืนค่าข้อมูลเริ่มต้น')) {
      return;
    }
    setSchools(INITIAL_SCHOOLS);
    setTeams(INITIAL_TEAMS);
    setMatches(INITIAL_MATCHES);
    setReferees(INITIAL_REFEREES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCertificates(INITIAL_CERTIFICATES);
    localStorage.clear();
    sendNotification('🔄 คืนค่าข้อมูลเริ่มต้นสำเร็จ', 'ระบบรีเซ็ตข้อมูลสู่ค่าเริ่มต้นของคลองหาดเกมส์', 'announcement');
  };

  // Simulation of Live Event for instant demonstration
  const simulateLiveEvent = () => {
    const liveMatch = matches.find(m => m.status === 'live');
    if (!liveMatch) {
      // Make first scheduled match live
      const firstScheduled = matches.find(m => m.status === 'scheduled');
      if (firstScheduled) {
        updateMatchStatus(firstScheduled.id, 'live');
      } else {
        alert('ไม่มีแมตช์ที่กำลังแข่งขันอยู่ ลองสร้างแมตช์ใหม่หรือเปลี่ยนสถานะเป็นสด');
      }
      return;
    }

    // Add score or event to live match
    const isTeam1 = Math.random() > 0.5;
    const currentScore1 = liveMatch.score.team1Score;
    const currentScore2 = liveMatch.score.team2Score;
    const newScore1 = isTeam1 ? currentScore1 + 1 : currentScore1;
    const newScore2 = !isTeam1 ? currentScore2 + 1 : currentScore2;

    const scoringTeamName = isTeam1 ? liveMatch.team1Name : liveMatch.team2Name;
    const currentMinute = Math.floor(Math.random() * 20) + 30;

    addMatchEvent(liveMatch.id, {
      timeMinute: currentMinute,
      teamId: isTeam1 ? liveMatch.team1Id : liveMatch.team2Id,
      type: liveMatch.sport === 'football' ? 'goal' : 'point',
      detail: `${scoringTeamName} ทำคะแนนได้อย่างยอดเยี่ยมในนาทีที่ ${currentMinute}!`,
      scorerName: isTeam1 ? 'นักกีฬาหมายเลข 10' : 'นักกีฬาหมายเลข 9',
    });

    updateMatchScore(liveMatch.id, newScore1, newScore2, `ครึ่งหลัง (นาทีที่ ${currentMinute})`);
  };

  return (
    <TournamentContext.Provider
      value={{
        schools,
        teams,
        matches,
        referees,
        announcements,
        notifications,
        certificates,
        activeTab,
        isAdmin,
        soundEnabled,
        activeToast,
        // Google Auth & Authorization
        currentUser,
        authLoading,
        isGoogleUser,
        canEdit,
        signInWithGoogle,
        signOutUser,
        requireGoogleAuth,
        showAuthModal,
        setShowAuthModal,
        authPromptReason,
        firestoreSynced,
        setActiveTab,
        setIsAdmin,
        setSoundEnabled,
        closeToast,
        registerTeam,
        updateTeam,
        updateTeamStatus,
        deleteTeam,
        createMatch,
        updateMatchScore,
        addMatchEvent,
        updateMatchStatus,
        assignReferees,
        autoGenerateBracket,
        deleteMatch,
        addAnnouncement,
        deleteAnnouncement,
        sendNotification,
        markNotificationRead,
        markAllNotificationsRead,
        generateCertificate,
        batchGenerateCertificatesForMatch,
        deleteCertificate,
        addReferee,
        updateReferee,
        deleteReferee,
        getRefereesBySport,
        autoAssignRefereesBySport,
        resetToDefaultData,
        simulateLiveEvent,
        syncToGoogleSheets,
        isGoogleSheetsConnected,
        autoSyncToSheets,
        setAutoSyncToSheets,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
