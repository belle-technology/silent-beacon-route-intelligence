import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ChevronRight, Vibrate, KeyRound, Volume2, EyeOff, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Settings" },
      { name: "description", content: "Configure silent triggers, profile and medical information." },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <MobileShell>
      <section className="p-5 space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">Profile</p>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </section>

      <section className="px-5">
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-surface/55 border border-hairline">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-alert via-amber to-cobalt" />
          <div className="flex-1">
            <p className="text-base font-semibold">Adebola Okafor</p>
            <p className="text-[11px] text-white/45 font-mono">SP-77492 · Kaduna</p>
          </div>
          <ChevronRight className="size-4 text-white/40" />
        </div>
      </section>

      <Group title="Silent triggers">
        <Row icon={<Volume2 className="size-4 text-amber" />} title="Triple-press power" sub="Activates within 800 ms" toggle />
        <Row icon={<Vibrate className="size-4 text-amber" />} title="Aggressive shake (3s)" sub="Disabled in low-battery mode" toggle />
        <Row icon={<KeyRound className="size-4 text-amber" />} title="Fake PIN trigger" sub="0000 triggers silent alert" toggle />
        <Row icon={<EyeOff className="size-4 text-amber" />} title="Disguise app icon" sub="Mask as Calculator" />
      </Group>

      <Group title="Medical & profile">
        <Row icon={<Heart className="size-4 text-alert" />} title="Blood group" sub="O+" />
        <Row icon={<Heart className="size-4 text-alert" />} title="Allergies" sub="Penicillin" />
        <Row icon={<Heart className="size-4 text-alert" />} title="Home address" sub="13 Constitution Rd, Kaduna" />
      </Group>

      <div className="px-5 pb-32 mt-2">
        <p className="text-[10px] font-mono text-white/30 text-center tracking-widest">SAFEPATH AI · BUILD 0.1 · ENCRYPTED CHANNEL</p>
      </div>
    </MobileShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 mt-6">
      <h2 className="text-[11px] font-bold uppercase text-white/40 mb-3 tracking-widest">{title}</h2>
      <div className="rounded-3xl bg-surface/50 border border-hairline overflow-hidden divide-y divide-hairline">
        {children}
      </div>
    </section>
  );
}

function Row({ icon, title, sub, toggle }: { icon: React.ReactNode; title: string; sub: string; toggle?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="size-9 rounded-xl bg-white/[0.04] border border-hairline flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90">{title}</p>
        <p className="text-[11px] text-white/45 mt-0.5">{sub}</p>
      </div>
      {toggle ? (
        <div className="h-6 w-10 rounded-full bg-safe/40 relative">
          <div className="size-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow-md" />
        </div>
      ) : (
        <ChevronRight className="size-4 text-white/40" />
      )}
    </div>
  );
}
