import { useCallback, useEffect, useRef, useState } from "react";

export type Incident = {
  id: string;
  user_id: string;
  status: "active" | "resolved";
  trigger_method: string | null;
  started_at: string;
  ended_at: string | null;
  last_lat: number | null;
  last_lng: number | null;
  last_speed: number | null;
  last_heading: number | null;
};

export type Ping = {
  id: number;
  incident_id: string;
  user_id: string;
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  battery: number | null;
  created_at: string;
};

const INCIDENT_KEY = "safepath.currentIncident";
const PINGS_KEY = "safepath.locationPings";
const LOCAL_USER_ID = "local-guardian";
const INCIDENT_EVENT = "safepath:incident-change";
const PINGS_EVENT = "safepath:pings-change";

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readIncident(): Incident | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INCIDENT_KEY);
    return raw ? (JSON.parse(raw) as Incident) : null;
  } catch {
    return null;
  }
}

function writeIncident(incident: Incident | null) {
  if (typeof window === "undefined") return;
  if (incident) window.localStorage.setItem(INCIDENT_KEY, JSON.stringify(incident));
  else window.localStorage.removeItem(INCIDENT_KEY);
  window.dispatchEvent(new CustomEvent(INCIDENT_EVENT));
}

function readPings(): Ping[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PINGS_KEY);
    return raw ? (JSON.parse(raw) as Ping[]) : [];
  } catch {
    return [];
  }
}

function writePings(pings: Ping[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PINGS_KEY, JSON.stringify(pings.slice(-250)));
  window.dispatchEvent(new CustomEvent(PINGS_EVENT));
}

async function getBatteryLevel(): Promise<number | null> {
  try {
    const batteryApi = (navigator as Navigator & { getBattery?: () => Promise<{ level: number }> }).getBattery;
    const battery = await batteryApi?.();
    return battery ? Math.round(battery.level * 100) : null;
  } catch {
    return null;
  }
}

function appendPing(
  incident: Incident,
  coords: { lat: number; lng: number; speed?: number | null; heading?: number | null; accuracy?: number | null },
  battery: number | null,
) {
  const ping: Ping = {
    id: Date.now(),
    incident_id: incident.id,
    user_id: LOCAL_USER_ID,
    lat: coords.lat,
    lng: coords.lng,
    speed: coords.speed ?? null,
    heading: coords.heading ?? null,
    accuracy: coords.accuracy ?? null,
    battery,
    created_at: new Date().toISOString(),
  };
  writePings([...readPings(), ping]);
  writeIncident({
    ...incident,
    last_lat: ping.lat,
    last_lng: ping.lng,
    last_speed: ping.speed,
    last_heading: ping.heading,
  });
}

/** Victim-side: manage emergency mode without requiring sign-in. */
export function useEmergency() {
  const [userId] = useState<string | null>(LOCAL_USER_ID);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);
  const ownsStreamRef = useRef(false);
  const incidentRef = useRef<Incident | null>(null);
  incidentRef.current = incident;

  useEffect(() => {
    const sync = () => {
      setIncident(readIncident());
      setLoading(false);
    };
    sync();
    window.addEventListener(INCIDENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(INCIDENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!incident || !userId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (fallbackIntervalRef.current !== null) {
        window.clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      return;
    }
    if (typeof window === "undefined" || !navigator.geolocation) return;
    const globalWindow = window as Window & { __safepath_streaming?: string };
    if (globalWindow.__safepath_streaming === incident.id) return;
    globalWindow.__safepath_streaming = incident.id;
    ownsStreamRef.current = true;

    const sendPing = async (pos: GeolocationPosition) => {
      const cur = incidentRef.current;
      if (!cur) return;
      appendPing(cur, {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        speed: pos.coords.speed ?? null,
        heading: pos.coords.heading ?? null,
        accuracy: pos.coords.accuracy ?? null,
      }, await getBatteryLevel());
    };

    const startFallback = () => {
      if (fallbackIntervalRef.current !== null) return;
      fallbackIntervalRef.current = window.setInterval(async () => {
        const cur = incidentRef.current;
        if (!cur) return;
        const step = readPings().filter((p) => p.incident_id === cur.id).length;
        appendPing(cur, {
          lat: 10.5264 + step * 0.0027,
          lng: 7.4386 - step * 0.0031,
          speed: 12 + (step % 4),
          heading: 318,
          accuracy: 35,
        }, await getBatteryLevel());
      }, 5000);
    };

    const id = navigator.geolocation.watchPosition(sendPing, startFallback, {
      enableHighAccuracy: true, maximumAge: 5000, timeout: 12000,
    });
    watchIdRef.current = id;
    startFallback();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (fallbackIntervalRef.current !== null) window.clearInterval(fallbackIntervalRef.current);
      watchIdRef.current = null;
      fallbackIntervalRef.current = null;
      if (ownsStreamRef.current && globalWindow.__safepath_streaming === incident.id) {
        delete globalWindow.__safepath_streaming;
      }
      ownsStreamRef.current = false;
    };
  }, [incident?.id, userId]);

  const trigger = useCallback(async (method: string) => {
    const next: Incident = {
      id: makeId(),
      user_id: LOCAL_USER_ID,
      status: "active",
      trigger_method: method,
      started_at: new Date().toISOString(),
      ended_at: null,
      last_lat: null,
      last_lng: null,
      last_speed: null,
      last_heading: null,
    };
    writeIncident(next);
    setIncident(next);
  }, []);

  const disarm = useCallback(async () => {
    const cur = incidentRef.current;
    if (!cur) return;
    writeIncident({ ...cur, status: "resolved", ended_at: new Date().toISOString() });
    writeIncident(null);
    setIncident(null);
  }, []);

  return {
    state: {
      active: !!incident,
      startedAt: incident ? new Date(incident.started_at).getTime() : null,
      triggerMethod: incident?.trigger_method ?? null,
      incidentId: incident?.id ?? null,
    },
    incident,
    loading,
    userId,
    trigger,
    disarm,
  };
}

/** Responder-side: subscribe to locally active incidents + their latest pings. */
export function useActiveIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const load = () => {
      const inc = readIncident();
      setIncidents(inc?.status === "active" ? [inc] : []);
    };
    load();
    window.addEventListener(INCIDENT_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(INCIDENT_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return incidents;
}

export function useIncidentPings(incidentId: string | null) {
  const [pings, setPings] = useState<Ping[]>([]);
  useEffect(() => {
    const load = () => {
      if (!incidentId) {
        setPings([]);
        return;
      }
      setPings(readPings().filter((p) => p.incident_id === incidentId));
    };
    load();
    window.addEventListener(PINGS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(PINGS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [incidentId]);
  return pings;
}

export function formatElapsed(startedAt: number | null, now: number) {
  if (!startedAt) return "00:00";
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
