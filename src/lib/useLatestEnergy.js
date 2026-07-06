import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// Shared hook — fetches the latest energy row every 30s.
// Used by both the live gauges and the 3D house scene (sun brightness).
export const useLatestEnergy = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLatest = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("energy")
        .select("*")
        .order("ts", { ascending: false })
        .limit(1)
        .single();

      if (err) throw err;
      setLatest(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message || "Could not reach Supabase");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  return { latest, loading, error, lastUpdated };
};
