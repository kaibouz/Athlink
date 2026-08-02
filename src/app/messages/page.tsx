"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store";
import { messageThreads, messages as seedMessages } from "@/lib/data";
import type { Message } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CommSwitcher } from "@/components/layout/CommSwitcher";

export default function MessagesPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [activeId, setActiveId] = useState(messageThreads[0]?.id ?? "");
  const [localMessages, setLocalMessages] = useState<Message[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const activeThread = messageThreads.find((t) => t.id === activeId);
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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("messages_title")}</h1>
        <p className="mt-2 text-brand-600">{t("messages_login_hint")}</p>
        <Link href="/login?next=/messages" className="mt-6 inline-block">
          <Button>{t("nav_login")}</Button>
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {user.role === "coach" && <CommSwitcher />}
      <h1 className="mb-6 text-2xl font-bold text-brand-950">{t("messages_title")}</h1>
      <div className="grid overflow-hidden rounded-2xl border border-brand-100 bg-surface shadow-sm md:h-[560px] md:grid-cols-[280px_1fr]">
        <aside className="border-b border-brand-100 md:border-r md:border-b-0">
          {messageThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveId(thread.id)}
              className={`flex w-full flex-col gap-0.5 border-b border-brand-50 px-4 py-3 text-left transition hover:bg-brand-50 ${
                activeId === thread.id ? "bg-brand-50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-brand-950">{thread.coachName}</span>
                {thread.unread > 0 && (
                  <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                    {thread.unread}
                  </span>
                )}
              </div>
              <span className="truncate text-sm text-brand-500">{thread.lastMessage}</span>
            </button>
          ))}
        </aside>
        <div className="flex min-h-[360px] flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-brand-100 px-4 py-3">
                <Link
                  href={`/coaches/${activeThread.coachId}`}
                  className="font-bold text-brand-950 hover:text-brand-600"
                >
                  {activeThread.coachName}
                </Link>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadMessages.map((m) => {
                  const mine = m.senderId === user.id || m.senderName === "あなた";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                          mine ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-900"
                        }`}
                      >
                        <p>{m.body}</p>
                        <p
                          className={`mt-1 text-[10px] ${mine ? "text-brand-200" : "text-brand-400"}`}
                        >
                          {new Date(m.createdAt).toLocaleString(dateLocale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t border-brand-100 p-3">
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
                <Button onClick={send}>{t("messages_send")}</Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-brand-500">
              {t("messages_pick")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
