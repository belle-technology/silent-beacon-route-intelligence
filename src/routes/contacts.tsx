import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Plus, Phone, MessageSquare, Shield, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Trusted contacts" },
      { name: "description", content: "Family, responders and private security alerted on emergency." },
    ],
  }),
  component: Contacts,
});

type Contact = {
  id: string;
  user_id: string;
  name: string;
  relation: string | null;
  phone: string;
  priority: number;
};

const CONTACTS_KEY = "safepath.trustedContacts";

function readContacts(): Contact[] {
  try {
    const raw = window.localStorage.getItem(CONTACTS_KEY);
    return raw ? (JSON.parse(raw) as Contact[]) : [];
  } catch {
    return [];
  }
}

function writeContacts(contacts: Contact[]) {
  window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setContacts(readContacts().sort((a, b) => a.priority - b.priority));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    setContacts((cs) => {
      const next = cs.filter((c) => c.id !== id);
      writeContacts(next);
      return next;
    });
  }

  return (
    <MobileShell>
      <section className="p-5 space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">Alert chain</p>
        <h1 className="text-2xl font-bold tracking-tight">Trusted contacts</h1>
        <p className="text-xs text-white/55">Alerted instantly the moment emergency mode begins.</p>
      </section>

      <section className="px-5 space-y-2.5">
        {loading ? (
          <p className="text-[11px] font-mono text-white/40 text-center py-6">Loading…</p>
        ) : contacts.length === 0 ? (
          <p className="text-[11px] text-white/45 text-center py-6">No trusted contacts yet. Add your first below.</p>
        ) : (
          contacts.map((c) => {
            const tone = c.priority === 1 ? "safe" : c.priority === 2 ? "amber" : "alert";
            const dot = tone === "safe" ? "bg-safe" : tone === "amber" ? "bg-amber" : "bg-alert";
            return (
              <div key={c.id} className="flex items-center gap-4 p-4 rounded-3xl bg-surface/55 border border-hairline">
                <div className="size-10 rounded-2xl bg-white/[0.04] border border-hairline-strong flex items-center justify-center">
                  <Shield className="size-4 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[11px] text-white/45">{c.relation ?? "Contact"}</p>
                  <p className="text-[11px] font-mono text-white/60 mt-0.5">{c.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`size-1.5 rounded-full ${dot}`} />
                  <div className="flex gap-1.5">
                    <a href={`tel:${c.phone}`} className="size-7 rounded-lg bg-white/[0.06] border border-hairline-strong flex items-center justify-center text-white/70 hover:text-white"><Phone className="size-3.5" /></a>
                    <a href={`sms:${c.phone}`} className="size-7 rounded-lg bg-white/[0.06] border border-hairline-strong flex items-center justify-center text-white/70 hover:text-white"><MessageSquare className="size-3.5" /></a>
                    <button onClick={() => remove(c.id)} className="size-7 rounded-lg bg-white/[0.06] border border-hairline-strong flex items-center justify-center text-white/60 hover:text-alert">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <button
          onClick={() => setAdding(true)}
          className="w-full mt-3 py-4 rounded-3xl border border-dashed border-hairline-strong text-white/60 text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/[0.03] transition"
        >
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

      {adding && <AddDialog onClose={() => setAdding(false)} onAdded={(c) => { setContacts((cs) => [...cs, c]); setAdding(false); }} />}
    </MobileShell>
  );
}

function AddDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (c: Contact) => void }) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Family");
  const [phone, setPhone] = useState("");
  const [priority, setPriority] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const contact: Contact = {
      id: crypto.randomUUID?.() ?? `contact-${Date.now()}`,
      user_id: "local-guardian",
      name,
      relation,
      phone,
      priority,
    };
    writeContacts([...readContacts(), contact]);
    setBusy(false);
    onAdded(contact);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-[400px] bg-surface border border-hairline rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">New trusted contact</h2>
          <button type="button" onClick={onClose}><X className="size-4 text-white/60" /></button>
        </div>
        <Input label="Name" value={name} onChange={setName} required />
        <Input label="Relation" value={relation} onChange={setRelation} />
        <Input label="Phone" value={phone} onChange={setPhone} required type="tel" placeholder="+234..." />
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Priority</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((p) => (
              <button key={p} type="button" onClick={() => setPriority(p)}
                className={`py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border ${priority === p ? "bg-alert/15 border-alert/40 text-alert" : "bg-white/[0.04] border-hairline text-white/55"}`}>
                {p === 1 ? "Primary" : p === 2 ? "Backup" : "Last resort"}
              </button>
            ))}
          </div>
        </div>
        {err && <p className="text-[11px] text-alert font-mono">{err}</p>}
        <button disabled={busy} className="w-full py-3 rounded-2xl bg-alert text-white text-sm font-semibold disabled:opacity-50">
          {busy ? "Saving…" : "Add contact"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="mt-1.5 w-full bg-bg-deep border border-hairline-strong rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
      />
    </div>
  );
}
