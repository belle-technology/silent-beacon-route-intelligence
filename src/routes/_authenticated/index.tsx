import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useEmergency } from "@/lib/safepath-state";
import { ChevronRight, Timer, EyeOff, Activity, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Guardian standby" },
      { name: "description", content: "Silent emergency trigger, live tracking and AI route prediction in one mobile-first platform." },
    ],
  }),
  component: Standby,
});

function Standby() {
  const { state } = useEmergency();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.active) navigate({ to: "/emergency" });
  }, [state.active, navigate]);

  return (
    <MobileShell>
      <section className="p-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-safe/5 blur-3xl scale-150" />
          <div className="absolute inset-0 rounded-full bg-amber/5 blur-2xl" />
          <div className="size-44 rounded-full border border-hairline-strong flex items-center justify-center relative bg-surface/40 backdrop-blur-sm shadow-2xl">
            <div className="size-32 rounded-full border border-safe/25 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-safe/80 mb-1">Current state</span>
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                YOU'RE SAFE
              </span>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-white/55 max-w-[260px] leading-relaxed">
          Monitoring your route to <span className="text-white/85 font-medium">Home</span>. Shake your phone or tap SOS if you feel uneasy.
        </p>
      </section>

      <section className="px-5 grid grid-cols-2 gap-3">
        <ActionCard
          tone="amber"
          icon={<Timer className="size-4 text-amber" />}
          title="Safety Timer"
          subtitle="Auto-alert if you don't check in."
        />
        <ActionCard
          tone="safe"
          icon={<EyeOff className="size-4 text-safe" />}
          title="Hide Mode"
          subtitle="Disguise app as a calculator."
        />
      </section>

      <section className="p-5 mt-4">
        <Link to="/map" className="block">
          <div className="bg-surface/50 rounded-[28px] border border-hairline overflow-hidden backdrop-blur-md">
            <div className="px-6 py-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Route insight</span>
                <span className="text-sm font-semibold mt-0.5">Kaduna corridor</span>
              </div>
              <span className="text-[10px] bg-alert-soft text-alert border border-alert/25 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Live alert
              </span>
            </div>
            <div className="px-6 pb-5 space-y-4">
              <Telemetry />
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-hairline">
                <div className="text-left">
                  <p className="text-[10px] text-white/40 uppercase font-mono mb-0.5">Smart analysis</p>
                  <p className="text-xs text-white/85">Vehicle deviated 2.4 km from regular path</p>
                </div>
                <p className="text-xs font-bold text-amber font-mono">High risk</p>
              </div>
              <div className="flex items-center justify-end text-[11px] text-white/40 gap-1">
                Open live map <ChevronRight className="size-3" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="px-5 pb-32">
        <h2 className="text-[11px] font-bold uppercase text-white/30 mb-3 tracking-widest px-1">Safety outlook</h2>
        <div className="space-y-2.5">
          <Outlook name="Abuja Expressway" tone="alert" pct={100} label="ACTIVE" />
          <Outlook name="Birnin Gwari forest" tone="amber" pct={70} label="ELEVATED" />
          <Outlook name="Central district" tone="safe" pct={15} label="CLEAR" />
        </div>
      </section>
    </MobileShell>
  );
}

function ActionCard({
  tone,
  icon,
  title,
  subtitle,
}: {
  tone: "amber" | "safe";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const ring =
    tone === "amber"
      ? "bg-amber-soft border-amber/25"
      : "bg-safe-soft border-safe/25";
  return (
    <div className="p-5 rounded-3xl bg-surface/60 border border-hairline flex flex-col gap-4">
      <div className={`size-10 rounded-2xl flex items-center justify-center border ${ring}`}>{icon}</div>
      <div className="text-left">
        <h3 className="text-[13px] font-semibold text-white/90">{title}</h3>
        <p className="text-[11px] text-white/45 mt-1 leading-snug">{subtitle}</p>
      </div>
    </div>
  );
}

function Telemetry() {
  return (
    <div className="grid grid-cols-3 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
      {[
        { label: "Speed", value: "42 km/h", icon: <Activity className="size-3" /> },
        { label: "Heading", value: "NW", icon: <Zap className="size-3" /> },
        { label: "Battery", value: "84%", icon: null },
      ].map((s) => (
        <div key={s.label} className="bg-surface/60 p-3 flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-widest text-white/35 font-mono flex items-center gap-1">
            {s.icon}
            {s.label}
          </span>
          <span className="text-xs font-mono text-white/90">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

function Outlook({ name, tone, pct, label }: { name: string; tone: "alert" | "amber" | "safe"; pct: number; label: string }) {
  const color = tone === "alert" ? "bg-alert text-alert" : tone === "amber" ? "bg-amber text-amber" : "bg-safe text-safe";
  const [bg, text] = color.split(" ");
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/40 border border-hairline">
      <span className="text-sm text-white/85">{name}</span>
      <div className="flex items-center gap-3">
        <div className="h-1 w-14 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${bg}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[10px] font-bold font-mono ${text}`}>{label}</span>
      </div>
    </div>
  );
}



