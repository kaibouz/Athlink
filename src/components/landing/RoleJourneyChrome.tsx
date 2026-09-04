"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type JourneyStep = {
  id: string;
  label: string;
};

type RoleJourneyChromeProps = {
  steps: JourneyStep[];
  /** `concept` uses the athlete-landing blues so the rail matches the page body. */
  tone?: "default" | "concept";
  children: React.ReactNode;
};

/** Smooth-scroll marketing journey with a section progress rail. */
export function RoleJourneyChrome({
  steps,
  tone = "default",
  children,
}: RoleJourneyChromeProps) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? "");
  const stepIds = useMemo(() => steps.map((s) => s.id), [steps]);

  useEffect(() => {
    const nodes = stepIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-28% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [stepIds]);

  return (
    <div className={cn("role-journey", tone === "concept" && "role-journey-concept")}>
      <nav className="role-journey-progress" aria-label="Page sections">
        <ol className="mx-auto flex max-w-3xl items-center justify-center gap-1.5 px-4 sm:gap-2">
          {steps.map((step, index) => {
            const activeIndex = steps.findIndex((s) => s.id === activeId);
            const done = index < activeIndex;
            const current = step.id === activeId;
            return (
              <li key={step.id} className="flex items-center gap-1.5 sm:gap-2">
                {index > 0 && (
                  <span
                    className={cn(
                      "hidden h-px w-4 sm:block sm:w-6",
                      done || current
                        ? tone === "concept"
                          ? "bg-[#22c7e0]/70"
                          : "bg-sky-300/70"
                        : "bg-white/15",
                    )}
                    aria-hidden
                  />
                )}
                <a
                  href={`#${step.id}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition sm:text-xs",
                    current
                      ? "bg-white/15 text-white ring-1 ring-white/25"
                      : done
                        ? "text-sky-200/90 hover:bg-white/10"
                        : "text-white/45 hover:bg-white/5 hover:text-white/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      current
                        ? tone === "concept"
                          ? "bg-[#3b6ef6] text-white"
                          : "bg-[#005EB8] text-white"
                        : done
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {children}
    </div>
  );
}
