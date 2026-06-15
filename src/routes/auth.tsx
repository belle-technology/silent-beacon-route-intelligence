import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "SafePath AI — Sign in" },
      { name: "description", content: "Sign in to SafePath AI to enable silent distress signaling and live tracking." },
    ],
  }),
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName || email },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) setErr(res.error.message ?? "Google sign-in failed");
    else if (!res.redirected) navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-bg-deep">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-14 rounded-2xl bg-alert/10 border border-alert/30 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(255,59,48,0.18)]">
            <Shield className="size-6 text-alert" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SafePath AI</h1>
          <p className="text-[12px] text-white/55 mt-1.5 max-w-[280px] leading-relaxed">
            {mode === "signup" ? "Create your guardian profile" : "Sign in to your guardian profile"}
          </p>
        </div>

        <button
          onClick={google}
          className="w-full mb-4 py-3 rounded-2xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-white/90 transition"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-hairline" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/35">or email</span>
          <div className="flex-1 h-px bg-hairline" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <Field icon={<Shield className="size-4" />} placeholder="Full name" value={fullName} onChange={setFullName} />
          )}
          <Field icon={<Mail className="size-4" />} placeholder="Email" type="email" value={email} onChange={setEmail} required />
          <Field icon={<Lock className="size-4" />} placeholder="Password (min 6)" type="password" value={password} onChange={setPassword} required />

          {err && <p className="text-[11px] text-alert font-mono">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-alert text-white text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition hover:bg-alert/90"
          >
            {busy ? "..." : mode === "signup" ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="text-center text-[12px] text-white/55 mt-6">
          {mode === "signup" ? "Already have an account? " : "New to SafePath? "}
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-white font-semibold">
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>

        <p className="text-center text-[10px] font-mono uppercase tracking-[0.22em] text-white/30 mt-8">
          Encrypted · Silent · Always on
        </p>
        <Link to="/" className="hidden">home</Link>
      </div>
    </div>
  );
}

function Field({
  icon, placeholder, type = "text", value, onChange, required,
}: { icon: React.ReactNode; placeholder: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-surface/60 border border-hairline rounded-2xl px-4 py-3 focus-within:border-white/30 transition">
      <span className="text-white/40">{icon}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.75h3.56c2.08-1.92 3.28-4.74 3.28-8.08z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.56-2.75c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
