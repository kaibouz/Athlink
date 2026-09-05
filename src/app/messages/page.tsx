"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Film, Paperclip, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useSocial } from "@/lib/social-store";
import type { AiBreakdown, MessageThread, ThreadMessage } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { loc } from "@/lib/i18n/localize";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CommSwitcher } from "@/components/layout/CommSwitcher";
import { useApi } from "@/lib/client/use-api";

type ThreadRow = MessageThread;

export default function MessagesPage() {
  const { user } = useAuth();
  const { posts } = useSocial();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  const { data, loading, reload } = useApi<{ threads: ThreadRow[]; messages: ThreadMessage[] }>(
    user ? "/api/messages" : null,
  );
  const { data: bdData } = useApi<{ breakdowns: AiBreakdown[] }>(
    user?.role === "athlete" ? "/api/breakdowns" : null,
  );

  const threads = useMemo(() => data?.threads ?? [], [data]);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);

  useEffect(() => {
    if (!activeId && threads.length > 0) setActiveId(threads[0].id);
  }, [threads, activeId]);

  const activeThread = threads.find((th) => th.id === activeId);
  const threadMessages = useMemo(
    () =>
      (data?.messages ?? [])
        .filter((m) => m.threadId === activeId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [data, activeId],
  );

  const myPosts = user ? posts.filter((p) => p.athleteName === user.name) : [];
  const myBreakdowns = bdData?.breakdowns ?? [];

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("messages_title")}</h1>
        <p className="mt-2 text-[color:var(--mx-dim)]">{t("messages_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/messages" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  async function post(body: {
    body: string;
    kind?: "text" | "clip";
    attachmentUrl?: string;
    breakdownId?: string;
  }) {
    if (!activeThread) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeThread.id, ...body }),
    });
    reload();
  }

  async function send() {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    await post({ body: text });
  }

  async function sendClip(url: string, caption: string, breakdownId?: string) {
    setAttachOpen(false);
    await post({ body: caption, kind: "clip", attachmentUrl: url, breakdownId });
  }

  return (
    <div className="mx-app mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {user.role === "coach" && <CommSwitcher />}
      <header className="mx-hdr">
        <div>
          <h1>{t("messages_title")}</h1>
          <small>Threads · booking chips · clips</small>
        </div>
      </header>

      <div className="grid overflow-hidden rounded-[14px] border border-[color:var(--mx-border)] bg-[color:var(--mx-panel)] md:h-[600px] md:grid-cols-[280px_1fr]">
        <aside className="border-b border-[color:var(--mx-border)] md:border-r md:border-b-0">
          {threads.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[color:var(--mx-dim)]">
              {loading ? "Loading…" : t("messages_pick")}
            </div>
          )}
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveId(thread.id)}
              className={`flex w-full flex-col gap-0.5 border-b border-[color:var(--mx-border)] px-4 py-3 text-left transition hover:bg-[color:var(--mx-panel-2)] ${
                activeId === thread.id ? "bg-[color:var(--mx-panel-2)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[color:var(--mx-text)]">
                  {user.role === "coach" ? thread.athleteName : thread.coachName}
                </span>
                {thread.unread > 0 && (
                  <span className="rounded-full bg-[color:var(--mx-blue-1)] px-1.5 text-[10px] font-bold text-white">
                    {thread.unread}
                  </span>
                )}
              </div>
              <span className="truncate text-sm text-[color:var(--mx-dimmer)]">
                {loc(locale, thread.lastMessage)}
              </span>
            </button>
          ))}
        </aside>
        <div className="relative flex min-h-[360px] flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-[color:var(--mx-border)] px-4 py-3">
                <Link
                  href={`/coaches/${activeThread.coachId}`}
                  className="font-bold text-[color:var(--mx-text)] hover:text-[color:var(--mx-blue-2)]"
                >
                  {user.role === "coach" ? activeThread.athleteName : activeThread.coachName}
                </Link>
              </div>
              <div className="flex flex-1 flex-col space-y-3 overflow-y-auto p-4">
                {threadMessages.map((m) => {
                  if (m.kind === "system") {
                    return (
                      <div key={m.id} className="mx-sys">
                        {loc(locale, m.body)}
                      </div>
                    );
                  }
                  const mine = m.senderId === user.id || m.senderNameKey === "you";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                          mine
                            ? "bg-[linear-gradient(90deg,var(--mx-blue-1),var(--mx-blue-2))] text-white"
                            : "bg-[color:var(--mx-panel-2)] text-[color:var(--mx-text)]"
                        }`}
                      >
                        {m.kind === "clip" && m.attachmentUrl && (
                          <div className="mb-1.5 overflow-hidden rounded-lg border border-white/15">
                            <video
                              src={m.attachmentUrl}
                              className="aspect-video w-48 max-w-full object-cover"
                              muted
                              playsInline
                              controls
                            />
                            {m.breakdownId && (
                              <Link
                                href={`/breakdown/${m.breakdownId}`}
                                className="flex items-center gap-1 bg-black/40 px-2 py-1 text-[0.68rem] text-white"
                              >
                                <Sparkles className="h-3 w-3" /> View AI breakdown report
                              </Link>
                            )}
                          </div>
                        )}
                        <p>{loc(locale, m.body)}</p>
                        <p
                          className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-[color:var(--mx-dimmer)]"}`}
                        >
                          {new Date(m.createdAt).toLocaleString(dateLocale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {attachOpen && (
                <div className="absolute inset-x-3 bottom-16 z-10 max-h-64 overflow-y-auto rounded-xl border border-[color:var(--mx-border-strong)] bg-[color:var(--mx-panel-2)] p-2 shadow-xl">
                  {myBreakdowns.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[0.68rem] uppercase tracking-wide text-[color:var(--mx-dimmer)]">
                        AI breakdowns
                      </div>
                      {myBreakdowns.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => sendClip(b.videoUrl, `Shared: ${b.title}`, b.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"
                        >
                          <Sparkles className="h-4 w-4 text-[color:var(--mx-accent)]" />
                          <span className="min-w-0 flex-1 truncate">{b.title}</span>
                        </button>
                      ))}
                    </>
                  )}
                  <div className="px-2 py-1 text-[0.68rem] uppercase tracking-wide text-[color:var(--mx-dimmer)]">
                    From your feed
                  </div>
                  {myPosts.length === 0 && (
                    <div className="px-2 py-2 text-sm text-[color:var(--mx-dim)]">No clips yet.</div>
                  )}
                  {myPosts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => sendClip(p.videoUrl, p.caption, p.breakdownId)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"
                    >
                      <Film className="h-4 w-4 text-[color:var(--mx-blue-2)]" />
                      <span className="min-w-0 flex-1 truncate">{p.caption}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 border-t border-[color:var(--mx-border)] p-3">
                <button
                  type="button"
                  onClick={() => setAttachOpen((v) => !v)}
                  className={`mx-btn ${attachOpen ? "mx-btn-accent border-0" : "mx-btn-ghost"} px-2.5`}
                  aria-label="Attach clip"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <Input
                  placeholder={t("messages_placeholder")}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <Button className="mx-btn mx-btn-accent border-0" onClick={send}>
                  {t("messages_send")}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-[color:var(--mx-dim)]">
              {t("messages_pick")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
