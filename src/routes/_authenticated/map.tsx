import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { TacticalMap } from "@/components/TacticalMap";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Risk map" },
      { name: "description", content: "Live tactical map with risk heatmap and predicted abduction corridors." },
    ],
  }),
  component: MapPage,
});

const ZONES = [
  { name: "Birnin Gwari forest", level: "Severe", tone: "alert", incidents: 124 },
  { name: "Abuja–Kaduna expressway", level: "Severe", tone: "alert", incidents: 98 },
  { name: "Rural Kaduna corridor", level: "High", tone: "amber", incidents: 41 },
  { name: "Zamfara north", level: "High", tone: "amber", incidents: 36 },
  { name: "Central district", level: "Low", tone: "safe", incidents: 4 },
];

function MapPage() {
  return (
    <MobileShell>
      <section className="p-5 space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">Tactical view</p>
        <h1 className="text-2xl font-bold tracking-tight">Risk map</h1>
        <p className="text-xs text-white/55">Predicted corridors and historic kidnapping density.</p>
      </section>

      <section className="px-5">
        <TacticalMap variant="alert" className="h-72" />
        <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-white/55">
          <Legend dot="bg-alert" label="Severe" />
          <Legend dot="bg-amber" label="High" />
          <Legend dot="bg-safe" label="Low" />
        </div>
      </section>

      <section className="px-5 mt-6 pb-32">
        <h2 className="text-[11px] font-bold uppercase text-white/40 mb-3 tracking-widest">Hotspot intelligence</h2>
        <div className="space-y-2.5">
          {ZONES.map((z) => {
            const text =
              z.tone === "alert" ? "text-alert" : z.tone === "amber" ? "text-amber" : "text-safe";
            const bg =
              z.tone === "alert" ? "bg-alert" : z.tone === "amber" ? "bg-amber" : "bg-safe";
            return (
              <div key={z.name} className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-hairline">
                <div>
                  <p className="text-sm text-white/90">{z.name}</p>
                  <p className="text-[10px] font-mono text-white/40 mt-0.5">{z.incidents} recorded incidents</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-14 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${bg}`} style={{ width: z.tone === "alert" ? "100%" : z.tone === "amber" ? "65%" : "18%" }} />
                  </div>
                  <span className={`text-[10px] font-bold font-mono ${text}`}>{z.level.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MobileShell>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
