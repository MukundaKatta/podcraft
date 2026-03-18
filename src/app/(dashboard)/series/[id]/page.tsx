"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Rss,
  Copy,
  Globe,
  Lock,
  Plus,
  Loader2,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpisodeCard } from "@/components/episodes/episode-card";
import { useEpisodes } from "@/hooks/use-episodes";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Series } from "@/types";

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesId = params.id as string;
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const { episodes, loading: epLoading, deleteEpisode } = useEpisodes(seriesId);
  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchSeries() {
      const { data } = await supabase
        .from("series")
        .select("*")
        .eq("id", seriesId)
        .single();

      setSeries(data as Series | null);
      setLoading(false);
    }
    fetchSeries();
  }, [seriesId, supabase]);

  const copyRssUrl = () => {
    if (series?.rss_slug) {
      navigator.clipboard.writeText(`${appUrl}/api/rss/${series.rss_slug}`);
      toast({ title: "RSS URL copied to clipboard" });
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm("Delete this episode?")) return;
    const success = await deleteEpisode(id);
    if (success) {
      toast({ title: "Episode deleted" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Series not found</p>
        <Link href="/dashboard/series">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Series
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={series.title}
        description={series.description || undefined}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/episodes?new=true&series=${seriesId}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Episode
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <Link
          href="/dashboard/series"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          All Series
        </Link>

        {/* Series info */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Series Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {series.is_public ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Default Format</span>
                <span className="capitalize">{series.default_format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Episodes</span>
                <span>{episodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hosts</span>
                <span>
                  {series.default_host_config.host1.name} &{" "}
                  {series.default_host_config.host2.name}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* RSS Feed */}
          {series.is_public && series.rss_slug && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Rss className="w-4 h-4 text-orange-500" />
                  RSS Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-xs truncate">
                    {appUrl}/api/rss/{series.rss_slug}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyRssUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add this URL to any podcast app (Apple Podcasts, Spotify, etc.)
                  to subscribe.
                </p>
                <a
                  href={`${appUrl}/api/rss/${series.rss_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-primary hover:underline"
                >
                  Preview Feed
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Episodes */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Episodes</h2>
          {epLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No episodes in this series yet</p>
                <Link href={`/dashboard/episodes?new=true&series=${seriesId}`}>
                  <Button className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Episode
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onDelete={handleDeleteEpisode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
