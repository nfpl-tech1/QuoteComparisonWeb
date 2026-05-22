"use client";

export interface InquiryRow {
  id: number;
  inquiry_number: string;
  mode: string;
  lane: string;
  logged_at: string;
  workstation_id: string;
  user_name: string;
  vendor_count: number;
  quote_count: number;
  vendor_names: string[];
}

const MODE_STYLE: Record<string, string> = {
  AIR: "bg-sky-50 text-sky-700 border-sky-200",
  FCL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LCL: "bg-violet-50 text-violet-700 border-violet-200",
};

const LANE_LABEL: Record<string, string> = {
  import: "Import",
  export: "Export",
  crosstrade: "Cross-trade",
};

function ModeBadge({ mode }: { mode: string }) {
  const cls = MODE_STYLE[mode] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${cls}`}>
      {mode}
    </span>
  );
}

function formatDate(iso: string) {
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
  rows: InquiryRow[];
  loading: boolean;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function InquiryTable({ rows, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["Inquiry", "Mode", "Lane", "Logged At", "User", "Vendors", "Quotes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
        <span className="text-3xl">📋</span>
        <p className="text-sm font-medium">No inquiries match your filters</p>
        <p className="text-xs text-slate-400">Open a comparison in the desktop tool to see entries here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {["Inquiry", "Mode", "Lane", "Logged At", "User", "Vendors", "Quotes"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {h}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Vendor Names
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3 font-mono font-bold text-slate-800">
                {row.inquiry_number}
              </td>
              <td className="px-4 py-3">
                <ModeBadge mode={row.mode} />
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {LANE_LABEL[row.lane] ?? (row.lane || <span className="text-slate-300">—</span>)}
              </td>
              <td className="px-4 py-3 text-slate-500 tabular-nums text-xs">
                {formatDate(row.logged_at)}
              </td>
              <td className="px-4 py-3 text-slate-600 font-medium text-xs">
                {row.user_name || <span className="text-slate-300 font-normal italic">—</span>}
              </td>
              <td className="px-4 py-3 tabular-nums font-semibold text-slate-700">
                {row.vendor_count}
              </td>
              <td className="px-4 py-3 tabular-nums font-semibold text-slate-700">
                {row.quote_count}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {row.vendor_names.map((v) => (
                    <span
                      key={v}
                      className="bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-slate-600 font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
