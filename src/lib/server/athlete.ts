import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  aiBreakdowns,
  athleteGoals,
  athleteMetrics,
  bookings,
  coachFeedback,
  coachProfiles,
  messageThreads,
  messages,
  studentAthletes,
  timeSlots,
  users,
} from "@/db/schema";
import type {
  AiBreakdown,
  AthleteProgress,
  Booking,
  HeatCell,
  NextSlot,
  ProgressGoal,
  ProgressMetric,
  ReportCard,
  ThreadMessage,
  User,
} from "@/types";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Metrics we prefer as the two Home headline numbers, in priority order. */
const HEADLINE_PRIORITY = ["exit_velo", "fb_velo", "pop_time", "bat_speed", "hip_shoulder_sep"];

function buildMetrics(rows: (typeof athleteMetrics.$inferSelect)[]): ProgressMetric[] {
  const byMetric = new Map<string, (typeof athleteMetrics.$inferSelect)[]>();
  for (const r of rows) {
    const arr = byMetric.get(r.metric) ?? [];
    arr.push(r);
    byMetric.set(r.metric, arr);
  }
  const metrics: ProgressMetric[] = [];
  for (const [metric, series] of byMetric) {
    series.sort((a, b) => (a.recordedAt < b.recordedAt ? -1 : 1));
    const latest = series[series.length - 1];
    const previous = series.length > 1 ? series[series.length - 2] : null;
    metrics.push({
      metric,
      label: latest.label,
      unit: latest.unit,
      latest: latest.value,
      previous: previous ? previous.value : null,
      delta: previous ? Number((latest.value - previous.value).toFixed(2)) : null,
      series: series.map((s) => ({ date: s.recordedAt, value: s.value })),
    });
  }
  return metrics;
}

function pickHeadline(metrics: ProgressMetric[]): ProgressMetric[] {
  const ordered = [...metrics].sort((a, b) => {
    const ai = HEADLINE_PRIORITY.indexOf(a.metric);
    const bi = HEADLINE_PRIORITY.indexOf(b.metric);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return ordered.slice(0, 2);
}

function mapGoal(row: typeof athleteGoals.$inferSelect): ProgressGoal {
  const span = row.target - row.baseline;
  const pctRaw = span === 0 ? 1 : (row.current - row.baseline) / span;
  return {
    id: row.id,
    metric: row.metric,
    label: row.label,
    unit: row.unit,
    position: row.position,
    baseline: row.baseline,
    current: row.current,
    target: row.target,
    priorityRank: row.priorityRank,
    pct: Math.max(0, Math.min(1, Number(pctRaw.toFixed(2)))),
  };
}

function mapBooking(row: typeof bookings.$inferSelect): Booking {
  return {
    id: row.id,
    coachId: row.coachId,
    coachName: row.coachName,
    athleteId: row.athleteId,
    athleteName: row.athleteName,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    format: row.format,
    packageType: row.packageType,
    price: row.price,
    status: row.status,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapBreakdown(row: typeof aiBreakdowns.$inferSelect, athleteName?: string): AiBreakdown {
  return {
    id: row.id,
    athleteId: row.athleteId,
    athleteName,
    coachId: row.coachId,
    coachName: row.coachName,
    title: row.title,
    videoUrl: row.videoUrl,
    posterUrl: row.posterUrl,
    status: row.status,
    processedSeconds: row.processedSeconds,
    pose: row.pose,
    flags: row.flags,
    metrics: row.metrics,
    summary: row.summary,
    threadId: row.threadId,
    sentToCoach: row.sentToCoach,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Build a ~7-week training heat map from real booking + metric activity dates. */
function buildHeatmap(activityDates: string[]): HeatCell[] {
  const counts = new Map<string, number>();
  for (const d of activityDates) counts.set(d, (counts.get(d) ?? 0) + 1);
  const cells: HeatCell[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 48);
  for (let i = 0; i < 49; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const activity = counts.get(key) ?? 0;
    // Light baseline texture on weekdays, boosted by real activity
    const weekday = d.getDay() !== 0 && d.getDay() !== 6;
    let level = activity > 0 ? Math.min(4, 2 + activity) : weekday && (i * 3) % 5 === 0 ? 1 : 0;
    if (activity > 0) level = Math.min(4, level);
    cells.push({ date: key, level });
  }
  return cells;
}

async function reportCardsForStudentIds(studentIds: string[]): Promise<ReportCard[]> {
  if (studentIds.length === 0) return [];
  const db = getDb();
  const rows = await db
    .select({ fb: coachFeedback, coachName: coachProfiles.name })
    .from(coachFeedback)
    .leftJoin(coachProfiles, eq(coachFeedback.coachId, coachProfiles.id))
    .where(inArray(coachFeedback.studentId, studentIds))
    .orderBy(desc(coachFeedback.createdAt));
  return rows.map((r) => ({
    id: r.fb.id,
    coachName: r.coachName ?? "Coach",
    studentName: r.fb.studentName,
    subject: r.fb.subject,
    body: r.fb.body,
    createdAt: r.fb.createdAt.toISOString(),
    aiAttached: r.fb.aiAttached,
  }));
}

export async function getAthleteProgress(athleteUserId: string): Promise<AthleteProgress | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();

  const [userRow] = await db.select().from(users).where(eq(users.id, athleteUserId)).limit(1);
  if (!userRow) return null;

  const [metricRows, goalRows, bookingRows, students, breakdownRows] = await Promise.all([
    db.select().from(athleteMetrics).where(eq(athleteMetrics.athleteId, athleteUserId)),
    db.select().from(athleteGoals).where(eq(athleteGoals.athleteId, athleteUserId)).orderBy(asc(athleteGoals.priorityRank)),
    db.select().from(bookings).where(eq(bookings.athleteId, athleteUserId)),
    db.select().from(studentAthletes).where(eq(studentAthletes.userId, athleteUserId)),
    db.select().from(aiBreakdowns).where(eq(aiBreakdowns.athleteId, athleteUserId)).orderBy(desc(aiBreakdowns.createdAt)),
  ]);

  const metrics = buildMetrics(metricRows);
  const goals = goalRows.map(mapGoal);
  const reportCards = await reportCardsForStudentIds(students.map((s) => s.id));

  const today = todayStr();
  const upcoming = bookingRows
    .filter((b) => b.status !== "cancelled" && b.date >= today)
    .sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? -1 : 1));
  const nextSession = upcoming[0] ? mapBooking(upcoming[0]) : null;

  const activityDates = [
    ...bookingRows.map((b) => b.date),
    ...metricRows.map((m) => m.recordedAt),
  ];

  return {
    athleteId: athleteUserId,
    name: userRow.name,
    headline: pickHeadline(metrics),
    metrics,
    goals,
    reportCards,
    heatmap: buildHeatmap(activityDates),
    nextSession,
    latestBreakdown: breakdownRows.find((b) => b.status === "ready")
      ? mapBreakdown(breakdownRows.find((b) => b.status === "ready")!, userRow.name)
      : null,
  };
}

export async function getBreakdownsForAthlete(athleteUserId: string): Promise<AiBreakdown[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(aiBreakdowns)
    .where(eq(aiBreakdowns.athleteId, athleteUserId))
    .orderBy(desc(aiBreakdowns.createdAt));
  return rows.map((r) => mapBreakdown(r));
}

export async function getBreakdownById(id: string): Promise<AiBreakdown | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const [row] = await db.select().from(aiBreakdowns).where(eq(aiBreakdowns.id, id)).limit(1);
  if (!row) return null;
  const [athlete] = await db.select().from(users).where(eq(users.id, row.athleteId)).limit(1);
  return mapBreakdown(row, athlete?.name);
}

async function resolveCoachId(user: User): Promise<string | null> {
  if (user.role !== "coach") return null;
  const db = getDb();
  const [row] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, user.id)).limit(1);
  return row?.id ?? null;
}

/** Threads for a user + full message timeline with booking-derived system chips merged in. */
export async function getMessagesForUser(user: User): Promise<{
  threads: (typeof messageThreads.$inferSelect)[];
  messages: ThreadMessage[];
}> {
  if (!isDatabaseConfigured()) return { threads: [], messages: [] };
  const db = getDb();

  let threads: (typeof messageThreads.$inferSelect)[];
  if (user.role === "coach") {
    const coachId = await resolveCoachId(user);
    if (!coachId) return { threads: [], messages: [] };
    threads = await db.select().from(messageThreads).where(eq(messageThreads.coachId, coachId));
  } else {
    threads = await db.select().from(messageThreads).where(eq(messageThreads.athleteId, user.id));
  }
  threads.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  const threadIds = threads.map((t) => t.id);
  if (threadIds.length === 0) return { threads, messages: [] };

  const rows = await db
    .select()
    .from(messages)
    .where(inArray(messages.threadId, threadIds))
    .orderBy(asc(messages.createdAt));

  const real: ThreadMessage[] = rows.map((r) => ({
    id: r.id,
    threadId: r.threadId,
    senderId: r.senderId,
    senderName: r.senderName,
    senderNameKey: (r.senderNameKey as "you" | undefined) ?? undefined,
    body: r.body,
    kind: (r.kind as ThreadMessage["kind"]) ?? "text",
    attachmentUrl: r.attachmentUrl ?? undefined,
    bookingId: r.bookingId ?? undefined,
    breakdownId: r.breakdownId ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));

  // Derive system chips from real bookings between each thread's coach & athlete.
  const systemMsgs: ThreadMessage[] = [];
  for (const t of threads) {
    const rel = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.coachId, t.coachId), eq(bookings.athleteId, t.athleteId)));
    for (const b of rel) {
      if (b.status === "confirmed" || b.status === "completed") {
        systemMsgs.push({
          id: `sys-${b.id}`,
          threadId: t.id,
          senderId: "system",
          senderName: "system",
          body: {
            en: `Booking ${b.status} · ${b.date} ${b.startTime}`,
            ja: `予約が${b.status === "completed" ? "完了" : "確定"}しました · ${b.date} ${b.startTime}`,
            es: `Reserva ${b.status === "completed" ? "completada" : "confirmada"} · ${b.date} ${b.startTime}`,
          },
          kind: "system",
          bookingId: b.id,
          createdAt: b.createdAt.toISOString(),
        });
      }
    }
  }

  const all = [...real, ...systemMsgs].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return { threads, messages: all };
}

export async function sendMessage(
  user: User,
  input: { threadId: string; body: string; kind?: "text" | "clip"; attachmentUrl?: string; breakdownId?: string },
): Promise<ThreadMessage> {
  const db = getDb();
  const id = `m-${randomBytes(6).toString("hex")}`;
  const createdAt = new Date();
  const senderName = user.role === "athlete" ? "you" : user.name;
  const row = {
    id,
    threadId: input.threadId,
    senderId: user.id,
    senderName,
    senderNameKey: user.role === "athlete" ? ("you" as const) : null,
    body: input.body,
    kind: input.kind ?? "text",
    attachmentUrl: input.attachmentUrl ?? null,
    breakdownId: input.breakdownId ?? null,
    createdAt,
  };
  await db.insert(messages).values(row);
  await db
    .update(messageThreads)
    .set({ lastMessage: { en: input.body, ja: input.body, es: input.body }, updatedAt: createdAt })
    .where(eq(messageThreads.id, input.threadId));
  return {
    id,
    threadId: input.threadId,
    senderId: user.id,
    senderName,
    senderNameKey: user.role === "athlete" ? "you" : undefined,
    body: input.body,
    kind: input.kind ?? "text",
    attachmentUrl: input.attachmentUrl,
    breakdownId: input.breakdownId,
    createdAt: createdAt.toISOString(),
  };
}

/** Share a breakdown report into the athlete↔coach thread (creates a clip message). */
export async function sendBreakdownToThread(
  breakdownId: string,
  user: User,
): Promise<{ threadId: string; message: ThreadMessage } | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const [bd] = await db.select().from(aiBreakdowns).where(eq(aiBreakdowns.id, breakdownId)).limit(1);
  if (!bd) return null;

  let threadId = bd.threadId ?? undefined;
  if (!threadId) {
    const [t] = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.athleteId, bd.athleteId))
      .limit(1);
    threadId = t?.id;
  }
  if (!threadId) return null;

  const message = await sendMessage(user, {
    threadId,
    body: `Shared AI breakdown: ${bd.title}`,
    kind: "clip",
    attachmentUrl: bd.videoUrl,
    breakdownId: bd.id,
  });
  await db
    .update(aiBreakdowns)
    .set({ sentToCoach: true, threadId })
    .where(eq(aiBreakdowns.id, breakdownId));
  return { threadId, message };
}

export async function getFeedbackForCoach(coachId: string): Promise<ReportCard[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select({ fb: coachFeedback, coachName: coachProfiles.name })
    .from(coachFeedback)
    .leftJoin(coachProfiles, eq(coachFeedback.coachId, coachProfiles.id))
    .where(eq(coachFeedback.coachId, coachId))
    .orderBy(desc(coachFeedback.createdAt));
  return rows.map((r) => ({
    id: r.fb.id,
    coachName: r.coachName ?? "Coach",
    studentName: r.fb.studentName,
    subject: r.fb.subject,
    body: r.fb.body,
    createdAt: r.fb.createdAt.toISOString(),
    aiAttached: r.fb.aiAttached,
  }));
}

export async function createFeedback(
  user: User,
  input: { studentId: string; subject: string; body: string; aiAttached?: boolean },
): Promise<ReportCard | null> {
  if (!isDatabaseConfigured()) return null;
  const coachId = await resolveCoachId(user);
  if (!coachId) return null;
  const db = getDb();
  const [student] = await db.select().from(studentAthletes).where(eq(studentAthletes.id, input.studentId)).limit(1);
  if (!student) return null;
  const id = `f-${randomBytes(6).toString("hex")}`;
  const createdAt = new Date();
  await db.insert(coachFeedback).values({
    id,
    coachId,
    studentId: input.studentId,
    studentName: student.name,
    subject: input.subject,
    body: input.body,
    createdAt,
    aiAttached: input.aiAttached ?? false,
  });
  return {
    id,
    coachName: user.name,
    studentName: student.name,
    subject: input.subject,
    body: input.body,
    createdAt: createdAt.toISOString(),
    aiAttached: input.aiAttached ?? false,
  };
}

/** Earliest available future slot for each requested coach. */
export async function getNextSlots(coachIds: string[]): Promise<Record<string, NextSlot>> {
  if (!isDatabaseConfigured() || coachIds.length === 0) return {};
  const db = getDb();
  const today = todayStr();
  const rows = await db
    .select()
    .from(timeSlots)
    .where(and(inArray(timeSlots.coachId, coachIds), eq(timeSlots.available, true)))
    .orderBy(asc(timeSlots.date), asc(timeSlots.startTime));
  const out: Record<string, NextSlot> = {};
  for (const r of rows) {
    if (r.date < today) continue;
    if (out[r.coachId]) continue;
    out[r.coachId] = { coachId: r.coachId, date: r.date, startTime: r.startTime, endTime: r.endTime };
  }
  return out;
}

/** Progress for a coach viewing one of their athletes (auth-guarded by student link). */
export async function getAthleteProgressForCoach(
  user: User,
  studentId: string,
): Promise<AthleteProgress | null> {
  if (!isDatabaseConfigured()) return null;
  const coachId = await resolveCoachId(user);
  if (!coachId) return null;
  const db = getDb();
  const [student] = await db
    .select()
    .from(studentAthletes)
    .where(and(eq(studentAthletes.id, studentId), eq(studentAthletes.coachId, coachId)))
    .limit(1);
  if (!student || !student.userId) return null;
  return getAthleteProgress(student.userId);
}
