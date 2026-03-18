"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Episode, EpisodeStatus } from "@/types";

export function useEpisodes(seriesId?: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("episodes")
      .select("*")
      .order("created_at", { ascending: false });

    if (seriesId) {
      query = query.eq("series_id", seriesId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setEpisodes((data as Episode[]) || []);
    }
    setLoading(false);
  }, [supabase, seriesId]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const deleteEpisode = useCallback(
    async (id: string) => {
      const { error: err } = await supabase
        .from("episodes")
        .delete()
        .eq("id", id);

      if (err) {
        setError(err.message);
        return false;
      }
      setEpisodes((prev) => prev.filter((e) => e.id !== id));
      return true;
    },
    [supabase]
  );

  const updateEpisodeStatus = useCallback(
    async (id: string, status: EpisodeStatus) => {
      const { error: err } = await supabase
        .from("episodes")
        .update({ status })
        .eq("id", id);

      if (err) {
        setError(err.message);
        return false;
      }
      setEpisodes((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
      return true;
    },
    [supabase]
  );

  return {
    episodes,
    loading,
    error,
    refetch: fetchEpisodes,
    deleteEpisode,
    updateEpisodeStatus,
  };
}

export function useEpisode(id: string) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEpisode() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("episodes")
        .select("*")
        .eq("id", id)
        .single();

      if (err) {
        setError(err.message);
      } else {
        setEpisode(data as Episode);
      }
      setLoading(false);
    }

    if (id) {
      fetchEpisode();
    }
  }, [id, supabase]);

  // Real-time subscription for status changes
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`episode-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "episodes",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setEpisode(payload.new as Episode);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  return { episode, loading, error };
}
