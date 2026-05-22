"use client";

import type { StatsResponse } from "@/app/api/stats/route";

const MODE_STYLE: Record<string, { bar: string; badge: string }> = {
  AIR: { bar: "bg-sky-400", badge: "bg-sky-50 text-sky-700 border-sky-200" },
  FCL: { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  LCL: { bar: "bg-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-200" },
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface Props {
  stats: StatsResponse | null;
  loading: boolean;
}

function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse ${tall ? "min-h-48" : "min-h-40"}`}>
      <div className="h-3 w-28 bg-slate-100 rounded mb-5" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
        <div className="h-4 bg-slate-100 rounded w-3/5" />
      </div>
    </div>
  );
}

export default function BreakdownCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SkeletonCard />
        <SkeletonCard tall />
      </div>
    );
  }

  const total = stats.total_inquiries || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Mode Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-5">
          Mode Breakdown
        </p>
        {stats.mode_breakdown.length === 0 ? (
          <p className="text-sm text-slate-400">No data for selected filters</p>
        ) : (
          <div className="flex flex-col gap-4">
            {stats.mode_breakdown.map(({ mode, count }) => {
              const pct = Math.round((count / total) * 100);
              const s = MODE_STYLE[mode] ?? {
                bar: "bg-slate-400",
                badge: "bg-slate-100 text-slate-600 border-slate-200",
              };
              return (
                <div key={mode} className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border w-14 justify-center shrink-0 ${s.badge}`}
                  >
                    {mode}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${s.bar} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-800 tabular-nums w-5 text-right shrink-0">
                    {count}
                  </span>
                  <span className="text-xs text-slate-400 w-9 text-right shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-5">
          User Activity
        </p>
        {stats.user_breakdown.length === 0 ? (
          <p className="text-sm text-slate-400">No data for selected filters</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2.5 text-left font-semibold text-slate-400 uppercase tracking-wide">User</th>
                  <th className="pb-2.5 text-left font-semibold text-slate-400 uppercase tracking-wide">Workstation</th>
                  <th className="pb-2.5 text-right font-semibold text-slate-400 uppercase tracking-wide">Inquiries</th>
                  <th className="pb-2.5 text-right font-semibold text-slate-400 uppercase tracking-wide">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.user_breakdown.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3 font-semibold text-slate-800">
                      {u.user_name || <span className="text-slate-400 font-normal italic">unnamed</span>}
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-slate-400">
                      {u.workstation_id}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-800 tabular-nums">
                      {u.count}
                    </td>
                    <td className="py-2.5 pl-3 text-right text-slate-400 whitespace-nowrap">
                      {formatDate(u.last_active)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
