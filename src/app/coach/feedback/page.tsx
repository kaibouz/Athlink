"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import { getStudentById, students } from "@/lib/coach-students";
import { useCoachTools } from "@/lib/coach-tools";
import { useLocale } from "@/lib/i18n/provider";
import { CoachGate } from "@/components/coach/CoachGate";
import { CommSwitcher } from "@/components/layout/CommSwitcher";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useApi } from "@/lib/client/use-api";
import type { ReportCard } from "@/types";

function FeedbackComposer() {
  const { t, locale } = useLocale();
  const { sendFeedback } = useCoachTools();
  const { data: fbData, reload } = useApi<{ feedback: ReportCard[] }>("/api/feedback");
  const feedback = fbData?.feedback ?? [];
  const params = useSearchParams();
  const initialStudent = params.get("student") ?? students[0]?.id ?? "";

  const [studentId, setStudentId] = useState(initialStudent);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachAi, setAttachAi] = useState(true);
  const [sentId, setSentId] = useState<string | null>(null);

  const student = useMemo(() => getStudentById(studentId), [studentId]);
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student || !subject.trim() || !body.trim()) return;
    let fullBody = body.trim();
    if (attachAi && student.aiSummary) {
      fullBody += `\n\n--- AI summary ---\n${student.aiSummary}`;
    }
    const item = sendFeedback({
      studentId: student.id,
      studentName: student.name,
      subject: subject.trim(),
      body: fullBody,
      aiAttached: attachAi,
    });
    setSentId(item.id);
    setSubject("");
    setBody("");
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student.id,
        subject: subject.trim(),
        body: fullBody,
        aiAttached: attachAi,
      }),
    });
    reload();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <CommSwitcher />
      <h1 className="text-2xl font-bold text-brand-950 sm:text-3xl">{t("feedback_title")}</h1>
      <p className="mt-1 text-brand-600">{t("feedback_sub")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm"
        >
          <h2 className="font-bold text-brand-950">{t("feedback_compose")}</h2>
          <div>
            <Label htmlFor="student">{t("feedback_student")}</Label>
            <Select
              id="student"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setSentId(null);
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.level}
                </option>
              ))}
            </Select>
          </div>
          {student && (
            <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                AI
              </span>
              <p className="mt-1">{student.aiSummary}</p>
            </div>
          )}
          <div>
            <Label htmlFor="subject">{t("feedback_subject")}</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("feedback_subject_ph")}
              required
            />
          </div>
          <div>
            <Label htmlFor="body">{t("feedback_body")}</Label>
            <Textarea
              id="body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("feedback_body_ph")}
              required
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-800">
            <input
              type="checkbox"
              checked={attachAi}
              onChange={(e) => setAttachAi(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            {t("feedback_attach_ai")}
          </label>
          <Button type="submit" className="w-full" size="lg">
            {t("feedback_send")}
          </Button>
          {sentId && (
            <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {t("feedback_sent")}
            </p>
          )}
        </form>

        <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
          <h2 className="font-bold text-brand-950">{t("feedback_history")}</h2>
          {feedback.length === 0 ? (
            <p className="mt-4 text-sm text-brand-500">{t("feedback_empty")}</p>
          ) : (
            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto">
              {feedback.map((f) => (
                <article
                  key={f.id}
                  className="rounded-xl border border-brand-50 bg-brand-50/50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-brand-950">{f.studentName}</p>
                    {f.aiAttached && <Badge variant="verified">{t("feedback_ai_tag")}</Badge>}
                  </div>
                  <p className="mt-1 text-sm font-medium text-brand-800">{f.subject}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-700">
                    {f.body}
                  </p>
                  <p className="mt-2 text-[11px] text-brand-400">
                    {new Date(f.createdAt).toLocaleString(dateLocale)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function CoachFeedbackPage() {
  const { t } = useLocale();
  return (
    <CoachGate>
      <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
        <FeedbackComposer />
      </Suspense>
    </CoachGate>
  );
}
