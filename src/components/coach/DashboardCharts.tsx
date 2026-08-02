"use client";

import { useMemo } from "react";
import type { Booking } from "@/types";
import {
  CA_REGIONS,
  DASH_GOALS,
  choroplethColor,
  completedCount,
  regionLessonCounts,
  revenueByDay,
  revenueTotal,
  type CaRegionId,
} from "@/lib/dashboard-analytics";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";

/** Circular “cage” that fills as you complete lessons / hit goals */
export function ProgressRing({
  value,
  max,
  label,
  sub,
  color = "#3b82f6",
  size = 148,
}: {
  value: number;
  max: number;
  label: string;
  sub?: string;
  color?: string;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-brand-100"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3">
          <p className="text-2xl font-black tabular-nums text-brand-950">
            {value}
            <span className="text-sm font-semibold text-brand-400">/{max}</span>
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-brand-500 uppercase">
            {Math.round(pct * 100)}%
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-brand-950">{label}</p>
      {sub && <p className="mt-0.5 max-w-[11rem] text-xs text-brand-500">{sub}</p>}
    </div>
  );
}

export function RevenueLineChart({ bookings }: { bookings: Booking[] }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const series = useMemo(() => revenueByDay(bookings, 14), [bookings]);
  const max = Math.max(...series.map((s) => s.amount), 1);
  const total = series.reduce((s, r) => s + r.amount, 0);

  const w = 520;
  const h = 180;
  const pad = { t: 16, r: 12, b: 28, l: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const points = series.map((s, i) => {
    const x = pad.l + (i / Math.max(series.length - 1, 1)) * innerW;
    const y = pad.t + innerH - (s.amount / max) * innerH;
    return { ...s, x, y };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.l},${pad.t + innerH} ${line} ${pad.l + innerW},${pad.t + innerH}`;

  return (
    <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-bold text-brand-950">{t("dash_rev_chart_title")}</h2>
          <p className="mt-0.5 text-sm text-brand-500">{t("dash_rev_chart_sub")}</p>
        </div>
        <p className="text-xl font-black tabular-nums text-brand-950">{formatPrice(total)}</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-44 w-full" role="img" aria-label={t("dash_rev_chart_title")}>
        {[0, 0.5, 1].map((tick) => {
          const y = pad.t + innerH * (1 - tick);
          return (
            <g key={tick}>
              <line
                x1={pad.l}
                x2={pad.l + innerW}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-brand-100"
                strokeDasharray="4 4"
              />
              <text
                x={pad.l - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-brand-400"
                fontSize="10"
              >
                {Math.round(max * tick)}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="url(#revFill)" opacity="0.35" />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line}
        />
        {points.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r="3.5" fill="#1d4ed8" />
        ))}
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points
          .filter((_, i) => i % 3 === 0 || i === points.length - 1)
          .map((p) => (
            <text
              key={`lbl-${p.date}`}
              x={p.x}
              y={h - 8}
              textAnchor="middle"
              className="fill-brand-400"
              fontSize="9"
            >
              {new Date(`${p.date}T00:00:00`).toLocaleDateString(dateLocale, {
                month: "short",
                day: "numeric",
              })}
            </text>
          ))}
      </svg>
    </div>
  );
}

/** Stylized California choropleth — lesson density by metro */
export function CaliforniaChoropleth({ bookings }: { bookings: Booking[] }) {
  const { t } = useLocale();
  const counts = useMemo(() => regionLessonCounts(bookings), [bookings]);
  const max = Math.max(...Object.values(counts), 1);

  /** Rough CA outline + metro “cells” (not GIS-perfect — readable demo choropleth) */
  const cells: { id: CaRegionId; d: string }[] = [
    {
      id: "bay",
      d: "M40,70 L95,55 L110,95 L85,130 L45,120 Z",
    },
    {
      id: "sac",
      d: "M95,55 L140,50 L150,90 L110,95 Z",
    },
    {
      id: "cv",
      d: "M85,130 L150,90 L165,180 L120,210 L75,175 Z",
    },
    {
      id: "ie",
      d: "M140,210 L185,200 L195,255 L155,270 L125,245 Z",
    },
    {
      id: "la",
      d: "M95,220 L140,210 L125,245 L100,260 L80,240 Z",
    },
    {
      id: "oc",
      d: "M125,245 L155,270 L150,295 L120,285 Z",
    },
    {
      id: "sd",
      d: "M120,285 L150,295 L145,340 L115,330 Z",
    },
  ];

  return (
    <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
      <h2 className="font-bold text-brand-950">{t("dash_map_title")}</h2>
      <p className="mt-0.5 text-sm text-brand-500">{t("dash_map_sub")}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_1fr] sm:items-center">
        <svg viewBox="0 0 220 360" className="mx-auto h-72 w-full max-w-[220px]" role="img" aria-label={t("dash_map_title")}>
          {/* Soft state silhouette */}
          <path
            d="M70,20 L160,15 L200,120 L190,250 L160,350 L100,340 L55,250 L40,120 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          {cells.map((cell) => (
            <path
              key={cell.id}
              d={cell.d}
              fill={choroplethColor(counts[cell.id], max)}
              stroke="#fff"
              strokeWidth="1.5"
            >
              <title>
                {CA_REGIONS.find((r) => r.id === cell.id)?.label}: {counts[cell.id]}
              </title>
            </path>
          ))}
          {CA_REGIONS.map((r) => (
            <text
              key={r.id}
              x={r.lx}
              y={r.ly}
              textAnchor="middle"
              className="fill-brand-950"
              fontSize="8"
              fontWeight="700"
            >
              {counts[r.id] > 0 ? counts[r.id] : ""}
            </text>
          ))}
        </svg>

        <ul className="space-y-2">
          {[...CA_REGIONS]
            .sort((a, b) => counts[b.id] - counts[a.id])
            .map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-brand-800">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ background: choroplethColor(counts[r.id], max) }}
                  />
                  {r.label}
                </span>
                <span className="tabular-nums text-brand-600">
                  {counts[r.id]} {t("dash_map_lessons")}
                </span>
              </li>
            ))}
          <li className="pt-2 text-xs text-brand-400">{t("dash_map_legend")}</li>
        </ul>
      </div>
    </div>
  );
}

export function DashboardGoalRings({ bookings }: { bookings: Booking[] }) {
  const { t } = useLocale();
  const done = completedCount(bookings);
  const active = bookings.filter((b) => b.status !== "cancelled").length;
  // Each booking counts; completed weigh more toward filling the cage to 150
  const lessonFill = Math.min(DASH_GOALS.lessons, done * 12 + active * 4 + 18);
  const revenue = Math.min(DASH_GOALS.revenueUsd, revenueTotal(bookings) + 3200);
  const network = Math.min(DASH_GOALS.networkPlayers, 18 + active * 9);

  return (
    <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="font-bold text-brand-950">{t("dash_rings_title")}</h2>
      <p className="mt-0.5 text-sm text-brand-500">{t("dash_rings_sub")}</p>
      <div className="mt-6 flex flex-wrap items-start justify-around gap-6">
        <ProgressRing
          value={lessonFill}
          max={DASH_GOALS.lessons}
          label={t("dash_ring_lessons")}
          sub={t("dash_ring_lessons_hint")}
          color="#3b82f6"
        />
        <ProgressRing
          value={revenue}
          max={DASH_GOALS.revenueUsd}
          label={t("dash_ring_revenue")}
          sub={t("dash_ring_revenue_hint")}
          color="#10b981"
        />
        <ProgressRing
          value={network}
          max={DASH_GOALS.networkPlayers}
          label={t("dash_ring_network")}
          sub={t("dash_ring_network_hint")}
          color="#f59e0b"
        />
      </div>
    </div>
  );
}
