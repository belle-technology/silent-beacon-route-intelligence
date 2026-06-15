import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

/** Victim-side: manage current user's own emergency (incident + live GPS pings). */
export function useEmergency() {
  const [userId, setUserId] = useState<string | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const incidentRef = useRef<Incident | null>(null);
  incidentRef.current = incident;

  // Load session + active incident
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: inc } = await supabase
          .from("incidents")
          .select("*")
          .eq("user_id", uid)
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (mounted) setIncident((inc as Incident | null) ?? null);
      }
      if (mounted) setLoading(false);
    });
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  // Realtime listen on own incident
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`own-incidents-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Incident | undefined;
          if (!row) return;
          if (row.status === "active") setIncident(row);
          else if (incidentRef.current?.id === row.id) setIncident(null);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // GPS streaming while active
  useEffect(() => {
    if (!incident || !userId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const sendPing = async (pos: GeolocationPosition) => {
      const cur = incidentRef.current;
      if (!cur) return;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const speed = pos.coords.speed ?? null;
      const heading = pos.coords.heading ?? null;
      const accuracy = pos.coords.accuracy ?? null;
      let battery: number | null = null;
      try {
        // @ts-expect-error battery api not in lib
        const b = await navigator.getBattery?.();
        if (b) battery = Math.round(b.level * 100);
      } catch { /* noop */ }
      await supabase.from("location_pings").insert({
        incident_id: cur.id, user_id: userId, lat, lng, speed, heading, accuracy, battery,
      });
      await supabase.from("incidents").update({
        last_lat: lat, last_lng: lng, last_speed: speed, last_heading: heading,
      }).eq("id", cur.id);
    };

    const id = navigator.geolocation.watchPosition(sendPing, undefined, {
      enableHighAccuracy: true, maximumAge: 5000, timeout: 20000,
    });
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [incident?.id, userId]);

  const trigger = useCallback(async (method: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("incidents")
      .insert({ user_id: userId, trigger_method: method, status: "active" })
      .select("*")
      .single();
    if (!error && data) setIncident(data as Incident);
  }, [userId]);

  const disarm = useCallback(async () => {
    const cur = incidentRef.current;
    if (!cur) return;
    await supabase.from("incidents").update({ status: "resolved", ended_at: new Date().toISOString() }).eq("id", cur.id);
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

/** Responder-side: subscribe to all active incidents + their latest pings. */
export function useActiveIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("*")
        .eq("status", "active")
        .order("started_at", { ascending: false });
      if (mounted) setIncidents((data as Incident[]) ?? []);
    };
    load();
    const ch = supabase
      .channel("ops-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  return incidents;
}

export function useIncidentPings(incidentId: string | null) {
  const [pings, setPings] = useState<Ping[]>([]);
  useEffect(() => {
    if (!incidentId) { setPings([]); return; }
    let mounted = true;
    supabase
      .from("location_pings")
      .select("*")
      .eq("incident_id", incidentId)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (mounted) setPings((data as Ping[]) ?? []); });
    const ch = supabase
      .channel(`pings-${incidentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "location_pings", filter: `incident_id=eq.${incidentId}` },
        (payload) => setPings((p) => [...p, payload.new as Ping])
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
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
