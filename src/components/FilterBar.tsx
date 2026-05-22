"use client";

export interface Filters {
  mode: string;
  lane: string;
  user: string;
  from: string;
  to: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
  allUsers: string[];
}

const MODES = ["ALL", "AIR", "FCL", "LCL"];
const LANES = [
  { value: "", label: "All Lanes" },
  { value: "import", label: "Import" },
  { value: "export", label: "Export" },
  { value: "crosstrade", label: "Cross-trade" },
];

const selectCls =
  "h-8 bg-white border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 " +
  "hover:border-slate-300 transition-colors cursor-pointer";

export default function FilterBar({ filters, onChange, total, allUsers }: Props) {
  function set<K extends keyof Filters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilter = filters.mode || filters.lane || filters.user || filters.from || filters.to;

  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-6 p-3 bg-white border border-slate-200 rounded-xl">
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-slate-200">
        {MODES.map((m) => {
          const active = (m === "ALL" && !filters.mode) || filters.mode === m;
          return (
            <button
              key={m}
              onClick={() => set("mode", m === "ALL" ? "" : m)}
              className={`px-3 h-8 text-xs font-semibold transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Lane dropdown */}
      <select
        value={filters.lane}
        onChange={(e) => set("lane", e.target.value)}
        className={selectCls}
      >
        {LANES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      {/* User dropdown */}
      {allUsers.length > 0 && (
        <select
          value={filters.user}
          onChange={(e) => set("user", e.target.value)}
          className={selectCls}
        >
          <option value="">All Users</option>
          {allUsers.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      )}

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 mx-0.5" />

      {/* Date range */}
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        From
        <input
          type="date"
          value={filters.from}
          onChange={(e) => set("from", e.target.value)}
          className={selectCls + " pr-2"}
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        To
        <input
          type="date"
          value={filters.to}
          onChange={(e) => set("to", e.target.value)}
          className={selectCls + " pr-2"}
        />
      </label>

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={() => onChange({ mode: "", lane: "", user: "", from: "", to: "" })}
          className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
        >
          Clear
        </button>
      )}

      {/* Count — pushed right */}
      <span className="ml-auto text-xs text-slate-400 font-medium">
        {total} {total === 1 ? "inquiry" : "inquiries"}
      </span>
    </div>
  );
}
