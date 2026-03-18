"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Series } from "@/types";

export function useSeries() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("series")
      .select("*")
      .order("updated_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setSeriesList((data as Series[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const createSeries = useCallback(
    async (series: Omit<Series, "id" | "created_at" | "updated_at" | "episode_count">) => {
      const { data, error: err } = await supabase
        .from("series")
        .insert(series)
        .select()
        .single();

      if (err) {
        setError(err.message);
        return null;
      }
      setSeriesList((prev) => [data as Series, ...prev]);
      return data as Series;
    },
    [supabase]
  );

  const deleteSeries = useCallback(
    async (id: string) => {
      const { error: err } = await supabase
        .from("series")
        .delete()
        .eq("id", id);

      if (err) {
        setError(err.message);
        return false;
      }
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      return true;
    },
    [supabase]
  );

  const updateSeries = useCallback(
    async (id: string, updates: Partial<Series>) => {
      const { data, error: err } = await supabase
        .from("series")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (err) {
        setError(err.message);
        return null;
      }
      setSeriesList((prev) =>
        prev.map((s) => (s.id === id ? (data as Series) : s))
      );
      return data as Series;
    },
    [supabase]
  );

  return {
    seriesList,
    loading,
    error,
    refetch: fetchSeries,
    createSeries,
    deleteSeries,
    updateSeries,
  };
}
