"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Booking, BookingStatus } from "@/types";
import {
  CA_REGIONS,
  DASH_GOALS,
  REVENUE_PERIODS,
  choroplethColor,
  lessonHistoryRows,
  regionLessonCounts,
  revenueByDay,
  revenueSeries,
  revenueTotal,
  type CaRegionId,
  type RevenuePeriodDays,
} from "@/lib/dashboard-analytics";
import { students } from "@/lib/coach-students";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { Badge } from "@/components/ui/Badge";
import { MyAthletesPanel } from "@/components/coach/MyAthletesPanel";

/** Circular “cage” that fills as you complete lessons / hit goals */
export function ProgressRing({
  value,
  max,
  label,
  sub,
  color = "#3b82f6",
  size = 148,
  compact = false,
}: {
  value: number;
  max: number;
  label: string;
  sub?: string;
  color?: string;
  size?: number;
  compact?: boolean;
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
      {sub && !compact && (
        <p className="mt-0.5 max-w-[11rem] text-xs text-brand-500">{sub}</p>
      )}
    </div>
  );
}

type RingId = "lessons" | "revenue" | "network";

const statusKey: Record<BookingStatus, MessageKey> = {
  pending: "status_pending",
  confirmed: "status_confirmed",
  completed: "status_completed",
  cancelled: "status_cancelled",
};

function RingToggle({
  ringId,
  expanded,
  onToggle,
  children,
}: {
  ringId: RingId;
  expanded: RingId | null;
  onToggle: (id: RingId) => void;
  children: ReactNode;
}) {
  const active = expanded === ringId;
  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={() => onToggle(ringId)}
      className={`rounded-2xl p-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${
        active
          ? "bg-brand-50 ring-2 ring-brand-300"
          : "hover:bg-brand-50/70"
      }`}
    >
      {children}
      <ChevronDown
        className={`mx-auto mt-1 h-4 w-4 text-brand-400 transition-transform ${
          active ? "rotate-180" : ""
        }`}
        aria-hidden
      />
    </button>
  );
}

function LessonHistoryPanel({ rows }: { rows: ReturnType<typeof lessonHistoryRows> }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  return (
    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-brand-950">{t("dash_ring_expand_lessons")}</h3>
        <p className="text-xs text-brand-500">{t("dash_lesson_count", { n: rows.length })}</p>
      </div>
      <ul className="mt-3 max-h-72 divide-y divide-brand-100 overflow-y-auto rounded-xl border border-brand-100 bg-surface">
        {rows.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-brand-500">{t("dash_no_bookings")}</li>
        )}
        {rows.map((row) => {
          const time = row.startTime
            ? `${row.startTime}–${row.endTime}`
            : `${row.durationMin}${t("dash_lesson_min")}`;
          const detail =
            row.focus && row.note
              ? `${row.focus} · ${row.note}`
              : row.note ?? row.focus;

          return (
          <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-brand-950">{row.athleteName}</p>
              <p className="text-sm text-brand-600">
                {new Date(`${row.date}T00:00:00`).toLocaleDateString(dateLocale, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {time}
              </p>
              {detail && (
                <p className="mt-0.5 line-clamp-1 text-xs text-brand-500">{detail}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <Badge>{t(statusKey[row.status])}</Badge>
              {row.price != null && (
                <p className="mt-1 text-sm font-bold tabular-nums text-brand-900">
                  {formatPrice(row.price)}
                </p>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}

function RevenuePeriodPanel({ bookings }: { bookings: Booking[] }) {
  const { t, locale } = useLocale();
  const [period, setPeriod] = useState<RevenuePeriodDays>("all");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const series = useMemo(() => revenueSeries(bookings, period), [bookings, period]);

  const selectPeriod = (days: RevenuePeriodDays) => {
    setPeriod(days);
    setHoveredKey(null);
  };
  const max = Math.max(...series.map((s) => s.amount), 1);
  const total = series.reduce((s, r) => s + r.amount, 0);
  const periodLabel = t(REVENUE_PERIODS.find((p) => p.days === period)!.key);

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
    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-brand-950">{t("dash_ring_expand_revenue")}</h3>
          <p className="mt-0.5 text-xs text-brand-500">
            {t("dash_rev_chart_sub_period", { period: periodLabel })}
          </p>
        </div>
        <p className="text-lg font-black tabular-nums text-brand-950">{formatPrice(total)}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {REVENUE_PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => selectPeriod(p.days)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              period === p.days
                ? "bg-brand-900 text-white"
                : "bg-surface text-brand-600 ring-1 ring-brand-100 hover:bg-brand-50"
            }`}
          >
            {t(p.key)}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" role="img" aria-label={t("dash_rev_chart_title")}>
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
        <polygon points={area} fill="url(#revFillExpand)" opacity="0.35" />
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line}
        />
        {points.map((p) => {
          const active = hoveredKey === p.key;
          const dateLabel = new Date(`${p.key}T00:00:00`).toLocaleDateString(dateLocale, {
            month: "short",
            day: "numeric",
            year: period === "all" || (typeof period === "number" && period > 90) ? "numeric" : undefined,
          });
          const tooltipW = 88;
          const tooltipH = 34;
          const tooltipX = Math.min(Math.max(p.x - tooltipW / 2, pad.l), pad.l + innerW - tooltipW);
          const tooltipY = p.y < tooltipH + 12 ? p.y + 14 : p.y - tooltipH - 10;

          return (
            <g key={p.key}>
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredKey(p.key)}
                onMouseLeave={() => setHoveredKey(null)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 5 : 3.5}
                fill="#059669"
                className="pointer-events-none transition-[r] duration-150"
              />
              {active && (
                <g className="pointer-events-none">
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipW}
                    height={tooltipH}
                    rx={6}
                    fill="#0f172a"
                    opacity={0.92}
                  />
                  <text
                    x={tooltipX + tooltipW / 2}
                    y={tooltipY + 14}
                    textAnchor="middle"
                    className="fill-white"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {formatPrice(p.amount)}
                  </text>
                  <text
                    x={tooltipX + tooltipW / 2}
                    y={tooltipY + 27}
                    textAnchor="middle"
                    className="fill-slate-300"
                    fontSize="9"
                  >
                    {dateLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <defs>
          <linearGradient id="revFillExpand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points
          .filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
          .map((p) => (
            <text
              key={`lbl-${p.key}`}
              x={p.x}
              y={h - 8}
              textAnchor="middle"
              className="fill-brand-400"
              fontSize="9"
            >
              {new Date(`${p.key}T00:00:00`).toLocaleDateString(dateLocale, {
                month: "short",
                day: "numeric",
              })}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function NetworkAthletesPanel() {
  const { t } = useLocale();
  return (
    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-brand-950">{t("dash_ring_expand_network")}</h3>
        <Link href="/coach/students" className="text-xs font-semibold text-brand-600">
          {t("dash_my_athletes_cta")}
        </Link>
      </div>
      <MyAthletesPanel embedded id="my-athletes-ring" />
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
  const [expanded, setExpanded] = useState<RingId | null>("lessons");

  const lessonRows = useMemo(() => lessonHistoryRows(bookings, students), [bookings]);
  const lessonCount = lessonRows.length;
  const revenue = Math.min(DASH_GOALS.revenueUsd, revenueTotal(bookings));
  const network = Math.min(DASH_GOALS.networkPlayers, students.length);

  const toggle = (id: RingId) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="font-bold text-brand-950">{t("dash_rings_title")}</h2>
      <p className="mt-0.5 text-sm text-brand-500">{t("dash_rings_sub")}</p>
      <div className="mt-6 flex flex-wrap items-start justify-around gap-4">
        <RingToggle ringId="lessons" expanded={expanded} onToggle={toggle}>
          <ProgressRing
            value={lessonCount}
            max={DASH_GOALS.lessons}
            label={t("dash_ring_lessons")}
            color="#3b82f6"
            compact
          />
        </RingToggle>
        <RingToggle ringId="revenue" expanded={expanded} onToggle={toggle}>
          <ProgressRing
            value={revenue}
            max={DASH_GOALS.revenueUsd}
            label={t("dash_ring_revenue")}
            color="#10b981"
            compact
          />
        </RingToggle>
        <RingToggle ringId="network" expanded={expanded} onToggle={toggle}>
          <ProgressRing
            value={network}
            max={DASH_GOALS.networkPlayers}
            label={t("dash_ring_network")}
            color="#f59e0b"
            compact
          />
        </RingToggle>
      </div>

      {expanded === "lessons" && <LessonHistoryPanel rows={lessonRows} />}
      {expanded === "revenue" && <RevenuePeriodPanel bookings={bookings} />}
      {expanded === "network" && <NetworkAthletesPanel />}
    </div>
  );
}
