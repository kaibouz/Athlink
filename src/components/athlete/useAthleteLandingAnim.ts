"use client";

import { useEffect } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function runChat(el: HTMLElement, reduce: boolean) {
  const msgs = [...el.querySelectorAll<HTMLElement>(".ah-msg")];
  const typing = el.querySelector<HTMLElement>(".ah-typing");
  if (reduce) {
    msgs.forEach((m) => m.classList.add("ah-in"));
    return;
  }
  for (const m of msgs) {
    if (!m.classList.contains("ah-me") && typing) {
      typing.classList.add("ah-show");
      await wait(1100);
      typing.classList.remove("ah-show");
    } else {
      await wait(700);
    }
    m.classList.add("ah-in");
    await wait(500);
  }
}

async function runFeed(el: HTMLElement, reduce: boolean) {
  const posts = [...el.querySelectorAll<HTMLElement>(".ah-post")];
  if (reduce) {
    posts.forEach((p) => p.classList.add("ah-in"));
    el.querySelectorAll<HTMLElement>(".ah-likes").forEach((l) => {
      l.textContent = l.dataset.to ?? l.textContent;
    });
    return;
  }
  const banner = el.querySelector<HTMLElement>(".ah-newpost");
  if (banner) {
    banner.classList.add("ah-show");
    await wait(900);
    banner.classList.remove("ah-show");
    await wait(300);
  }
  for (const p of posts) {
    p.classList.add("ah-in");
    await wait(450);
  }
  await wait(400);
  for (const p of posts) {
    const h = p.querySelector<HTMLElement>(".ah-heart");
    const l = p.querySelector<HTMLElement>(".ah-likes");
    if (!h || !l) continue;
    let n = +(l.dataset.from ?? "0");
    const to = +(l.dataset.to ?? "0");
    const tick = async () => {
      while (n < to) {
        n++;
        l.textContent = String(n);
        h.classList.remove("ah-pop");
        void h.offsetWidth;
        h.classList.add("ah-pop");
        await wait(220);
      }
    };
    void tick();
    await wait(500);
  }
}

async function runBio(el: HTMLElement, reduce: boolean) {
  const ms = [...el.querySelectorAll<HTMLElement>(".ah-metric")];
  if (reduce) {
    ms.forEach((m) => m.classList.add("ah-in"));
    return;
  }
  await wait(600);
  for (const m of ms) {
    m.classList.add("ah-in");
    await wait(350);
  }
}

const runners: Record<string, (el: HTMLElement, reduce: boolean) => Promise<void>> = {
  chat: runChat,
  feed: runFeed,
  bio: runBio,
  chart: async () => {},
};

/** Scroll-triggered animations for athlete landing mock UIs. */
export function useAthleteLandingAnim() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          el.classList.add("ah-play");
          const runner = runners[el.dataset.anim ?? ""];
          if (runner) void runner(el, reduce);
        });
      },
      { threshold: 0.4 },
    );

    document.querySelectorAll<HTMLElement>(".athlete-landing .ah-anim").forEach((el) => {
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);
}
