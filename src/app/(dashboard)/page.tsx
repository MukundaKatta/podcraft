"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Headphones,
  Library,
  Play,
  TrendingUp,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEpisodes } from "@/hooks/use-episodes";
import { useSeries } from "@/hooks/use-series";
import { formatRelativeTime } from "@/lib/utils";
import { formatDuration } from "@/lib/audio";

const statusVariant: Record<string, "default" | "success" | "warning" | "processing" | "destructive"> = {
  draft: "secondary" as any,
  processing: "processing",
  generating: "processing",
  ready: "success",
  published: "default",
  failed: "destructive",
};

export default function DashboardPage() {
  const { episodes, loading: epLoading } = useEpisodes();
  const { seriesList, loading: seriesLoading } = useSeries();

  const publishedCount = episodes.filter((e) => e.status === "published").length;
  const totalPlays = episodes.reduce((sum, e) => sum + e.play_count, 0);
  const recentEpisodes = episodes.slice(0, 5);

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your podcast creation activity"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Episodes</p>
                  <p className="text-2xl font-bold">{episodes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Plays</p>
                  <p className="text-2xl font-bold">{totalPlays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Library className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Series</p>
                  <p className="text-2xl font-bold">{seriesList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Episodes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Episodes</CardTitle>
            <Link href="/dashboard/episodes">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {epLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentEpisodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No episodes yet</p>
                <p className="text-sm mt-1">Create your first AI-powered podcast episode</p>
                <Link href="/dashboard/episodes?new=true">
                  <Button className="mt-4">Create Episode</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEpisodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/dashboard/episodes/${ep.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg gradient-podcast flex items-center justify-center shrink-0">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ep.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.audio_duration
                            ? formatDuration(ep.audio_duration)
                            : "--:--"}
                        </span>
                        <span>{formatRelativeTime(ep.created_at)}</span>
                      </div>
                    </div>
                    <Badge variant={statusVariant[ep.status] || "secondary"}>
                      {ep.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {ep.play_count}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/episodes?new=true">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl gradient-podcast flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold">Document to Podcast</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a document and generate an episode
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/series?new=true">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-purple-500 flex items-center justify-center mb-4">
                  <Library className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold">Create a Series</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize episodes with RSS feed
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Track listener engagement and growth
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
