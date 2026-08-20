"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Brain, ClipboardList, MessageSquare, Sparkles } from "lucide-react";
import { getStudentById } from "@/lib/coach-students";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel } from "@/lib/i18n/localize";
import { CoachGate } from "@/components/coach/CoachGate";
import { MetricBar, TrendChart } from "@/components/coach/AiCharts";
import { PastRecordsPanel } from "@/components/social/PastRecordsPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { CaRegionId } from "@/lib/dashboard-analytics";

function regionFromLocation(loc: string): CaRegionId {
  const l = loc.toLowerCase();
  if (l.includes("orange")) return "oc";
  if (l.includes("diego")) return "sd";
  if (l.includes("francisco") || l.includes("bay") || l.includes("jose")) return "bay";
  if (l.includes("sacramento")) return "sac";
  if (l.includes("inland") || l.includes("riverside")) return "ie";
  if (l.includes("fresno") || l.includes("central")) return "cv";
  return "la";
}

export default function StudentDetailPage() {
  const { t } = useLocale();
  const params = useParams<{ id: string }>();
  const student = getStudentById(params.id);

  if (!student) {
    return (
      <CoachGate>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="font-medium text-brand-800">{t("student_not_found")}</p>
          <Link href="/coach/dashboard#my-athletes" className="mt-4 inline-block">
            <Button variant="outline">{t("student_back")}</Button>
          </Link>
        </div>
      </CoachGate>
    );
  }

  const isPitcher = student.position.includes("P");

  return (
    <CoachGate>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/coach/dashboard#my-athletes"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("student_back")}
        </Link>

        <div className="flex flex-col gap-5 rounded-3xl border border-brand-100 bg-surface p-6 shadow-sm sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.avatarUrl}
            alt=""
            className="h-20 w-20 rounded-2xl bg-brand-50"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-brand-950">{student.name}</h1>
              <Badge variant="verified">
                <Brain className="h-3 w-3" />
                {t("students_ai_badge")}
              </Badge>
            </div>
            <p className="mt-1 text-brand-600">
              {student.level} · {student.position} · {student.age}y · {student.location}
            </p>
            {student.parentName && (
              <p className="mt-1 text-sm text-brand-500">
                {t("student_parent")}: {student.parentName}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {student.focusAreas.map((f) => (
                <Badge key={f}>{specialtyLabel(t, f)}</Badge>
              ))}
            </div>
          </div>
          <Link href={`/coach/feedback?student=${student.id}`}>
            <Button>
              <MessageSquare className="h-4 w-4" />
              {t("student_send_feedback")}
            </Button>
          </Link>
        </div>

        <div className="mt-6">
          <PastRecordsPanel
            regionHint={regionFromLocation(student.location)}
            records={student.lessonLog.map((l) => ({
              date: l.date,
              title: l.focus,
              note: `${l.durationMin} min · ${l.notes}`,
            }))}
          />
        </div>

        <section className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-brand-950">{t("lesson_log_title")}</h2>
          </div>
          <p className="mt-1 text-sm text-brand-500">{t("lesson_log_sub")}</p>
          <ul className="mt-4 space-y-3">
            {student.lessonLog.map((l) => (
              <li
                key={l.id}
                className="rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-brand-950">{l.focus}</p>
                  <p className="text-xs font-medium text-brand-500">
                    {l.date} · {l.durationMin} min
                  </p>
                </div>
                <p className="mt-1 text-sm text-brand-700">{l.notes}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-surface p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <h2 className="font-bold text-brand-950">{t("student_summary")}</h2>
              </div>
              <p className="mt-3 leading-relaxed text-brand-800">{student.aiSummary}</p>
              <p className="mt-4 rounded-xl bg-surface/80 px-3 py-2 text-sm text-brand-700">
                <span className="font-semibold">{t("student_last_note")}: </span>
                {student.lastSessionNote}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
                <h3 className="font-bold text-brand-950">{t("student_strengths")}</h3>
                <ul className="mt-3 space-y-2">
                  {student.strengths.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-brand-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
                <h3 className="font-bold text-brand-950">{t("student_improve")}</h3>
                <ul className="mt-3 space-y-2">
                  {student.improvements.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-brand-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-brand-950">{t("student_trends")}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {!isPitcher && (
                  <TrendChart
                    history={student.history}
                    metric="batSpeed"
                    label={t("student_trend_bat")}
                    color="#1d4ed8"
                  />
                )}
                <TrendChart
                  history={student.history}
                  metric="hipRotation"
                  label={t("student_trend_hip")}
                  color="#059669"
                />
                <TrendChart
                  history={student.history}
                  metric="exitVelo"
                  label={t("student_trend_exit")}
                  color="#ea580c"
                />
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-brand-950">{t("student_ai_db")}</h2>
              <p className="mb-4 text-sm text-brand-500">{t("student_metrics")}</p>
              <div className="space-y-4">
                {!isPitcher && (
                  <>
                    <MetricBar
                      label={t("student_metric_bat")}
                      value={student.metrics.batSpeed}
                      unit="mph"
                      max={90}
                    />
                    <MetricBar
                      label={t("student_metric_attack")}
                      value={student.metrics.attackAngle}
                      unit="°"
                      max={20}
                    />
                  </>
                )}
                <MetricBar
                  label={t("student_metric_hip")}
                  value={student.metrics.hipRotation}
                  unit="%"
                  max={100}
                />
                <MetricBar
                  label={t("student_metric_exit")}
                  value={student.metrics.exitVelo}
                  unit="mph"
                  max={100}
                />
                <MetricBar
                  label={t("student_metric_consistency")}
                  value={student.metrics.consistency}
                  unit="/100"
                  max={100}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </CoachGate>
  );
}
