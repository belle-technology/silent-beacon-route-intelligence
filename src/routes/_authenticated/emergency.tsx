import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { TacticalMap } from "@/components/TacticalMap";
import { formatElapsed, useEmergency } from "@/lib/safepath-state";
import { ShieldOff, Sparkles, Phone, Wifi, BatteryMedium, Navigation } from "lucide-react";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Emergency active" },
      { name: "description", content: "Emergency mode is live. Location and telemetry are streaming to your responders." },
    ],
  }),
  component: Emergency,
});

const TIMELINE = [
  { t: "00:00", text: "Emergency triggered (silent)", tone: "alert" as const },
  { t: "00:08", text: "Live GPS locked · coords transmitted", tone: "white" as const },
  { t: "00:21", text: "Family + QRT acknowledged alert", tone: "safe" as const },
  { t: "01:04", text: "Movement detected · 45 km/h NW", tone: "amber" as const },
  { t: "01:32", text: "AI: deviation from daily commute", tone: "amber" as const },
  { t: "02:10", text: "Speed spike to 72 km/h", tone: "alert" as const },
];

function Emergency() {
  const { state, disarm } = useEmergency();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const [pin, setPin] = useState("");
  const [disarming, setDisarming] = useState(false);

  useEffect(() => {
    if (!state.active) {
      navigate({ to: "/" });
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.active, navigate]);

  const elapsed = formatElapsed(state.startedAt, now);

  return (
    <MobileShell>
      <section className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-alert/30 pulse-ring" />
          <div className="size-32 rounded-full border-4 border-alert bg-alert/10 flex items-center justify-center shadow-[0_0_60px_rgba(255,59,48,0.45)]">
            <div className="size-4 rounded-full bg-alert animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">Emergency active</h1>
        <p className="text-alert font-mono text-xs mt-1 tracking-widest">
          DISTRESS LEVEL 4 · ELAPSED {elapsed}
        </p>
      </section>

      <section className="px-5 grid grid-cols-2 gap-3">
        <Stat label="Live coordinates" value="6°27′14″N" sub="3°23′52″E" />
        <Stat label="Movement" value="Vehicle" sub="42 km/h · NW" />
        <Stat label="Battery / signal" value="68%" sub="LTE · -102 dBm" icon={<BatteryMedium className="size-3" />} />
        <Stat label="Network" value="ENCRYPTED" sub="cloud sync ok" icon={<Wifi className="size-3" />} />
      </section>

      <section className="px-5 mt-5">
        <h2 className="text-[11px] font-bold uppercase text-white/40 mb-2 tracking-widest">Responders notified</h2>
        <div className="flex flex-wrap gap-2">
          <Chip tone="safe">Family · 3</Chip>
          <Chip tone="safe">QRT Bravo</Chip>
          <Chip tone="amber">Local police</Chip>
          <Chip tone="white">Private security</Chip>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface/60 border border-hairline overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-hairline">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-amber" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber">AI route prediction</span>
            </div>
            <span className="text-[10px] font-mono text-white/40">updating · 8s</span>
          </div>
          <TacticalMap variant="alert" className="h-44" />
          <div className="p-5 space-y-3">
            <PredictionRow label="Birnin Gwari forest" pct={82} tone="alert" />
            <PredictionRow label="Rural Kaduna corridor" pct={14} tone="amber" />
            <PredictionRow label="Zamfara forest zone" pct={4} tone="white" />
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h2 className="text-[11px] font-bold uppercase text-white/40 mb-3 tracking-widest">Incident timeline</h2>
        <div className="space-y-4 border-l border-hairline ml-2 pl-5 relative">
          {TIMELINE.map((e, i) => (
            <div key={i} className="relative">
              <div
                className={`absolute -left-[26px] top-1 size-2.5 rounded-full ring-4 ring-bg-deep ${
                  e.tone === "alert"
                    ? "bg-alert"
                    : e.tone === "amber"
                    ? "bg-amber"
                    : e.tone === "safe"
                    ? "bg-safe"
                    : "bg-white/40"
                }`}
              />
              <p className="text-[10px] font-mono text-white/35">T+{e.t}</p>
              <p className="text-xs text-white/85">{e.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 pb-32">
        <div className="rounded-3xl border border-hairline bg-surface/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldOff className="size-4 text-white/60" />
            <h3 className="text-sm font-semibold">Hidden disarm</h3>
          </div>
          <p className="text-[11px] text-white/45 leading-relaxed mb-4">
            Enter your 4-digit safe PIN to stop transmission. A duress PIN keeps the alert running silently.
          </p>
          {!disarming ? (
            <button
              onClick={() => setDisarming(true)}
              className="w-full py-3 rounded-xl bg-white/5 border border-hairline-strong text-[11px] font-mono uppercase tracking-widest text-white/70 hover:bg-white/10 transition"
            >
              Enter safe PIN
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="••••"
                className="flex-1 bg-bg-deep border border-hairline-strong rounded-xl px-4 py-3 font-mono tracking-[0.4em] text-center text-white outline-none focus:border-alert/60"
              />
              <button
                onClick={() => {
                  if (pin.length === 4) {
                    disarm();
                    navigate({ to: "/" });
                  }
                }}
                className="px-4 rounded-xl bg-alert text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                disabled={pin.length !== 4}
              >
                Disarm
              </button>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-white/30">
            <span>Session #{(state.startedAt ?? 0).toString().slice(-6)}</span>
            <span className="flex items-center gap-1"><Phone className="size-3" /> SMS fallback armed</span>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-surface/50 border border-hairline rounded-2xl p-3.5">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-white/40 font-mono">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold mt-1.5 font-mono">{value}</div>
      <div className="text-[11px] text-white/50 font-mono">{sub}</div>
    </div>
  );
}

function Chip({ tone, children }: { tone: "safe" | "amber" | "alert" | "white"; children: React.ReactNode }) {
  const m: Record<string, string> = {
    safe: "bg-safe-soft text-safe border-safe/25",
    amber: "bg-amber-soft text-amber border-amber/25",
    alert: "bg-alert-soft text-alert border-alert/30",
    white: "bg-white/[0.06] text-white/80 border-hairline-strong",
  };
  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${m[tone]}`}>
      {children}
    </span>
  );
}

function PredictionRow({ label, pct, tone }: { label: string; pct: number; tone: "alert" | "amber" | "white" }) {
  const bar = tone === "alert" ? "bg-alert" : tone === "amber" ? "bg-amber" : "bg-white/40";
  const text = tone === "alert" ? "text-alert" : tone === "amber" ? "text-amber" : "text-white/60";
  return (
    <div className="flex items-center gap-3">
      <Navigation className={`size-3.5 ${text}`} />
      <div className="flex-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/85">{label}</span>
          <span className={`font-mono ${text}`}>{pct}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 mt-1 rounded-full overflow-hidden">
          <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
