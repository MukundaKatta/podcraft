"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Download,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalyticsSummary } from "@/types";

interface AnalyticsDashboardProps {
  seriesId?: string;
}

export function AnalyticsDashboard({ seriesId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ days });
        if (seriesId) params.append("series_id", seriesId);

        const response = await fetch(`/api/analytics?${params}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch {
        // Analytics fetch failed silently
      }
      setLoading(false);
    }

    fetchAnalytics();
  }, [days, seriesId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Unable to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex justify-end">
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Plays</p>
                <p className="text-2xl font-bold">
                  {analytics.totalPlays.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">
                  {analytics.totalDownloads.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Listeners</p>
                <p className="text-2xl font-bold">
                  {analytics.totalListeners.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">
                  {analytics.averageCompletion.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plays over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plays Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.playsByDay.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No play data yet
              </p>
            ) : (
              <div className="h-48 flex items-end gap-1">
                {analytics.playsByDay.map((day) => {
                  const maxPlays = Math.max(
                    ...analytics.playsByDay.map((d) => d.plays)
                  );
                  const height =
                    maxPlays > 0 ? (day.plays / maxPlays) * 100 : 0;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-xs text-muted-foreground">
                        {day.plays}
                      </span>
                      <div
                        className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.date}: ${day.plays} plays`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Episodes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topEpisodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No episode data yet
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.topEpisodes.map((ep, index) => {
                  const maxPlays = analytics.topEpisodes[0]?.plays || 1;
                  const width = (ep.plays / maxPlays) * 100;
                  return (
                    <div key={ep.episodeId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate flex-1">
                          {index + 1}. {ep.title}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {ep.plays} plays
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listener Retention */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Listener Retention</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.listenerRetention.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No retention data yet
              </p>
            ) : (
              <div className="h-48 flex items-end gap-0.5">
                {analytics.listenerRetention.map((point) => (
                  <div
                    key={point.timestamp}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs text-muted-foreground">
                      {Math.round(point.percentage)}%
                    </span>
                    <div
                      className="w-full bg-green-500/80 rounded-t transition-all hover:bg-green-500"
                      style={{ height: `${point.percentage}%` }}
                      title={`${point.timestamp}%: ${Math.round(point.percentage)}% retained`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {point.timestamp}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
