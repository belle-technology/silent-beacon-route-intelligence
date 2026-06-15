import { useEffect, useState, useCallback } from "react";

export type DistressLevel = "monitoring" | "elevated" | "critical";

export type EmergencyState = {
  active: boolean;
  startedAt: number | null;
  triggerMethod: string | null;
};

const KEY = "safepath.emergency";

function read(): EmergencyState {
  if (typeof window === "undefined") return { active: false, startedAt: null, triggerMethod: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { active: false, startedAt: null, triggerMethod: null };
    return JSON.parse(raw);
  } catch {
    return { active: false, startedAt: null, triggerMethod: null };
  }
}

function write(s: EmergencyState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("safepath:emergency", { detail: s }));
}

export function useEmergency() {
  const [state, setState] = useState<EmergencyState>({ active: false, startedAt: null, triggerMethod: null });

  useEffect(() => {
    setState(read());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<EmergencyState>).detail;
      if (detail) setState(detail);
      else setState(read());
    };
    window.addEventListener("safepath:emergency", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("safepath:emergency", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const trigger = useCallback((method: string) => {
    const next: EmergencyState = { active: true, startedAt: Date.now(), triggerMethod: method };
    write(next);
  }, []);

  const disarm = useCallback(() => {
    const next: EmergencyState = { active: false, startedAt: null, triggerMethod: null };
    write(next);
  }, []);

  return { state, trigger, disarm };
}

export function formatElapsed(startedAt: number | null, now: number) {
  if (!startedAt) return "00:00";
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
