"use client";

import { useEffect, useState } from "react";
import type { SettingsInfo } from "@/app/api/settings/info/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy}
      className="h-8 px-3 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors shrink-0">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function StatusRow({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
      <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
      {note && <span className="text-xs text-slate-400">{note}</span>}
      <span className={`text-xs font-semibold ${ok ? "text-emerald-600" : "text-red-500"}`}>
        {ok ? "Configured" : "Not set"}
      </span>
    </div>
  );
}

function EditableSecret({
  label, configKey, hint, currentValue, isSet, onSaved,
}: {
  label: string; configKey: string; hint?: string;
  currentValue: string; isSet?: boolean; onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const configured = !!(currentValue || isSet);
  const display = currentValue
    ? (revealed ? currentValue : "•".repeat(Math.min(currentValue.length, 32)))
    : "•".repeat(24);

  async function save() {
    if (!draft.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: configKey, value: draft.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setEditing(false);
      setDraft("");
      onSaved();
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <div className="flex gap-1.5">
          {!editing && currentValue && (
            <button onClick={() => setRevealed(!revealed)}
              className="h-8 px-3 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors">
              {revealed ? "Hide" : "Show"}
            </button>
          )}
          {!editing && currentValue && <CopyButton value={currentValue} />}
          {!editing && (
            <button onClick={() => { setEditing(true); setDraft(""); setError(""); }}
              className="h-8 px-3 text-xs font-semibold border border-brand-500 rounded-lg bg-white hover:bg-brand-50 text-brand-600 transition-colors">
              {configured ? "Change" : "Set"}
            </button>
          )}
        </div>
      </div>

      {!editing ? (
        <p className={`font-mono text-sm break-all ${configured ? "text-slate-800" : "text-slate-300"}`}>
          {configured ? display : "Not configured"}
        </p>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Enter new ${label.toLowerCase()}`}
            autoFocus
            className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !draft.trim()}
              className="h-8 px-4 text-xs font-semibold bg-slate-900 text-white rounded-lg
                hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setError(""); }}
              className="h-8 px-4 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {hint && !editing && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [info, setInfo] = useState<SettingsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/settings/info");
    if (res.ok) setInfo(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">Admin Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage secrets and service configuration live — no redeployment needed.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse h-36" />
          ))}
        </div>
      ) : !info ? (
        <p className="text-sm text-red-500">Failed to load settings.</p>
      ) : (
        <div className="space-y-4">
          {/* Desktop distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Desktop Distribution</p>
            <p className="text-sm text-slate-500 mb-5">Share these with each staff member when setting up the desktop tool.</p>

            {/* Cloud URL — display only */}
            <div className="py-3 border-b border-slate-50">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cloud Service URL</p>
                {info.cloud_service_url && <CopyButton value={info.cloud_service_url} />}
              </div>
              <p className="font-mono text-sm text-slate-800 break-all">
                {info.cloud_service_url || <span className="text-slate-300">Set NEXT_PUBLIC_SITE_URL env var</span>}
              </p>
              <p className="text-xs text-slate-400 mt-1">Paste into Cloud Service URL in the desktop Settings page.</p>
            </div>

            <EditableSecret
              label="Cloud API Key"
              configKey="cloud_api_key"
              currentValue={info.cloud_api_key}
              hint={`Source: ${info.cloud_api_key_source === "db" ? "Supabase config (live)" : info.cloud_api_key_source === "env" ? "CLOUD_API_KEY env var (fallback)" : "not configured"}`}
              onSaved={load}
            />
          </div>

          {/* Secrets management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Secrets</p>
            <p className="text-sm text-slate-500 mb-5">Stored in Supabase — changes take effect immediately without redeployment.</p>

            <EditableSecret
              label="Dashboard Password"
              configKey="dashboard_password"
              currentValue=""
              isSet={info.dashboard_password_set}
              hint="Changing this logs everyone out at next session expiry (12h)."
              onSaved={load}
            />
            <EditableSecret
              label="Exchange Rate API Key"
              configKey="free_currency_api_key"
              currentValue=""
              isSet={info.free_currency_set}
              hint="freecurrencyapi.com key for live exchange rates."
              onSaved={load}
            />
          </div>

          {/* Service status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Service Status</p>
              <span className="text-xs text-slate-400 tabular-nums">
                {info.total_inquiries} {info.total_inquiries === 1 ? "inquiry" : "inquiries"} in database
              </span>
            </div>
            <StatusRow label="Supabase Database" ok={info.supabase_connected} />
            <StatusRow label="Exchange Rate API" ok={info.free_currency_set} note="freecurrencyapi.com" />
            <StatusRow label="Cloud API Key" ok={info.cloud_api_key.length > 0} />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-500 mb-2">What stays in env vars</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="font-mono">SUPABASE_URL</span>, <span className="font-mono">SUPABASE_ANON_KEY</span> (needed to connect to the database),{" "}
              <span className="font-mono">SESSION_SECRET</span> (signs login sessions — change only to force all logouts),{" "}
              and <span className="font-mono">NEXT_PUBLIC_SITE_URL</span> (your deployment URL).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
