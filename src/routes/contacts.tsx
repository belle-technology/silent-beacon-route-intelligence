import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Plus, Phone, MessageSquare, Shield } from "lucide-react";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Trusted contacts" },
      { name: "description", content: "Family, responders and private security alerted on emergency." },
    ],
  }),
  component: Contacts,
});

const CONTACTS = [
  { name: "Amaka (sister)", role: "Family · primary", phone: "+234 803 ••• 4421", tone: "safe" },
  { name: "Dad", role: "Family", phone: "+234 805 ••• 1102", tone: "safe" },
  { name: "QRT Bravo dispatch", role: "Private security", phone: "+234 700 ••• 0099", tone: "amber" },
  { name: "Inspector Bello", role: "Law enforcement liaison", phone: "+234 802 ••• 5512", tone: "alert" },
];

function Contacts() {
  return (
    <MobileShell>
      <section className="p-5 space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">Alert chain</p>
        <h1 className="text-2xl font-bold tracking-tight">Trusted contacts</h1>
        <p className="text-xs text-white/55">Alerted instantly the moment emergency mode begins.</p>
      </section>

      <section className="px-5 space-y-2.5">
        {CONTACTS.map((c) => {
          const dot =
            c.tone === "safe" ? "bg-safe" : c.tone === "amber" ? "bg-amber" : "bg-alert";
          return (
            <div key={c.name} className="flex items-center gap-4 p-4 rounded-3xl bg-surface/55 border border-hairline">
              <div className={`size-10 rounded-2xl bg-white/[0.04] border border-hairline-strong flex items-center justify-center`}>
                <Shield className="size-4 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{c.name}</p>
                <p className="text-[11px] text-white/45">{c.role}</p>
                <p className="text-[11px] font-mono text-white/60 mt-0.5">{c.phone}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`size-1.5 rounded-full ${dot}`} />
                <div className="flex gap-1.5">
                  <IconBtn><Phone className="size-3.5" /></IconBtn>
                  <IconBtn><MessageSquare className="size-3.5" /></IconBtn>
                </div>
              </div>
            </div>
          );
        })}

        <button className="w-full mt-3 py-4 rounded-3xl border border-dashed border-hairline-strong text-white/60 text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/[0.03] transition">
          <Plus className="size-4" /> Add trusted contact
        </button>
      </section>

      <section className="px-5 mt-6 pb-32">
        <div className="rounded-3xl bg-amber-soft border border-amber/25 p-5">
          <h3 className="text-sm font-semibold text-amber">Offline SMS fallback</h3>
          <p className="text-[11px] text-white/65 mt-1 leading-relaxed">
            If mobile data fails, SafePath silently sends GPS + distress code over SMS to every contact above. Re-syncs automatically when online.
          </p>
        </div>
      </section>
    </MobileShell>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="size-7 rounded-lg bg-white/[0.06] border border-hairline-strong flex items-center justify-center text-white/70 hover:text-white">
      {children}
    </button>
  );
}
