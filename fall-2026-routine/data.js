/** Fall 2026 weekly routine — SMC campus only (no off-campus internship) */
export const ROUTINE_META = {
  term: "Fall 2026",
  units: 18,
  campus: "Santa Monica College",
  focusEn: "Grades · LA Water Atlas · Club · SMC only",
  focusJa: "成績 · LA Water Atlas · クラブ · SMC中心",
};

export const PILLARS = [
  {
    en: "All A's — STAT & GEOG 5 come first",
    ja: "全A — STAT・GEOG5を最優先",
  },
  {
    en: "LA Water Atlas through GIS 26 + Dr. Liu",
    ja: "GIS26とLiu教授経由でAtlasを進める",
  },
  {
    en: "One club on campus · 3–4 hr/week max",
    ja: "学内クラブ1つ · 週3–4時間まで",
  },
];

export const CATEGORIES = {
  class: { color: "#4f8cff", labelEn: "Class (on campus)", labelJa: "対面授業" },
  study: { color: "#e8a838", labelEn: "Study / grades", labelJa: "学習・成績" },
  atlas: { color: "#2ec4b6", labelEn: "LA Water Atlas / GIS 26", labelJa: "LA Water Atlas・GIS26" },
  club: { color: "#a78bfa", labelEn: "Club", labelJa: "クラブ" },
  online: { color: "#38bdf8", labelEn: "Online module", labelJa: "オンライン" },
  buffer: { color: "#64748b", labelEn: "Buffer / transition", labelJa: "移動・休憩" },
  flex: { color: "#6a8f72", labelEn: "Flex / campus", labelJa: "調整・学内" },
  workout: { color: "#f472b6", labelEn: "Workout", labelJa: "ワークアウト" },
  rest: { color: "#334155", labelEn: "Rest", labelJa: "休息" },
};

/** day: 0=Mon … 6=Sun; times as "HH:MM" 24h */
export const ROUTINE_BLOCKS = [
  // Monday — lab + STAT
  { day: 0, start: "08:00", end: "11:30", cat: "study", titleEn: "Deep study — STAT", titleJa: "集中学習 — STAT", noteEn: "Problem sets before campus", noteJa: "登校前に問題演習" },
  { day: 0, start: "11:30", end: "12:30", cat: "buffer", titleEn: "Lunch + commute", titleJa: "昼食・移動" },
  { day: 0, start: "12:45", end: "15:50", cat: "class", titleEn: "GEOG 5 lab", titleJa: "GEOG 5 ラボ", noteEn: "Fritschle · 4 units", noteJa: "4単位" },
  { day: 0, start: "15:50", end: "17:00", cat: "buffer", titleEn: "Review lab notes", titleJa: "ラボ復習・休憩" },
  { day: 0, start: "17:15", end: "19:20", cat: "class", titleEn: "STAT C1000", titleJa: "STAT C1000", noteEn: "Martinez · 4 units", noteJa: "4単位" },
  { day: 0, start: "19:30", end: "20:30", cat: "online", titleEn: "GEOG 5 online (~1 hr)", titleJa: "GEOG 5 オンライン" },
  { day: 0, start: "20:30", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト", noteEn: "Gym · run · or home routine", noteJa: "ジム・ラン・自宅トレ" },

  // Tuesday — stacked afternoon
  { day: 1, start: "08:00", end: "11:30", cat: "atlas", titleEn: "LA Water Atlas / GIS 26", titleJa: "LA Water Atlas・GIS26", noteEn: "Uninterrupted home block", noteJa: "集中作業ブロック" },
  { day: 1, start: "11:30", end: "12:30", cat: "buffer", titleEn: "Lunch + commute", titleJa: "昼食・移動" },
  { day: 1, start: "12:45", end: "14:05", cat: "class", titleEn: "ARTH C1200", titleJa: "ARTH C1200" },
  { day: 1, start: "14:05", end: "14:15", cat: "buffer", titleEn: "Buffer", titleJa: "休憩" },
  { day: 1, start: "14:15", end: "15:35", cat: "class", titleEn: "SOCIOL 1", titleJa: "SOCIOL 1" },
  { day: 1, start: "15:35", end: "15:45", cat: "buffer", titleEn: "Change for PE", titleJa: "PE準備" },
  { day: 1, start: "15:45", end: "17:05", cat: "class", titleEn: "KIN PE 34D", titleJa: "KIN PE 34D", noteEn: "Physical reset", noteJa: "体力リセット" },
  { day: 1, start: "17:30", end: "18:30", cat: "online", titleEn: "ARTH online + SOCIOL reading", titleJa: "ARTHオンライン + SOCIOL" },
  { day: 1, start: "18:30", end: "20:30", cat: "rest", titleEn: "Light evening · dinner", titleJa: "軽い夜 · 夕食" },
  { day: 1, start: "20:30", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト", noteEn: "Light after KIN PE day", noteJa: "PE日は軽めでも可" },

  // Wednesday — lightest day (no commute obligations)
  { day: 2, start: "08:00", end: "12:00", cat: "atlas", titleEn: "Atlas deep work", titleJa: "Atlas 集中", noteEn: "Platform · maps · GIS 26", noteJa: "プラットフォーム・GIS26" },
  { day: 2, start: "12:00", end: "13:00", cat: "buffer", titleEn: "Lunch", titleJa: "昼食" },
  { day: 2, start: "13:00", end: "16:00", cat: "flex", titleEn: "Campus — library / tutoring / Liu office hours", titleJa: "学内 — 図書館・TA・Liuオフィスアワー" },
  { day: 2, start: "16:00", end: "17:15", cat: "buffer", titleEn: "Buffer before STAT", titleJa: "STAT前の休憩" },
  { day: 2, start: "17:15", end: "19:20", cat: "class", titleEn: "STAT C1000", titleJa: "STAT C1000" },
  { day: 2, start: "19:30", end: "21:00", cat: "study", titleEn: "STAT homework", titleJa: "STAT 課題", noteEn: "Right after class", noteJa: "授業直後" },
  { day: 2, start: "21:00", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト", noteEn: "After STAT homework", noteJa: "STAT課題の後" },

  // Thursday
  { day: 3, start: "08:00", end: "12:00", cat: "study", titleEn: "GEOG 5 + STAT study", titleJa: "GEOG5 + STAT 学習" },
  { day: 3, start: "12:00", end: "14:00", cat: "buffer", titleEn: "Lunch + commute buffer", titleJa: "昼食・移動" },
  { day: 3, start: "14:15", end: "15:35", cat: "class", titleEn: "SOCIOL 1", titleJa: "SOCIOL 1" },
  { day: 3, start: "15:35", end: "15:45", cat: "buffer", titleEn: "Buffer", titleJa: "休憩" },
  { day: 3, start: "15:45", end: "17:05", cat: "class", titleEn: "KIN PE 34D", titleJa: "KIN PE 34D" },
  { day: 3, start: "17:30", end: "19:00", cat: "study", titleEn: "SOCIOL assignments", titleJa: "SOCIOL 課題" },
  { day: 3, start: "19:00", end: "20:00", cat: "club", titleEn: "Club meeting window", titleJa: "クラブ（平日枠）", optional: true },
  { day: 3, start: "20:00", end: "20:30", cat: "rest", titleEn: "Dinner / decompress", titleJa: "夕食・クールダウン" },
  { day: 3, start: "20:30", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト", noteEn: "Light after KIN PE day", noteJa: "PE日は軽めでも可" },

  // Friday — open day, no off-campus work
  { day: 4, start: "08:00", end: "12:00", cat: "atlas", titleEn: "Atlas sprint", titleJa: "Atlas スプリント", noteEn: "Biggest weekly block", noteJa: "週最大のプロジェクト枠" },
  { day: 4, start: "12:00", end: "13:00", cat: "buffer", titleEn: "Lunch", titleJa: "昼食" },
  { day: 4, start: "13:00", end: "15:00", cat: "flex", titleEn: "Counseling / tutoring / catch-up", titleJa: "カウンセリング・TA・追い込み" },
  { day: 4, start: "15:00", end: "17:00", cat: "club", titleEn: "Club activity", titleJa: "クラブ活動", noteEn: "3–4 hr/week total", noteJa: "週3–4時間上限" },
  { day: 4, start: "17:00", end: "20:30", cat: "rest", titleEn: "Off · dinner", titleJa: "オフ · 夕食" },
  { day: 4, start: "20:30", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト" },

  // Saturday
  { day: 5, start: "10:00", end: "13:00", cat: "flex", titleEn: "Online modules / Atlas catch-up", titleJa: "オンライン / Atlas追い込み" },
  { day: 5, start: "13:00", end: "17:00", cat: "club", titleEn: "Club events (if scheduled)", titleJa: "クラブイベント", optional: true },
  { day: 5, start: "17:00", end: "20:30", cat: "rest", titleEn: "Rest", titleJa: "休息" },
  { day: 5, start: "20:30", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト" },

  // Sunday
  { day: 6, start: "10:00", end: "11:00", cat: "flex", titleEn: "Week planning", titleJa: "週の計画" },
  { day: 6, start: "11:00", end: "13:00", cat: "study", titleEn: "Light review", titleJa: "軽い復習" },
  { day: 6, start: "13:00", end: "20:30", cat: "rest", titleEn: "Rest — prep for Monday", titleJa: "休息 — 月曜準備" },
  { day: 6, start: "20:30", end: "22:00", cat: "workout", titleEn: "Workout", titleJa: "ワークアウト" },
];

export const COURSES = [
  { code: "STAT C1000", units: 4, priority: 1, scheduleEn: "Mon & Wed 5:15–7:20 PM", scheduleJa: "月・水 17:15–19:20" },
  { code: "GEOG 5", units: 4, priority: 2, scheduleEn: "Mon 12:45–3:50 PM + online", scheduleJa: "月 12:45–15:50 + オンライン" },
  { code: "GIS 26", units: 3, priority: 3, scheduleEn: "Online · tied to Atlas", scheduleJa: "オンライン · Atlas連動" },
  { code: "SOCIOL 1", units: 3, priority: 4, scheduleEn: "Tue & Thu 2:15–3:35 PM", scheduleJa: "火・木 14:15–15:35" },
  { code: "ARTH C1200", units: 3, priority: 5, scheduleEn: "Tue 12:45–2:05 PM + online", scheduleJa: "火 12:45–14:05 + オンライン" },
  { code: "KIN PE 34D", units: 1, priority: 6, scheduleEn: "Tue & Thu 3:45–5:05 PM", scheduleJa: "火・木 15:45–17:05" },
];

export const GIS_DAY_ROADMAP = [
  { phase: "0", weeks: "Aug 25 – Sep 7", en: "Lock MVP · deploy URL · brief Liu", ja: "MVP確定 · 公開URL · Liu報告" },
  { phase: "1", weeks: "Sep 8 – Oct 5", en: "Sources · 2 dossiers · scenario v1 · Liu demo", ja: "水源 · ドシエ2 · シナリオ · Liuデモ" },
  { phase: "2", weeks: "Oct 6 – Oct 26", en: "Midterm mode · one-pager · reference prep", ja: "中間試験期 · 1枚資料 · 推薦準備" },
  { phase: "3", weeks: "Oct 27 – Nov 16", en: "Poster · QR · rehearse · freeze features", ja: "ポスター · QR · リハーサル · 機能凍結" },
  { phase: "4", weeks: "Nov 17", en: "GIS Day — demo · network · 48hr follow-up", ja: "GIS Day — デモ · ネットワーク · フォロー" },
];

export const MILESTONES = [
  { weeks: "1–3", en: "Phase 0 — rhythm + deploy public URL", ja: "Phase 0 — リズム + 公開URL" },
  { weeks: "4–6", en: "Phase 1 — Sources + dossiers + scenario", ja: "Phase 1 — 水源・ドシエ・シナリオ" },
  { weeks: "7–9", en: "Phase 2 — midterms; one-pager draft", ja: "Phase 2 — 中間試験 · 1枚資料" },
  { weeks: "10–12", en: "Phase 3 — GIS Day sprint (Nov 17)", ja: "Phase 3 — GIS Day直前" },
  { weeks: "13–16", en: "Post-GIS Day — Liu follow-up · finals", ja: "GIS Day後 — Liuフォロー · 期末" },
];

export const GRID = { startHour: 7, endHour: 22 };
