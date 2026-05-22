"use client";

import { useCallback, useEffect, useState } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import InquiryTable, { type InquiryRow } from "@/components/InquiryTable";
import StatsRow from "@/components/StatsRow";
import type { StatsResponse } from "@/app/api/stats/route";

const PAGE_SIZE = 100;
const EMPTY_FILTERS: Filters = { mode: "", lane: "", user: "", from: "", to: "" };

export default function Home() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users once on mount for the user filter dropdown
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((s: StatsResponse) => {
        setAllUsers(s.user_breakdown.map((u) => u.user_name).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  const buildParams = (f: Filters) => {
    const p = new URLSearchParams();
    if (f.mode) p.set("mode", f.mode);
    if (f.lane) p.set("lane", f.lane);
    if (f.user) p.set("user", f.user);
    if (f.from) p.set("from", f.from);
    if (f.to) p.set("to", f.to);
    return p;
  };

  const fetchData = useCallback(async (f: Filters) => {
    setLoading(true);
    setStatsLoading(true);
    setError(null);

    const params = buildParams(f);

    const [tableRes, statsRes] = await Promise.allSettled([
      fetch(`/api/inquiries?${params}&limit=${PAGE_SIZE}&offset=0`),
      fetch(`/api/stats?${params}`),
    ]);

    if (tableRes.status === "fulfilled" && tableRes.value.ok) {
      const json = await tableRes.value.json();
      setRows(json.items);
      setTotal(json.total);
    } else {
      setError("Failed to load inquiries");
    }
    setLoading(false);

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      setStats(await statsRes.value.json());
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Processed Inquiries</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Logged each time a comparison is viewed in the desktop tool
          </p>
        </div>
        <button
          onClick={() => fetchData(filters)}
          className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white rounded-lg px-3 py-1.5 transition-colors shadow-sm"
        >
          Refresh
        </button>
      </div>

      {/* Filters — all sections below respond to this */}
      <FilterBar filters={filters} onChange={setFilters} total={total} allUsers={allUsers} />

      {/* Stats cards + mode breakdown */}
      <StatsRow stats={stats} loading={statsLoading} />

      {/* Inquiry table */}
      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          Error: {error}
        </div>
      ) : (
        <InquiryTable rows={rows} loading={loading} />
      )}
    </div>
  );
}
