"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Users, UserPlus } from "lucide-react";
import { CoachGate } from "@/components/coach/CoachGate";
import { useGrowth } from "@/lib/growth-store";
import { useLocale } from "@/lib/i18n/provider";
import { students } from "@/lib/coach-students";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function InvitePageInner() {
  const { t, locale } = useLocale();
  const {
    inviteCoach,
    invitePlayer,
    markJoined,
    coachInvites,
    playerInvites,
    goals,
  } = useGrowth();

  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerTeam, setPlayerTeam] = useState("");
  const [copied, setCopied] = useState<"coach" | "player" | null>(null);

  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  // Count: joined coaches + self (1), players = invites joined + roster students as demo base
  const coachCount = 1 + coachInvites.filter((i) => i.status === "joined").length;
  const playerCount =
    students.length + playerInvites.filter((i) => i.status === "joined").length;

  const coachLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?role=coach&ref=coach`
      : "/signup?role=coach&ref=coach";
  const playerLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?role=athlete&ref=team`
      : "/signup?role=athlete&ref=team";

  async function copyLink(kind: "coach" | "player") {
    const url = kind === "coach" ? coachLink : playerLink;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function submitCoach(e: React.FormEvent) {
    e.preventDefault();
    if (!coachName.trim() || !coachEmail.trim()) return;
    inviteCoach(coachName.trim(), coachEmail.trim(), coachNote.trim() || undefined);
    setCoachName("");
    setCoachEmail("");
    setCoachNote("");
  }

  function submitPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName.trim() || !playerEmail.trim()) return;
    invitePlayer(playerName.trim(), playerEmail.trim(), playerTeam.trim() || undefined);
    setPlayerName("");
    setPlayerEmail("");
    setPlayerTeam("");
  }

  const playbook = useMemo(
    () => [
      t("growth_step_1"),
      t("growth_step_2"),
      t("growth_step_3"),
      t("growth_step_4"),
    ],
    [t],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-wide text-brand-500 uppercase">
          {t("growth_beta_label")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-brand-950 sm:text-3xl">
          {t("growth_title")}
        </h1>
        <p className="mt-2 max-w-2xl text-brand-600">{t("growth_sub")}</p>
      </div>

      {/* North star progress */}
      <section className="rounded-3xl border border-brand-100 bg-gradient-to-br from-ink to-ink-mid p-6 text-white shadow-sm sm:p-8">
        <h2 className="text-lg font-bold">{t("growth_goal_title")}</h2>
        <p className="mt-1 text-sm text-white/75">{t("growth_goal_sub")}</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-sm text-white/75">{t("growth_coaches")}</span>
              <span className="text-2xl font-black">
                {coachCount}
                <span className="text-base font-medium text-white/60">/{goals.coaches}</span>
              </span>
            </div>
            <ProgressBar value={coachCount} max={goals.coaches} color="bg-sky-400" />
          </div>
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-sm text-white/75">{t("growth_players")}</span>
              <span className="text-2xl font-black">
                {playerCount}
                <span className="text-base font-medium text-white/60">/{goals.players}</span>
              </span>
            </div>
            <ProgressBar value={playerCount} max={goals.players} color="bg-emerald-400" />
          </div>
        </div>
        <p className="mt-4 text-xs text-white/60">{t("growth_math")}</p>
      </section>

      {/* Playbook */}
      <section className="mt-8 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
        <h2 className="font-bold text-brand-950">{t("growth_playbook")}</h2>
        <ol className="mt-4 space-y-3">
          {playbook.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-brand-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Invite coaches */}
        <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-brand-950">{t("growth_invite_coaches")}</h2>
          </div>
          <p className="mt-1 text-sm text-brand-600">{t("growth_invite_coaches_sub")}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => copyLink("coach")}
          >
            <Copy className="h-4 w-4" />
            {copied === "coach" ? t("social_copied") : t("growth_copy_coach_link")}
          </Button>

          <form onSubmit={submitCoach} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="cname">{t("login_name")}</Label>
              <Input
                id="cname"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Ryan Matsukawa"
                required
              />
            </div>
            <div>
              <Label htmlFor="cemail">{t("login_email")}</Label>
              <Input
                id="cemail"
                type="email"
                value={coachEmail}
                onChange={(e) => setCoachEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cnote">{t("growth_note")}</Label>
              <Input
                id="cnote"
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder={t("growth_note_coach_ph")}
              />
            </div>
            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4" />
              {t("growth_send_coach")}
            </Button>
          </form>

          <ul className="mt-5 space-y-2">
            {coachInvites.map((i) => (
              <li
                key={i.id}
                className="flex items-start justify-between gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-semibold text-brand-900">{i.name}</p>
                  <p className="text-xs text-brand-500">{i.email}</p>
                  {i.teamOrNote && (
                    <p className="text-xs text-brand-600">{i.teamOrNote}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={i.status === "joined" ? "verified" : "neutral"}>
                    {i.status === "joined" ? t("growth_joined") : t("growth_sent")}
                  </Badge>
                  {i.status === "sent" && (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                      onClick={() => markJoined(i.id)}
                    >
                      {t("growth_mark_joined")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Invite players / team */}
        <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-brand-950">{t("growth_invite_players")}</h2>
          </div>
          <p className="mt-1 text-sm text-brand-600">{t("growth_invite_players_sub")}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => copyLink("player")}
          >
            <Copy className="h-4 w-4" />
            {copied === "player" ? t("social_copied") : t("growth_copy_player_link")}
          </Button>

          <form onSubmit={submitPlayer} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="pname">{t("login_name")}</Label>
              <Input
                id="pname"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pemail">{t("login_email")}</Label>
              <Input
                id="pemail"
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pteam">{t("growth_team")}</Label>
              <Input
                id="pteam"
                value={playerTeam}
                onChange={(e) => setPlayerTeam(e.target.value)}
                placeholder={t("growth_team_ph")}
              />
            </div>
            <Button type="submit" className="w-full" variant="secondary">
              {t("growth_send_player")}
            </Button>
          </form>

          <ul className="mt-5 space-y-2">
            {playerInvites.length === 0 && (
              <li className="text-sm text-brand-500">{t("growth_no_players_yet")}</li>
            )}
            {playerInvites.map((i) => (
              <li
                key={i.id}
                className="flex items-start justify-between gap-2 rounded-xl bg-emerald-50/80 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-semibold text-brand-900">{i.name}</p>
                  <p className="text-xs text-brand-500">{i.email}</p>
                  {i.teamOrNote && (
                    <p className="text-xs text-brand-600">{i.teamOrNote}</p>
                  )}
                  <p className="text-[10px] text-brand-400">
                    {new Date(i.createdAt).toLocaleString(dateLocale)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={i.status === "joined" ? "verified" : "neutral"}>
                    {i.status === "joined" ? t("growth_joined") : t("growth_sent")}
                  </Badge>
                  {i.status === "sent" && (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                      onClick={() => markJoined(i.id)}
                    >
                      {t("growth_mark_joined")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-5 text-sm text-brand-700">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p>{t("growth_footer_note")}</p>
        </div>
        <Link href="/coach/dashboard" className="mt-3 inline-block font-semibold text-brand-600 hover:underline">
          ← {t("coach_nav_dashboard")}
        </Link>
      </div>
    </div>
  );
}

export default function CoachInvitePage() {
  return (
    <CoachGate>
      <InvitePageInner />
    </CoachGate>
  );
}
