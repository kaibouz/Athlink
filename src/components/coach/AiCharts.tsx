"use client";

import type { AiMetricPoint } from "@/types";

export function MetricBar({
  label,
  value,
  unit,
  max = 100,
}: {
  label: string;
  value: number;
  unit?: string;
  max?: number;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-brand-800">{label}</span>
        <span className="tabular-nums text-brand-600">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TrendChart({
  history,
  metric,
  label,
  color = "#1d4ed8",
}: {
  history: AiMetricPoint[];
  metric: keyof Omit<AiMetricPoint, "date">;
  label: string;
  color?: string;
}) {
  const values = history.map((h) => h[metric]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const w = 280;
  const h = 80;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-brand-100 bg-surface p-4">
      <p className="mb-2 text-sm font-semibold text-brand-900">{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" role="img" aria-label={label}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {values.map((v, i) => {
          const x = (i / Math.max(values.length - 1, 1)) * w;
          const y = h - ((v - min) / range) * (h - 8) - 4;
          return <circle key={history[i].date} cx={x} cy={y} r="3" fill={color} />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-brand-400">
        <span>{history[0]?.date}</span>
        <span>{history[history.length - 1]?.date}</span>
      </div>
    </div>
  );
}
