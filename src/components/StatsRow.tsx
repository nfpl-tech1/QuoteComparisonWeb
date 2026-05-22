"use client";

import type { StatsResponse } from "@/app/api/stats/route";

interface Props {
  stats: StatsResponse | null;
  loading: boolean;
}

const MODE_STYLE: Record<string, { bar: string; badge: string }> = {
  AIR: { bar: "bg-sky-400", badge: "bg-sky-50 text-sky-700 border-sky-200" },
  FCL: { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  LCL: { bar: "bg-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-200" },
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-4xl font-bold text-slate-900 tabular-nums leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function ModeCard({ breakdown, total }: { breakdown: { mode: string; count: number }[]; total: number }) {
  const base = total || 1;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Mode Breakdown</p>
      {breakdown.length === 0 ? (
        <p className="text-sm text-slate-300">No data</p>
      ) : (
        <div className="flex flex-col gap-3">
          {breakdown.map(({ mode, count }) => {
            const pct = Math.round((count / base) * 100);
            const s = MODE_STYLE[mode] ?? { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" };
            return (
              <div key={mode} className="flex items-center gap-2.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold border w-12 justify-center shrink-0 ${s.badge}`}>
                  {mode}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`${s.bar} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-700 tabular-nums w-5 text-right shrink-0">{count}</span>
                <span className="text-xs text-slate-400 w-8 text-right shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
      <div className="h-9 w-16 bg-slate-100 rounded" />
    </div>
  );
}

export default function StatsRow({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  const wideMode = stats.mode_breakdown.length >= 3;

  return (
    <div className={`grid grid-cols-2 gap-4 mb-6 ${wideMode ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      <StatCard label="Total Inquiries" value={stats.total_inquiries} sub="unique jobs processed" />
      <StatCard label="Total Quotes Compared" value={stats.total_quotes} sub="across all inquiries" />
      <StatCard label="Avg Quotes / Inquiry" value={stats.avg_quotes_per_inquiry} sub="competitiveness signal" />
      <div className={wideMode ? "lg:col-span-2" : ""}>
        <ModeCard breakdown={stats.mode_breakdown} total={stats.total_inquiries} />
      </div>
    </div>
  );
}
