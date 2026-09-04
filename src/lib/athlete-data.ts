/**
 * Demo seed data for athlete performance (metrics, goals) and AI breakdowns.
 * Keyed by athlete USER id (u-athlete-1..4) so the same records power both the
 * athlete Progress tab and the coach athlete-detail mirror.
 */

export interface AthleteMetricSeed {
  id: string;
  athleteId: string;
  metric: string;
  label: string;
  unit: string;
  value: number;
  recordedAt: string;
}

export interface AthleteGoalSeed {
  id: string;
  athleteId: string;
  metric: string;
  label: string;
  unit: string;
  position: string;
  baseline: number;
  current: number;
  target: number;
  priorityRank: number;
}

export interface AiBreakdownSeed {
  id: string;
  athleteId: string;
  coachId: string | null;
  coachName: string | null;
  title: string;
  videoUrl: string;
  posterUrl: string;
  status: string;
  processedSeconds: number;
  pose: { ref: number[][]; user: number[][] };
  flags: { label: string; severity: "warn" | "ok"; note: string }[];
  metrics: { label: string; value: string; delta?: string }[];
  summary: string;
  threadId: string | null;
  sentToCoach: boolean;
  createdAt: string;
}

/** Links coach student records (s1..s4) to athlete user accounts (u-athlete-1..4). */
export const studentUserLinks: Record<string, string> = {
  s1: "u-athlete-1",
  s2: "u-athlete-2",
  s3: "u-athlete-3",
  s4: "u-athlete-4",
};

const WEEKS = [
  "2026-05-25",
  "2026-06-08",
  "2026-06-22",
  "2026-07-06",
  "2026-07-20",
  "2026-08-03",
];

function series(
  athleteId: string,
  metric: string,
  label: string,
  unit: string,
  values: number[],
): AthleteMetricSeed[] {
  return values.map((value, i) => ({
    id: `m-${athleteId}-${metric}-${i}`,
    athleteId,
    metric,
    label,
    unit,
    value,
    recordedAt: WEEKS[i] ?? WEEKS[WEEKS.length - 1],
  }));
}

export const athleteMetricSeed: AthleteMetricSeed[] = [
  // Ethan Park — OF (primary demo athlete)
  ...series("u-athlete-1", "exit_velo", "Exit velocity", "mph", [78, 79, 81, 82, 83, 84]),
  ...series("u-athlete-1", "bat_speed", "Bat speed", "mph", [64, 65, 66, 67, 67, 68]),
  // Sofia Reyes — P
  ...series("u-athlete-2", "fb_velo", "Fastball velo", "mph", [60, 61, 62, 62, 63, 64]),
  ...series("u-athlete-2", "hip_shoulder_sep", "Hip-shoulder sep", "deg", [30, 32, 34, 36, 38, 40]),
  // Kenji Nakamura — SS
  ...series("u-athlete-3", "exit_velo", "Exit velocity", "mph", [52, 54, 55, 56, 57, 58]),
  ...series("u-athlete-3", "sixty_time", "60-yd dash", "s", [8.1, 8.0, 7.9, 7.9, 7.8, 7.8]),
  // Maya Chen — C
  ...series("u-athlete-4", "pop_time", "Pop time", "s", [2.15, 2.12, 2.1, 2.08, 2.06, 2.05]),
  ...series("u-athlete-4", "exit_velo", "Exit velocity", "mph", [70, 71, 72, 73, 73, 74]),
];

export const athleteGoalSeed: AthleteGoalSeed[] = [
  // Ethan — OF
  { id: "g-a1-1", athleteId: "u-athlete-1", metric: "exit_velo", label: "Exit velocity", unit: "mph", position: "OF", baseline: 78, current: 84, target: 88, priorityRank: 1 },
  { id: "g-a1-2", athleteId: "u-athlete-1", metric: "attack_angle", label: "Attack angle", unit: "deg", position: "OF", baseline: 3, current: 8, target: 12, priorityRank: 2 },
  { id: "g-a1-3", athleteId: "u-athlete-1", metric: "sixty_time", label: "60-yd dash", unit: "s", position: "OF", baseline: 7.4, current: 7.1, target: 6.9, priorityRank: 3 },
  // Sofia — P
  { id: "g-a2-1", athleteId: "u-athlete-2", metric: "fb_velo", label: "Fastball velo", unit: "mph", position: "P", baseline: 60, current: 64, target: 68, priorityRank: 1 },
  { id: "g-a2-2", athleteId: "u-athlete-2", metric: "hip_shoulder_sep", label: "Hip-shoulder sep", unit: "deg", position: "P", baseline: 30, current: 40, target: 45, priorityRank: 2 },
  { id: "g-a2-3", athleteId: "u-athlete-2", metric: "command", label: "Strike %", unit: "%", position: "P", baseline: 58, current: 64, target: 70, priorityRank: 3 },
  // Kenji — SS
  { id: "g-a3-1", athleteId: "u-athlete-3", metric: "swing_length", label: "Swing length", unit: "in", position: "SS", baseline: 34, current: 30, target: 27, priorityRank: 1 },
  { id: "g-a3-2", athleteId: "u-athlete-3", metric: "first_step", label: "First-step quickness", unit: "s", position: "SS", baseline: 0.62, current: 0.55, target: 0.5, priorityRank: 2 },
  { id: "g-a3-3", athleteId: "u-athlete-3", metric: "exit_velo", label: "Exit velocity", unit: "mph", position: "SS", baseline: 52, current: 58, target: 62, priorityRank: 3 },
  // Maya — C
  { id: "g-a4-1", athleteId: "u-athlete-4", metric: "pop_time", label: "Pop time", unit: "s", position: "C", baseline: 2.15, current: 2.05, target: 1.98, priorityRank: 1 },
  { id: "g-a4-2", athleteId: "u-athlete-4", metric: "transfer", label: "Transfer speed", unit: "s", position: "C", baseline: 0.85, current: 0.78, target: 0.72, priorityRank: 2 },
  { id: "g-a4-3", athleteId: "u-athlete-4", metric: "framing", label: "Framing +runs", unit: "", position: "C", baseline: 2, current: 6, target: 10, priorityRank: 3 },
];

/**
 * Stick-figure skeleton joints, normalized 0..1 within the video frame.
 * Order: head, neck, L/R shoulder, L/R elbow, L/R wrist, L/R hip, L/R knee, L/R ankle.
 */
const REF_POSE = [
  [0.52, 0.16], [0.52, 0.26], [0.44, 0.28], [0.6, 0.28],
  [0.4, 0.42], [0.64, 0.42], [0.42, 0.54], [0.62, 0.54],
  [0.46, 0.56], [0.58, 0.56], [0.45, 0.74], [0.59, 0.74],
  [0.45, 0.92], [0.59, 0.92],
];
const USER_POSE = [
  [0.5, 0.18], [0.5, 0.28], [0.42, 0.3], [0.58, 0.3],
  [0.36, 0.45], [0.62, 0.46], [0.38, 0.58], [0.6, 0.58],
  [0.44, 0.58], [0.56, 0.58], [0.43, 0.76], [0.57, 0.76],
  [0.42, 0.93], [0.58, 0.93],
];

const POSTER_SWING = "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80";
const POSTER_PITCH = "https://images.unsplash.com/photo-1508344928928-7528d0e3b3a5?w=800&q=80";

export const aiBreakdownSeed: AiBreakdownSeed[] = [
  {
    id: "bd-a1-1",
    athleteId: "u-athlete-1",
    coachId: "c1",
    coachName: "Shota Tanaka",
    title: "Swing breakdown — outside fastball",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: POSTER_SWING,
    status: "ready",
    processedSeconds: 44,
    pose: { ref: REF_POSE, user: USER_POSE },
    flags: [
      { label: "Attack angle", severity: "warn", note: "Shallow on outside pitch — barrel below reference path." },
      { label: "Lower-half drive", severity: "ok", note: "Strong hip drive, matches reference model." },
      { label: "Head stability", severity: "ok", note: "Minimal drift through contact." },
    ],
    metrics: [
      { label: "Exit velo", value: "84 mph", delta: "+2" },
      { label: "Attack angle", value: "8°", delta: "+1" },
      { label: "Bat speed", value: "68 mph", delta: "+1" },
    ],
    summary:
      "Bat speed is trending up and the lower half looks great. Attack angle stays shallow on the outside pitch — keep the barrel above the ball to match the reference path.",
    threadId: "t1",
    sentToCoach: false,
    createdAt: "2026-08-03T15:10:00",
  },
  {
    id: "bd-a2-1",
    athleteId: "u-athlete-2",
    coachId: null,
    coachName: null,
    title: "Delivery breakdown — glove side",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: POSTER_PITCH,
    status: "ready",
    processedSeconds: 39,
    pose: { ref: REF_POSE, user: USER_POSE },
    flags: [
      { label: "Hip-shoulder sep", severity: "ok", note: "Separation improved to 40° — on plan." },
      { label: "Glove-side finish", severity: "warn", note: "Glove drifts early — brace the front side." },
    ],
    metrics: [
      { label: "FB velo", value: "64 mph", delta: "+1" },
      { label: "Hip-shoulder sep", value: "40°", delta: "+2" },
    ],
    summary:
      "Separation is where we want it. Front-side brace is leaking on the glove side — hold the finish to keep velo climbing.",
    threadId: null,
    sentToCoach: false,
    createdAt: "2026-07-27T12:30:00",
  },
];

export interface GoalSuggestion {
  metric: string;
  label: string;
  unit: string;
  target: number;
}

const GOALS_BY_POSITION: Record<string, GoalSuggestion[]> = {
  P: [
    { metric: "fb_velo", label: "Fastball velo", unit: "mph", target: 70 },
    { metric: "hip_shoulder_sep", label: "Hip-shoulder sep", unit: "deg", target: 45 },
    { metric: "command", label: "Strike %", unit: "%", target: 70 },
  ],
  C: [
    { metric: "pop_time", label: "Pop time", unit: "s", target: 1.95 },
    { metric: "transfer", label: "Transfer speed", unit: "s", target: 0.72 },
    { metric: "framing", label: "Framing +runs", unit: "", target: 10 },
  ],
  OF: [
    { metric: "exit_velo", label: "Exit velocity", unit: "mph", target: 90 },
    { metric: "attack_angle", label: "Attack angle", unit: "deg", target: 12 },
    { metric: "sixty_time", label: "60-yd dash", unit: "s", target: 6.8 },
  ],
  INF: [
    { metric: "exit_velo", label: "Exit velocity", unit: "mph", target: 88 },
    { metric: "first_step", label: "First-step quickness", unit: "s", target: 0.5 },
    { metric: "sixty_time", label: "60-yd dash", unit: "s", target: 6.9 },
  ],
};

const DEFAULT_GOALS: GoalSuggestion[] = [
  { metric: "exit_velo", label: "Exit velocity", unit: "mph", target: 88 },
  { metric: "bat_speed", label: "Bat speed", unit: "mph", target: 72 },
  { metric: "sixty_time", label: "60-yd dash", unit: "s", target: 6.9 },
];

/** Position-aware starter goals for athlete onboarding. */
export function goalsForPosition(position: string): GoalSuggestion[] {
  const p = position.toUpperCase();
  if (p.includes("P")) return GOALS_BY_POSITION.P;
  if (p.includes("C")) return GOALS_BY_POSITION.C;
  if (p.includes("OF") || p.includes("CF") || p.includes("RF") || p.includes("LF"))
    return GOALS_BY_POSITION.OF;
  if (p.includes("SS") || p.includes("1B") || p.includes("2B") || p.includes("3B") || p.includes("IF"))
    return GOALS_BY_POSITION.INF;
  return DEFAULT_GOALS;
}

/** Which breakdown to surface as the athlete's "ready" toast on Home. */
export function latestBreakdownFor(athleteId: string): AiBreakdownSeed | undefined {
  return aiBreakdownSeed
    .filter((b) => b.athleteId === athleteId && b.status === "ready")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
}
