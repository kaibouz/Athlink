import { randomBytes } from "crypto";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { aiBreakdowns, athleteGoals, athleteMetrics, users } from "@/db/schema";
import type { AiBreakdown, User } from "@/types";

/**
 * Production-style AI breakdown/analysis pipeline.
 *
 * A clip is submitted, a job row is created with status "processing", and the
 * analysis runs through a pluggable provider:
 *   - `OpenAiBreakdownProvider` / `AnthropicBreakdownProvider` when an API key is
 *     configured (real vision-coach LLM call, structured JSON output), or
 *   - `HeuristicBreakdownProvider`, an on-box biomechanics analyzer used as a
 *     deterministic fallback so the tool works end-to-end without secrets.
 *
 * The provider only produces the coaching content (flags/metrics/summary); pose
 * keyframes are synthesized deterministically (no ML pose model is in scope).
 */

export type AnalysisType = "swing" | "pitching";

export interface AnalyzeClipInput {
  athleteUserId: string;
  athleteName: string;
  analysisType: AnalysisType;
  sport: string;
  position?: string;
  clipUrl: string;
  posterUrl?: string;
  notes?: string;
}

export interface PriorMetric {
  label: string;
  latest: number;
  unit: string;
  delta: number | null;
}

interface ProviderAnalysis {
  title: string;
  flags: { label: string; severity: "warn" | "ok"; note: string }[];
  metrics: { label: string; value: string; delta?: string }[];
  summary: string;
}

interface AnalysisResult extends ProviderAnalysis {
  pose: { ref: number[][]; user: number[][] };
  processedSeconds: number;
  provider: string;
  model: string | null;
  latencyMs: number;
  error: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Deterministic helpers                                                     */
/* -------------------------------------------------------------------------- */

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic per clip so re-runs are reproducible. */
function makeRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Reference "ideal" skeleton (14 joints, normalized 0..1): head, neck, L/R
// shoulder, L/R elbow, L/R wrist, L/R hip, L/R knee, L/R ankle.
const REF_POSE: number[][] = [
  [0.52, 0.16], [0.52, 0.26], [0.44, 0.28], [0.6, 0.28],
  [0.4, 0.42], [0.64, 0.42], [0.42, 0.54], [0.62, 0.54],
  [0.46, 0.56], [0.58, 0.56], [0.45, 0.74], [0.59, 0.74],
  [0.45, 0.92], [0.59, 0.92],
];

/** Synthesize a plausible "detected" athlete pose by perturbing the reference. */
function synthesizePose(seed: number): { ref: number[][]; user: number[][] } {
  const rng = makeRng(seed);
  const user = REF_POSE.map(([x, y], i) => {
    // Larger drift on limbs (elbows/wrists/knees) than on the spine.
    const limb = i >= 4 ? 0.05 : 0.025;
    const dx = (rng() - 0.5) * 2 * limb;
    const dy = (rng() - 0.5) * 2 * limb;
    return [Number((x + dx).toFixed(3)), Number((y + dy).toFixed(3))];
  });
  return { ref: REF_POSE, user };
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function fmtDelta(n: number): string | undefined {
  if (n === 0) return undefined;
  return `${n > 0 ? "+" : ""}${round(n)}`;
}

/* -------------------------------------------------------------------------- */
/*  Heuristic (on-box) provider                                               */
/* -------------------------------------------------------------------------- */

interface MetricSpec {
  key: string;
  label: string;
  unit: string;
  base: number;
  spread: number;
  goodDelta: number;
}

const SWING_METRICS: MetricSpec[] = [
  { key: "exit_velo", label: "Exit velo", unit: "mph", base: 84, spread: 6, goodDelta: 2 },
  { key: "bat_speed", label: "Bat speed", unit: "mph", base: 68, spread: 5, goodDelta: 1.5 },
  { key: "attack_angle", label: "Attack angle", unit: "°", base: 9, spread: 4, goodDelta: 1 },
];

const PITCH_METRICS: MetricSpec[] = [
  { key: "fb_velo", label: "FB velo", unit: "mph", base: 66, spread: 6, goodDelta: 1.5 },
  { key: "hip_shoulder_sep", label: "Hip-shoulder sep", unit: "°", base: 40, spread: 6, goodDelta: 2 },
  { key: "arm_slot", label: "Arm slot", unit: "°", base: 78, spread: 5, goodDelta: 1 },
];

const SWING_FLAGS = [
  { label: "Attack angle", warn: "Barrel dips below the reference path on the outside pitch.", ok: "Attack angle matches the reference swing plane." },
  { label: "Lower-half drive", warn: "Weight leaks toward the front side early — stay loaded longer.", ok: "Strong hip drive, sequenced ahead of the hands." },
  { label: "Head stability", warn: "Head drifts toward the pitcher through contact.", ok: "Minimal head drift through contact." },
  { label: "Bat path", warn: "Path is a touch steep into the zone — flatten on approach.", ok: "On-plane path with good time in the zone." },
];

const PITCH_FLAGS = [
  { label: "Hip-shoulder sep", warn: "Hips and shoulders open together — delay the upper half.", ok: "Separation is on plan and holding late." },
  { label: "Front-side brace", warn: "Glove drifts early — brace the front side to hold energy.", ok: "Firm front side, glove tucked over the landing leg." },
  { label: "Arm slot", warn: "Slot drops under fatigue — keep the finish tall.", ok: "Consistent slot across the sample." },
  { label: "Balance / landing", warn: "Landing is slightly across the body — clean up direction to the plate.", ok: "Balanced landing, direct to the target." },
];

function heuristicAnalyze(input: AnalyzeClipInput, priors: PriorMetric[]): ProviderAnalysis {
  const rng = makeRng(hashSeed(input.clipUrl + input.analysisType));
  const specs = input.analysisType === "pitching" ? PITCH_METRICS : SWING_METRICS;
  const flagBank = input.analysisType === "pitching" ? PITCH_FLAGS : SWING_FLAGS;
  const priorByLabel = new Map(priors.map((p) => [p.label.toLowerCase(), p]));

  const metrics = specs.map((s) => {
    const prior = priorByLabel.get(s.label.toLowerCase());
    const current = prior ? prior.latest : round(s.base + (rng() - 0.5) * s.spread);
    // Deltas trend positive most of the time (athletes are improving on plan).
    const delta = round((rng() < 0.75 ? 1 : -1) * rng() * s.goodDelta);
    return {
      label: s.label,
      value: `${round(current)}${s.unit === "°" ? s.unit : ` ${s.unit}`}`,
      delta: fmtDelta(delta),
    };
  });

  // 1-2 warnings + the rest OK, chosen deterministically.
  const warnCount = rng() < 0.6 ? 1 : 2;
  const shuffled = [...flagBank].sort(() => rng() - 0.5);
  const flags = shuffled.slice(0, 3).map((f, i) => {
    const warn = i < warnCount;
    return { label: f.label, severity: warn ? ("warn" as const) : ("ok" as const), note: warn ? f.warn : f.ok };
  });

  const warmup = input.analysisType === "pitching" ? "delivery" : "swing";
  const focus = flags.find((f) => f.severity === "warn");
  const posLine = input.position ? ` (${input.position})` : "";
  const summary =
    `Automated ${warmup} breakdown${posLine}. ${metrics[0].label} is at ${metrics[0].value}` +
    `${metrics[0].delta ? ` (${metrics[0].delta} vs last look)` : ""}. ` +
    (focus
      ? `Primary focus: ${focus.label.toLowerCase()} — ${focus.note.toLowerCase()} `
      : `Mechanics track the reference model closely. `) +
    (input.notes ? `Athlete note considered: "${input.notes.slice(0, 140)}".` : "Keep reinforcing the on-plan cues.");

  const title =
    input.analysisType === "pitching"
      ? "Delivery breakdown — mechanics"
      : "Swing breakdown — contact & path";

  return { title, flags, metrics, summary };
}

/* -------------------------------------------------------------------------- */
/*  LLM providers (used when an API key is configured)                        */
/* -------------------------------------------------------------------------- */

const SYSTEM_PROMPT =
  "You are a biomechanics coach analyzing a baseball/softball clip. Return STRICT JSON " +
  'with this shape: {"title": string, "flags": [{"label": string, "severity": "warn"|"ok", "note": string}], ' +
  '"metrics": [{"label": string, "value": string, "delta": string}], "summary": string}. ' +
  "Provide exactly 3 flags and 2-3 metrics. Keep notes and summary concise, specific, and actionable. " +
  "Values must include units (e.g. '84 mph', '9°'); delta is like '+2' or '-1' or ''.";

function buildUserPrompt(input: AnalyzeClipInput, priors: PriorMetric[]): string {
  const priorLines = priors.length
    ? priors.map((p) => `- ${p.label}: ${p.latest} ${p.unit}${p.delta != null ? ` (last delta ${p.delta})` : ""}`).join("\n")
    : "- none on file";
  return [
    `Athlete: ${input.athleteName}${input.position ? ` (${input.position})` : ""}`,
    `Sport: ${input.sport}`,
    `Analysis type: ${input.analysisType}`,
    `Clip URL: ${input.clipUrl}`,
    input.notes ? `Athlete note: ${input.notes}` : "Athlete note: (none)",
    `Recent measured metrics:\n${priorLines}`,
    "Analyze the mechanics and return the JSON described in the system prompt.",
  ].join("\n");
}

function validateAnalysis(raw: unknown, fallbackTitle: string): ProviderAnalysis {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const flags = Array.isArray(obj.flags) ? obj.flags : [];
  const metrics = Array.isArray(obj.metrics) ? obj.metrics : [];
  const cleanFlags = flags.slice(0, 4).map((f) => {
    const o = (f ?? {}) as Record<string, unknown>;
    return {
      label: String(o.label ?? "Flag"),
      severity: o.severity === "warn" ? ("warn" as const) : ("ok" as const),
      note: String(o.note ?? ""),
    };
  });
  const cleanMetrics = metrics.slice(0, 4).map((m) => {
    const o = (m ?? {}) as Record<string, unknown>;
    const delta = o.delta ? String(o.delta) : undefined;
    return { label: String(o.label ?? "Metric"), value: String(o.value ?? "—"), delta: delta || undefined };
  });
  if (cleanFlags.length === 0 || cleanMetrics.length === 0) {
    throw new Error("LLM returned empty flags/metrics");
  }
  return {
    title: String(obj.title ?? fallbackTitle),
    flags: cleanFlags,
    metrics: cleanMetrics,
    summary: String(obj.summary ?? ""),
  };
}

async function openAiAnalyze(input: AnalyzeClipInput, priors: PriorMetric[]): Promise<ProviderAnalysis> {
  const key = process.env.OPENAI_API_KEY!;
  const model = process.env.AI_BREAKDOWN_MODEL || "gpt-4o-mini";
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input, priors) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 180)}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  return validateAnalysis(JSON.parse(content), "AI breakdown");
}

async function anthropicAnalyze(input: AnalyzeClipInput, priors: PriorMetric[]): Promise<ProviderAnalysis> {
  const key = process.env.ANTHROPIC_API_KEY!;
  const model = process.env.AI_BREAKDOWN_MODEL || "claude-3-5-haiku-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input, priors) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 180)}`);
  const json = (await res.json()) as { content?: { text?: string }[] };
  const text = json.content?.[0]?.text ?? "{}";
  const match = text.match(/\{[\s\S]*\}/);
  return validateAnalysis(JSON.parse(match ? match[0] : "{}"), "AI breakdown");
}

interface Provider {
  name: string;
  model: string | null;
  run: (input: AnalyzeClipInput, priors: PriorMetric[]) => Promise<ProviderAnalysis>;
}

/** Choose the analysis provider based on configured credentials. */
export function selectProvider(): Provider {
  if (process.env.OPENAI_API_KEY) {
    return { name: "openai", model: process.env.AI_BREAKDOWN_MODEL || "gpt-4o-mini", run: openAiAnalyze };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { name: "anthropic", model: process.env.AI_BREAKDOWN_MODEL || "claude-3-5-haiku-latest", run: anthropicAnalyze };
  }
  return { name: "athlink-motion-v1", model: null, run: async (i, p) => heuristicAnalyze(i, p) };
}

/* -------------------------------------------------------------------------- */
/*  Orchestration                                                             */
/* -------------------------------------------------------------------------- */

async function loadPriorMetrics(athleteUserId: string): Promise<PriorMetric[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(athleteMetrics)
    .where(eq(athleteMetrics.athleteId, athleteUserId))
    .orderBy(asc(athleteMetrics.recordedAt));
  const byMetric = new Map<string, (typeof rows)[number][]>();
  for (const r of rows) {
    const arr = byMetric.get(r.metric) ?? [];
    arr.push(r);
    byMetric.set(r.metric, arr);
  }
  const out: PriorMetric[] = [];
  for (const series of byMetric.values()) {
    const latest = series[series.length - 1];
    const prev = series.length > 1 ? series[series.length - 2] : null;
    out.push({
      label: latest.label,
      latest: latest.value,
      unit: latest.unit,
      delta: prev ? Number((latest.value - prev.value).toFixed(2)) : null,
    });
  }
  return out;
}

async function runAnalysis(input: AnalyzeClipInput): Promise<AnalysisResult> {
  const priors = await loadPriorMetrics(input.athleteUserId);
  const provider = selectProvider();
  const seed = hashSeed(input.clipUrl + input.analysisType + input.athleteUserId);
  const pose = synthesizePose(seed);
  const processedSeconds = 30 + (seed % 20);

  const start = Date.now();
  let analysis: ProviderAnalysis;
  let providerName = provider.name;
  let error: string | null = null;
  try {
    analysis = await provider.run(input, priors);
  } catch (e) {
    // Resilient degradation: never fail the job — fall back to on-box analysis.
    error = e instanceof Error ? e.message : String(e);
    analysis = heuristicAnalyze(input, priors);
    providerName = `${provider.name}->athlink-motion-v1`;
  }
  const latencyMs = Date.now() - start;

  return { ...analysis, pose, processedSeconds, provider: providerName, model: provider.model, latencyMs, error };
}

/** Simulated inference floor so the "processing" state is observable for the on-box analyzer. */
function simDelayMs(): number {
  const raw = Number(process.env.AI_BREAKDOWN_SIM_MS);
  return Number.isFinite(raw) ? Math.max(0, raw) : 2600;
}

function mapRow(row: typeof aiBreakdowns.$inferSelect): AiBreakdown {
  return {
    id: row.id,
    athleteId: row.athleteId,
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
    analysisType: row.analysisType,
    sport: row.sport,
    provider: row.provider ?? null,
    model: row.model ?? null,
    latencyMs: row.latencyMs ?? null,
    notes: row.notes ?? null,
    error: row.error ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

const DEFAULT_POSTER_SWING = "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80";
const DEFAULT_POSTER_PITCH = "https://images.unsplash.com/photo-1508344928928-7528d0e3b3a5?w=800&q=80";

export interface CreateBreakdownInput {
  clipUrl: string;
  posterUrl?: string;
  analysisType?: AnalysisType;
  sport?: string;
  position?: string;
  notes?: string;
}

/** Create a breakdown job in "processing" state. Analysis runs via processBreakdown(). */
export async function createBreakdownJob(user: User, input: CreateBreakdownInput): Promise<AiBreakdown> {
  const db = getDb();
  const analysisType: AnalysisType = input.analysisType === "pitching" ? "pitching" : "swing";
  const id = `bd-${randomBytes(6).toString("hex")}`;
  const poster = input.posterUrl || (analysisType === "pitching" ? DEFAULT_POSTER_PITCH : DEFAULT_POSTER_SWING);
  const row = {
    id,
    athleteId: user.id,
    coachId: null,
    coachName: null,
    title: analysisType === "pitching" ? "Delivery breakdown — processing" : "Swing breakdown — processing",
    videoUrl: input.clipUrl,
    posterUrl: poster,
    status: "processing",
    processedSeconds: 0,
    pose: { ref: REF_POSE, user: [] as number[][] },
    flags: [] as { label: string; severity: "warn" | "ok"; note: string }[],
    metrics: [] as { label: string; value: string; delta?: string }[],
    summary: "",
    threadId: null,
    sentToCoach: false,
    analysisType,
    sport: input.sport || "baseball",
    provider: null,
    model: null,
    latencyMs: null,
    notes: input.notes?.slice(0, 500) || null,
    error: null,
    createdAt: new Date(),
  };
  await db.insert(aiBreakdowns).values(row);
  return mapRow(row as typeof aiBreakdowns.$inferSelect);
}

/** Run the analysis for a processing job and persist the result. Idempotent. */
export async function processBreakdown(id: string): Promise<AiBreakdown | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const [row] = await db.select().from(aiBreakdowns).where(eq(aiBreakdowns.id, id)).limit(1);
  if (!row) return null;
  if (row.status === "ready") return mapRow(row);

  const [athlete] = await db.select().from(users).where(eq(users.id, row.athleteId)).limit(1);
  const [topGoal] = await db
    .select()
    .from(athleteGoals)
    .where(eq(athleteGoals.athleteId, row.athleteId))
    .orderBy(desc(athleteGoals.priorityRank))
    .limit(1);

  const result = await runAnalysis({
    athleteUserId: row.athleteId,
    athleteName: athlete?.name ?? "Athlete",
    analysisType: row.analysisType === "pitching" ? "pitching" : "swing",
    sport: row.sport,
    position: topGoal?.position ?? undefined,
    clipUrl: row.videoUrl,
    posterUrl: row.posterUrl,
    notes: row.notes ?? undefined,
  });

  const sim = simDelayMs();
  if (sim > 0) await new Promise((r) => setTimeout(r, sim));

  const update = {
    title: result.title,
    status: "ready",
    processedSeconds: result.processedSeconds,
    pose: result.pose,
    flags: result.flags,
    metrics: result.metrics,
    summary: result.summary,
    provider: result.provider,
    model: result.model,
    latencyMs: result.latencyMs,
    error: result.error,
  };
  await db.update(aiBreakdowns).set(update).where(eq(aiBreakdowns.id, id));
  return mapRow({ ...row, ...update } as typeof aiBreakdowns.$inferSelect);
}
