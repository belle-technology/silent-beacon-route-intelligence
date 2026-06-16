import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TacticalMap } from "@/components/TacticalMap";
import { formatElapsed, useActiveIncidents, useIncidentPings, type Incident } from "@/lib/safepath-state";
import { AlertOctagon, Radio, ShieldAlert, Wifi, Activity, ArrowLeft, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Operations dashboard" },
      { name: "description", content: "Live incident monitoring, AI route prediction and dispatch control for responders." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const incidents = useActiveIncidents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null,
    [incidents, selectedId],
  );
  const pings = useIncidentPings(selected?.id ?? null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = selected ? formatElapsed(new Date(selected.started_at).getTime(), now) : "—";

  return (
    <div className="min-h-screen bg-bg-deep text-white">
      <header className="sticky top-0 z-30 bg-bg-deep/85 backdrop-blur-xl border-b border-hairline">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="lg:hidden text-white/60 hover:text-white">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-alert/15 border border-alert/30 flex items-center justify-center">
                <Radio className="size-4 text-alert" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">SafePath Operations</p>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Tactical command</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-white/55">
            <span className="hidden md:flex items-center gap-1.5"><Wifi className="size-3" /> Realtime feed</span>
            <span className="size-2 rounded-full bg-safe animate-pulse" />
            <span>OPS-NODE-01</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active incident list */}
        <div className="lg:col-span-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-alert flex items-center gap-2">
              <span className={`size-1.5 rounded-full ${incidents.length ? "bg-alert animate-pulse" : "bg-safe"}`} />
              {incidents.length} active incident{incidents.length === 1 ? "" : "s"}
            </p>
            <h1 className="text-3xl font-bold tracking-tight mt-1">
              {selected ? <>INC-{selected.id.slice(0, 8).toUpperCase()}</> : "All clear"}
            </h1>
            <p className="text-xs text-white/50 mt-1 font-mono">
              {selected ? <>Elapsed {elapsed} · trigger: {selected.trigger_method ?? "manual"}</> : "No active distress signals."}
            </p>
          </div>
          {incidents.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {incidents.map((i) => (
                <button key={i.id} onClick={() => setSelectedId(i.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${selected?.id === i.id ? "bg-alert/15 border-alert/40 text-alert" : "bg-white/[0.04] border-hairline text-white/55"}`}>
                  INC-{i.id.slice(0, 6).toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 rounded-3xl bg-surface/40 border border-hairline overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-hairline">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-alert" />
              <h2 className="text-sm font-semibold">Live route + predicted corridors</h2>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/45">
              <Legend dot="bg-alert" label="active" />
              <Legend dot="bg-amber" label="predicted" />
              <span>{pings.length} pings</span>
            </div>
          </div>
          <TacticalMap className="h-[420px] rounded-none border-0" />
          <div className="grid grid-cols-3 gap-px bg-hairline">
            <Stat l="Coordinates" v={selected?.last_lat != null && selected.last_lng != null
              ? `${selected.last_lat.toFixed(4)}, ${selected.last_lng.toFixed(4)}` : "—"} />
            <Stat l="Speed" v={selected?.last_speed != null ? `${(selected.last_speed * 3.6).toFixed(0)} km/h` : "—"} />
            <Stat l="Heading" v={selected?.last_heading != null ? `${selected.last_heading.toFixed(0)}°` : "—"} />
          </div>
        </div>

        {/* Prediction + actions */}
        <div className="rounded-3xl bg-surface/40 border border-hairline p-5 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">AI route prediction</p>
            <div className="space-y-3">
              <Prediction label="Birnin Gwari forest" pct={82} tone="alert" est="ETA 41 min" />
              <Prediction label="Rural Kaduna corridor" pct={14} tone="amber" est="ETA 28 min" />
              <Prediction label="Zamfara forest zone" pct={4} tone="white" est="ETA 1 h 12 min" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">Recommended response</p>
            <div className="rounded-2xl bg-alert/8 border border-alert/25 p-4">
              <p className="text-xs text-white/85 leading-relaxed">
                Deploy QRT Bravo to <span className="text-alert font-semibold">Interception point #4</span> on the Birnin Gwari approach.
              </p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-alert text-white text-[11px] font-bold uppercase tracking-widest hover:bg-alert/90 transition">
                  Dispatch QRT
                </button>
                <button className="px-3 rounded-xl bg-white/5 border border-hairline-strong text-[11px] font-bold uppercase tracking-widest text-white/75 hover:bg-white/10 transition">
                  Drone
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">Notified assets</p>
            <div className="flex flex-wrap gap-2">
              {["HQ_DISPATCH", "LOC_POLICE", "QRT_BRAVO", "FAMILY"].map((a) => (
                <span key={a} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-safe-soft border border-safe/25 text-safe">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live ping timeline */}
        <div className="lg:col-span-2 rounded-3xl bg-surface/40 border border-hairline p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-4 text-amber" />
            <h2 className="text-sm font-semibold">Live ping stream</h2>
            <span className="text-[10px] font-mono text-white/40 ml-2">{pings.length} captured</span>
          </div>
          {pings.length === 0 ? (
            <p className="text-[11px] font-mono text-white/40 py-8 text-center">Waiting for telemetry…</p>
          ) : (
            <div className="space-y-3 border-l border-hairline ml-2 pl-5 relative max-h-[420px] overflow-y-auto">
              {pings.slice().reverse().slice(0, 50).map((p, i) => (
                <div key={p.id} className="relative">
                  <div className={`absolute -left-[26px] top-1 size-2.5 rounded-full ring-4 ring-bg-deep ${i === 0 ? "bg-alert animate-pulse" : "bg-white/40"}`} />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-xs text-white/85 font-mono">{p.lat.toFixed(5)}, {p.lng.toFixed(5)} {p.speed != null && `· ${(p.speed * 3.6).toFixed(0)} km/h`}</p>
                    <p className="text-[10px] font-mono text-white/35">{new Date(p.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All incidents */}
        <div className="rounded-3xl bg-surface/40 border border-hairline p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-4 text-amber" />
            <h2 className="text-sm font-semibold">Active subjects</h2>
          </div>
          {incidents.length === 0 ? (
            <p className="text-[11px] font-mono text-white/40">No active incidents.</p>
          ) : (
            <div className="space-y-2.5">
              {incidents.map((i) => <IncidentRow key={i.id} inc={i} selected={selected?.id === i.id} onClick={() => setSelectedId(i.id)} now={now} />)}
            </div>
          )}
          <div className="mt-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1"><AlertOctagon className="size-3" /> Regional hotspots</h3>
            <div className="space-y-2 text-xs">
              <Zone n="Birnin Gwari" l="SEVERE" t="alert" w={100} />
              <Zone n="Abuja–Kaduna Expy" l="SEVERE" t="alert" w={95} />
              <Zone n="Rural Kaduna" l="HIGH" t="amber" w={65} />
              <Zone n="Central district" l="CLEAR" t="safe" w={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentRow({ inc, selected, onClick, now }: { inc: Incident; selected: boolean; onClick: () => void; now: number }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border ${selected ? "bg-alert/10 border-alert/30" : "bg-white/[0.03] border-hairline"}`}>
      <div>
        <p className="text-xs font-semibold">INC-{inc.id.slice(0, 8).toUpperCase()}</p>
        <p className="text-[10px] font-mono text-white/45">{inc.trigger_method ?? "manual"}</p>
      </div>
      <span className="text-[10px] font-mono text-alert">{formatElapsed(new Date(inc.started_at).getTime(), now)}</span>
    </button>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="bg-surface/60 p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{l}</p>
      <p className="text-sm font-semibold font-mono mt-1">{v}</p>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${dot}`} />{label}</span>;
}

function Prediction({ label, pct, tone, est }: { label: string; pct: number; tone: "alert" | "amber" | "white"; est: string }) {
  const bar = tone === "alert" ? "bg-alert" : tone === "amber" ? "bg-amber" : "bg-white/40";
  const text = tone === "alert" ? "text-alert" : tone === "amber" ? "text-amber" : "text-white/60";
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-white/90">{label}</span><span className={`font-mono ${text}`}>{pct}%</span></div>
      <div className="h-1 w-full bg-white/5 mt-1.5 rounded-full overflow-hidden"><div className={`h-full ${bar}`} style={{ width: `${pct}%` }} /></div>
      <p className="text-[10px] font-mono text-white/35 mt-1">{est}</p>
    </div>
  );
}

function Zone({ n, l, t, w }: { n: string; l: string; t: "alert" | "amber" | "safe"; w: number }) {
  const text = t === "alert" ? "text-alert" : t === "amber" ? "text-amber" : "text-safe";
  const bg = t === "alert" ? "bg-alert" : t === "amber" ? "bg-amber" : "bg-safe";
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-hairline">
      <span className="text-white/85">{n}</span>
      <div className="flex items-center gap-2">
        <div className="h-1 w-10 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${bg}`} style={{ width: `${w}%` }} /></div>
        <span className={`text-[10px] font-mono font-bold ${text}`}>{l}</span>
      </div>
    </div>
  );
}
