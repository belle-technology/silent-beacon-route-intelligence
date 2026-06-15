import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Shield, Map, Users, Settings, Radio } from "lucide-react";
import { useEmergency } from "@/lib/safepath-state";

const tabs = [
  { to: "/", label: "Shield", icon: Shield },
  { to: "/map", label: "Map", icon: Map },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/dashboard", label: "Ops", icon: Radio },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state, trigger } = useEmergency();

  return (
    <div className="min-h-screen flex justify-center bg-bg-deep">
      <div className="w-full max-w-[420px] min-h-screen bg-bg-deep flex flex-col relative">
        <header className="px-6 py-4 flex justify-between items-center border-b border-hairline bg-bg-deep/70 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div
                className={`absolute size-3 rounded-full blur-[4px] animate-pulse ${
                  state.active ? "bg-alert" : "bg-safe"
                }`}
              />
              <div className={`size-2 rounded-full relative ${state.active ? "bg-alert" : "bg-safe"}`} />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-white/90">
              {state.active ? "Emergency transmitting" : "Guardian is active"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/50">
            <span className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-white/40" /> GPS
            </span>
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">98%</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 scrollbar-hide">{children}</main>

        {!state.active && pathname !== "/emergency" && (
          <button
            aria-label="Trigger SOS"
            onClick={() => trigger("sos-button")}
            className="fixed bottom-24 right-6 z-50 size-14 rounded-full bg-alert/20 border border-alert/30 flex items-center justify-center backdrop-blur-md shadow-2xl active:scale-95 transition-transform"
            style={{ right: "max(1.5rem, calc(50vw - 210px + 1.5rem))" }}
          >
            <span className="size-9 rounded-full bg-alert flex items-center justify-center shadow-[0_0_24px_rgba(255,59,48,0.5)]">
              <span className="text-white text-[11px] font-bold tracking-wider">SOS</span>
            </span>
          </button>
        )}

        <nav className="fixed bottom-0 w-full max-w-[420px] h-20 bg-bg-deep/90 backdrop-blur-2xl border-t border-hairline px-4 flex justify-between items-center z-40">
          {tabs.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex flex-col items-center gap-1.5 flex-1 py-2"
              >
                <Icon
                  className={`size-4 transition-colors ${active ? "text-white" : "text-white/30"}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                    active ? "text-white" : "text-white/30"
                  }`}
                >
                  {t.label}
                </span>
                {active && (
                  <div className="absolute bottom-2 size-1 rounded-full bg-safe shadow-[0_0_8px_rgba(52,199,89,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
