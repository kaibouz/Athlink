"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store";
import { messageThreads, messages as seedMessages } from "@/lib/data";
import type { Message } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { loc } from "@/lib/i18n/localize";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CommSwitcher } from "@/components/layout/CommSwitcher";

export default function MessagesPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [activeId, setActiveId] = useState(messageThreads[0]?.id ?? "");
  const [localMessages, setLocalMessages] = useState<Message[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const activeThread = messageThreads.find((th) => th.id === activeId);
  const threadMessages = useMemo(
    () =>
      localMessages
        .filter((m) => m.threadId === activeId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [localMessages, activeId],
  );
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

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

  function send() {
    if (!draft.trim() || !activeThread) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        threadId: activeThread.id,
        senderId: user!.id,
        senderName: user!.name,
        body: draft.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="mx-app mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {user.role === "coach" && <CommSwitcher />}
      <header className="mx-hdr">
        <div>
          <h1>{t("messages_title")}</h1>
          <small>Threads + booking system chips</small>
        </div>
      </header>

      <div className="grid overflow-hidden rounded-[14px] border border-[color:var(--mx-border)] bg-[color:var(--mx-panel)] md:h-[560px] md:grid-cols-[280px_1fr]">
        <aside className="border-b border-[color:var(--mx-border)] md:border-r md:border-b-0">
          {messageThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveId(thread.id)}
              className={`flex w-full flex-col gap-0.5 border-b border-[color:var(--mx-border)] px-4 py-3 text-left transition hover:bg-[color:var(--mx-panel-2)] ${
                activeId === thread.id ? "bg-[color:var(--mx-panel-2)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[color:var(--mx-text)]">{thread.coachName}</span>
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
        <div className="flex min-h-[360px] flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-[color:var(--mx-border)] px-4 py-3">
                <Link
                  href={`/coaches/${activeThread.coachId}`}
                  className="font-bold text-[color:var(--mx-text)] hover:text-[color:var(--mx-blue-2)]"
                >
                  {activeThread.coachName}
                </Link>
              </div>
              <div className="flex flex-1 flex-col space-y-3 overflow-y-auto p-4">
                <div className="mx-sys">{t("messages_sys_confirmed")}</div>
                {threadMessages.map((m) => {
                  const mine =
                    m.senderId === user.id ||
                    m.senderNameKey === "you" ||
                    m.senderName === "you";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                          mine
                            ? "bg-[linear-gradient(90deg,var(--mx-blue-1),var(--mx-blue-2))] text-white"
                            : "bg-[color:var(--mx-panel-2)] text-[color:var(--mx-text)]"
                        }`}
                      >
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
                <div className="mx-sys">{t("messages_sys_reschedule")}</div>
              </div>
              <div className="flex gap-2 border-t border-[color:var(--mx-border)] p-3">
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
