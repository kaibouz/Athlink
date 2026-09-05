"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

const PRESETS: { label: string; subject: string; body: string }[] = [
  {
    label: "Session recap",
    subject: "Session recap",
    body: "Great work today. Keep the barrel above the ball on the outside pitch and we'll build on the lower-half drive next time.",
  },
  {
    label: "Between-sessions plan",
    subject: "Between-sessions plan",
    body: "Focus on the drills we covered Mon/Wed. Keep it light before your next game and send me a clip if anything feels off.",
  },
  {
    label: "Great progress",
    subject: "Progress check-in",
    body: "Your numbers are trending up — nice consistency. Let's push the next goal on your Progress tab.",
  },
];

/** Inline report-card composer with preset messages — writes to coach_feedback via /api/feedback. */
export function CoachReportComposer({
  studentId,
  studentName,
  onSent,
}: {
  studentId: string;
  studentName: string;
  onSent?: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiAttached, setAiAttached] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function applyPreset(p: (typeof PRESETS)[number]) {
    setSubject(p.subject);
    setBody(p.body);
    setSent(false);
  }

  async function submit() {
    if (!subject.trim() || !body.trim()) {
      setError("Add a subject and message.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, subject: subject.trim(), body: body.trim(), aiAttached }),
      });
      if (res.ok) {
        setSent(true);
        setSubject("");
        setBody("");
        setAiAttached(false);
        onSent?.();
      } else {
        setError("Could not send report card.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
      <h2 className="font-bold text-brand-950">Send a report card</h2>
      <p className="mt-0.5 text-sm text-brand-500">To {studentName}. Appears on their Progress tab.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-full border border-brand-200 bg-surface px-3 py-1 text-xs font-semibold text-brand-700 transition hover:border-brand-400"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <Label htmlFor="rc-subject">Subject</Label>
          <Input
            id="rc-subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setSent(false);
            }}
            placeholder="Session recap"
          />
        </div>
        <div>
          <Label htmlFor="rc-body">Message</Label>
          <Textarea
            id="rc-body"
            rows={4}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSent(false);
            }}
            placeholder="What went well and what to work on…"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={aiAttached}
            onChange={(e) => setAiAttached(e.target.checked)}
            className="rounded border-brand-300"
          />
          Attach AI swing trends
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={submit} disabled={sending} className="w-full">
          {sent ? (
            <>
              <Check className="h-4 w-4" /> Report card sent
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send report card"}
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
