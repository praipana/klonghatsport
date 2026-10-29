// Google Sheets & Drive API Sync Client for KlongHat Games 2026
// Uses Google Workspace OAuth client token directly in browser

export interface GoogleSheetsSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetsCreated: string[];
  lastSyncedAt: string;
}

const STORAGE_KEY_SHEET_INFO = 'klonghat_gworkspace_sheet_info';
const STORAGE_KEY_AUTO_SYNC = 'klonghat_gworkspace_auto_sync';

export class GoogleWorkspaceService {
  // Access token cached in-memory only per security guidelines
  private static token: string | null = null;
  private static spreadsheetId: string | null = null;
  private static spreadsheetUrl: string | null = null;
  private static autoSyncEnabled: boolean = localStorage.getItem(STORAGE_KEY_AUTO_SYNC) !== 'false';

  static init() {
    const saved = localStorage.getItem(STORAGE_KEY_SHEET_INFO);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.spreadsheetId = parsed.spreadsheetId;
        this.spreadsheetUrl = parsed.spreadsheetUrl;
      } catch (e) {
        console.error('Failed to parse saved sheet info', e);
      }
    }
    const autoSyncSaved = localStorage.getItem(STORAGE_KEY_AUTO_SYNC);
    this.autoSyncEnabled = autoSyncSaved !== 'false';
  }

  static isAutoSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  static setAutoSyncEnabled(enabled: boolean) {
    this.autoSyncEnabled = enabled;
    localStorage.setItem(STORAGE_KEY_AUTO_SYNC, enabled ? 'true' : 'false');
  }

  static isConnected(): boolean {
    return !!this.getToken() && !!this.spreadsheetId;
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }

  static getSavedSheetInfo() {
    return {
      spreadsheetId: this.spreadsheetId,
      spreadsheetUrl: this.spreadsheetUrl,
      driveUrl: this.spreadsheetId ? `https://drive.google.com/open?id=${this.spreadsheetId}` : null,
    };
  }

  static setToken(token: string | null) {
    this.token = token;
  }

  static getToken(): string | null {
    return this.token;
  }

  static clearAuth() {
    this.token = null;
  }

  /**
   * Request Google OAuth Token via Google Identity Services
   */
  static async requestAccessToken(clientId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // If token already present and valid, resolve
      if (this.token) {
        return resolve(this.token);
      }

      // Check if google accounts client is available
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.oauth2) {
        // Provide user friendly fallback instructions or mock prompt if GSI script not yet loaded
        const manualToken = window.prompt(
          'Google Workspace OAuth: ระบบพร้อมเชื่อมต่อ Google Sheets กรุณากรอกหรือยืนยัน Access Token (หรือกดยกเลิกเพื่อเชื่อมต่ออัตโนมัติ):'
        );
        if (manualToken) {
          this.setToken(manualToken);
          return resolve(manualToken);
        }
        return reject(new Error('Google Identity Services script not loaded.'));
      }

      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId || '1061094260707-applet.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.error) {
              reject(response);
              return;
            }
            this.setToken(response.access_token);
            resolve(response.access_token);
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Create or update full Tournament Database in Google Sheets
   */
  static async syncTournamentToGoogleSheets(data: {
    schools: any[];
    teams: any[];
    matches: any[];
    referees: any[];
    announcements: any[];
    certificates: any[];
  }): Promise<GoogleSheetsSyncResult> {
    let token = this.getToken();

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    let currentSpreadsheetId = this.spreadsheetId;
    let spreadsheetUrl = this.spreadsheetUrl;

    const sheetTitles = [
      '📊 ตารางเหรียญและสถิติ',
      '⚽ รายชื่อทีมและนักกีฬา',
      '⏱️ สรุปคู่แข่งขันและผลการแข่งขัน',
      '🏆 ทะเบียนเกียรติบัตรออนไลน์',
      '👨‍⚖️ คณะกรรมการและผู้ตัดสิน',
      '📢 ข่าวและประกาศทางการ',
    ];

    // If no spreadsheet exists yet, create one
    if (!currentSpreadsheetId) {
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          properties: {
            title: 'KlongHat Games 2026 - ฐานข้อมูลกีฬานักเรียนอำเภอคลองหาด (สพป.สระแก้ว เขต 1)',
          },
          sheets: sheetTitles.map(title => ({
            properties: { title },
          })),
        }),
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || `สร้าง Google Sheet ไม่สำเร็จ (${createResponse.status})`);
      }

      const created = await createResponse.json();
      currentSpreadsheetId = created.spreadsheetId;
      spreadsheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`;
      this.spreadsheetId = currentSpreadsheetId;
      this.spreadsheetUrl = spreadsheetUrl;

      localStorage.setItem(
        STORAGE_KEY_SHEET_INFO,
        JSON.stringify({ spreadsheetId: currentSpreadsheetId, spreadsheetUrl })
      );
    } else {
      // Ensure existing spreadsheet has all required sheets
      try {
        const metaRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${currentSpreadsheetId}?fields=sheets.properties.title`,
          { headers }
        );
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const existingTitles = (meta.sheets || []).map((s: any) => s.properties?.title);
          const missingSheets = sheetTitles.filter(title => !existingTitles.includes(title));

          if (missingSheets.length > 0) {
            await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${currentSpreadsheetId}:batchUpdate`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  requests: missingSheets.map(title => ({
                    addSheet: { properties: { title } },
                  })),
                }),
              }
            );
          }
        }
      } catch (checkErr) {
        console.warn('Could not verify existing sheets:', checkErr);
      }
    }

    // 1. Prepare School Standings data
    const schoolRows = [
      ['อันดับ', 'ชื่อโรงเรียน', 'ชื่อย่อ', 'เหรียญทอง 🥇', 'เหรียญเงิน 🥈', 'เหรียญทองแดง 🥉', 'รวมเหรียญ', 'คะแนนสะสมรวม ⚡', 'จำนวนนักกีฬา (คน)', 'ผู้อำนวยการ/ผู้บริหาร'],
      ...data.schools
        .sort((a, b) => b.gold !== a.gold ? b.gold - a.gold : b.totalPoints - a.totalPoints)
        .map((s, idx) => [
          idx + 1,
          s.name,
          s.shortName || s.name,
          s.gold,
          s.silver,
          s.bronze,
          s.gold + s.silver + s.bronze,
          s.totalPoints,
          s.totalAthletes,
          s.principalName || '-',
        ]),
    ];

    // 2. Prepare Teams & Athletes data
    const teamRows = [
      ['รหัสทีม', 'ชื่อทีม', 'โรงเรียน', 'ชนิดกีฬา', 'ระดับชั้น', 'ผู้ฝึกสอน (โค้ช)', 'เบอร์ติดต่อ', 'สถานะทีม', 'จำนวนนักกีฬา', 'รายชื่อนักกีฬาในทีม (พร้อมเลขประจำตัว/เบอร์เสื้อ)'],
      ...data.teams.map(t => [
        t.id,
        t.name,
        t.schoolName,
        t.sport,
        t.category,
        t.coachName,
        t.coachPhone,
        t.status === 'approved' ? 'อนุมัติแล้ว' : t.status,
        t.roster?.length || 0,
        (t.roster || []).map((a: any) => `${a.name} (${a.grade || ''} เบอร์ ${a.jerseyNumber || '-'})`).join('; '),
      ]),
    ];

    // 3. Prepare Matches data
    const matchRows = [
      ['คู่ที่', 'ชนิดกีฬา', 'ระดับชั้น', 'รอบการแข่งขัน', 'ทีม 1', 'โรงเรียนทีม 1', 'คะแนน 1', 'คะแนน 2', 'ทีม 2', 'โรงเรียนทีม 2', 'สถานะ', 'ผู้ชนะ', 'สถานที่แข่งขัน', 'วันเวลาที่แข่ง', 'ผู้ตัดสินหลัก'],
      ...data.matches.map(m => [
        m.matchNumber,
        m.sport,
        m.category,
        m.stage,
        m.team1Name,
        m.team1School,
        m.score.team1Score,
        m.score.team2Score,
        m.team2Name,
        m.team2School,
        m.status === 'live' ? '🔴 กำลังแข่งขันสด' : m.status === 'finished' ? '🏆 จบการแข่งขัน' : '⏳ รอแข่งขัน',
        m.winnerTeamId === m.team1Id ? m.team1Name : m.winnerTeamId === m.team2Id ? m.team2Name : '-',
        m.venue,
        `${m.scheduledDate} ${m.scheduledTime}`,
        m.referees?.head?.name || 'คณะกรรมการผู้ตัดสิน',
      ]),
    ];

    // 4. Prepare Live Timeline Events data
    const timelineRows = [
      ['คู่ที่', 'ชนิดกีฬา', 'คู่แข่งขัน', 'นาทีที่เกิดเหตุการณ์', 'ประเภทเหตุการณ์', 'ทีมที่ได้แต้ม/โดนลงโทษ', 'รายละเอียดเหตุการณ์', 'ผู้ทำคะแนน/ผู้เล่น', 'สถานะแมตช์'],
    ];

    data.matches.forEach(m => {
      if (m.score?.events && m.score.events.length > 0) {
        m.score.events.forEach((ev: any) => {
          const teamName = ev.teamId === m.team1Id ? m.team1Name : ev.teamId === m.team2Id ? m.team2Name : 'ส่วนกลาง';
          timelineRows.push([
            m.matchNumber,
            m.sport,
            `${m.team1Name} VS ${m.team2Name}`,
            `${ev.timeMinute}'`,
            ev.type,
            teamName,
            ev.detail,
            ev.scorerName || '-',
            m.status,
          ]);
        });
      }
    });

    // 5. Prepare Certificates data
    const certificateRows = [
      ['เลขที่เกียรติบัตร', 'รหัสตรวจสอบ (Verification Code)', 'ชื่อผู้รับเกียรติบัตร', 'โรงเรียน/สถาบัน', 'ชนิดกีฬา', 'ระดับชั้น', 'รางวัลที่ได้รับ', 'วันที่ออกเกียรติบัตร', 'ผู้ลงนาม 1 (นายอำเภอ)', 'ผู้ลงนาม 2 (ผอ.สพป.สระแก้ว เขต 1)'],
      ...data.certificates.map(c => [
        c.certificateNumber,
        c.verificationCode,
        c.recipientName,
        c.schoolName,
        c.sport,
        c.category,
        c.awardRank,
        c.issueDate,
        `${c.signatoryName1} (${c.signatoryTitle1})`,
        `${c.signatoryName2} (${c.signatoryTitle2})`,
      ]),
    ];

    // 6. Prepare Referees data
    const refereeRows = [
      ['รหัสผู้ตัดสิน', 'ชื่อ-นามสกุล', 'หน้าที่/บทบาท', 'สังกัดหน่วยงาน', 'เบอร์ติดต่อ', 'กีฬาที่รับผิดชอบ', 'เลขที่ใบอนุญาต/วุฒิบัตร', 'ประสบการณ์ (ปี)', 'หมายเหตุ'],
      ...data.referees.map(r => [
        r.id,
        r.name,
        r.role === 'head_referee' ? 'หัวหน้าผู้ตัดสิน (ผู้ตัดสินหลัก)' :
        r.role === 'assistant_1' ? 'ผู้ช่วยผู้ตัดสินที่ 1 (กำกับเส้น)' :
        r.role === 'assistant_2' ? 'ผู้ช่วยผู้ตัดสินที่ 2 (กรรมการโต๊ะ)' :
        r.role === 'scorer' ? 'ผู้บันทึกคะแนนและเวลา' : 'กรรมการชี้ขาด',
        r.affiliation,
        r.phone,
        (r.sportsSpecialty || []).join(', '),
        r.licenseId || '-',
        r.experienceYears || '-',
        r.notes || '-',
      ]),
    ];

    // 7. Prepare Announcements data
    const announcementRows = [
      ['รหัสประกาศ', 'หัวข้อข่าว/ประกาศ', 'เนื้อหารายละเอียด', 'หมวดหมู่', 'ผู้ออกประกาศ', 'วันเวลา'],
      ...data.announcements.map(a => [
        a.id,
        a.title,
        a.content,
        a.category,
        a.author,
        a.timestamp,
      ]),
    ];

    // Batch update all sheets
    const updatePayload = {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: `'📊 ตารางเหรียญและสถิติ'!A1`, values: schoolRows },
        { range: `'⚽ รายชื่อทีมและนักกีฬา'!A1`, values: teamRows },
        { range: `'⏱️ สรุปคู่แข่งขันและผลการแข่งขัน'!A1`, values: matchRows },
        { range: `'🏆 ทะเบียนเกียรติบัตรออนไลน์'!A1`, values: certificateRows },
        { range: `'👨‍⚖️ คณะกรรมการและผู้ตัดสิน'!A1`, values: refereeRows },
        { range: `'📢 ข่าวและประกาศทางการ'!A1`, values: announcementRows },
      ],
    };

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${currentSpreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(updatePayload),
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json().catch(() => ({}));
      throw new Error(err.error?.message || `อัปเดตข้อมูลไปยัง Google Sheets ไม่สำเร็จ (${updateResponse.status})`);
    }

    const lastSyncedAt = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      spreadsheetId: currentSpreadsheetId,
      spreadsheetUrl: spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`,
      sheetsCreated: sheetTitles,
      lastSyncedAt,
    };
  }
}

GoogleWorkspaceService.init();
