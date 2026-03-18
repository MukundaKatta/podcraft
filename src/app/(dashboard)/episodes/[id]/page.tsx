"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Download,
  Globe,
  Loader2,
  Clock,
  FileText,
  Users,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioPlayer } from "@/components/player/audio-player";
import { TranscriptViewer } from "@/components/player/transcript-viewer";
import { useEpisode } from "@/hooks/use-episodes";
import { formatDuration } from "@/lib/audio";
import { formatDate, formatFileSize } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { TranscriptSegment } from "@/types";

export default function EpisodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { episode, loading, error } = useEpisode(params.id as string);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekFn, setSeekFn] = useState<((time: number) => void) | null>(null);

  const handleSegmentClick = useCallback(
    (segment: TranscriptSegment) => {
      setCurrentTime(segment.startTime);
    },
    []
  );

  const handlePublish = async () => {
    try {
      const response = await fetch("/api/episodes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: episode!.id,
          status: "published",
          published_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({ title: "Episode published!" });
      }
    } catch {
      toast({ title: "Publish failed", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (episode?.audio_url) {
      window.open(episode.audio_url, "_blank");
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: episode.id,
          eventType: "download",
        }),
      }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Episode not found</p>
        <Link href="/dashboard/episodes">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Episodes
          </Button>
        </Link>
      </div>
    );
  }

  const isProcessing =
    episode.status === "processing" || episode.status === "generating";

  return (
    <div>
      <Header
        title={episode.title}
        description={episode.description || undefined}
        actions={
          <div className="flex items-center gap-2">
            {episode.status === "ready" && (
              <Button onClick={handlePublish}>
                <Globe className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
            {episode.audio_url && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/episodes"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          All Episodes
        </Link>

        {/* Status banner for processing */}
        {isProcessing && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex items-center gap-4">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {episode.status === "processing"
                    ? "Processing your documents..."
                    : "Generating podcast audio..."}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This may take a few minutes. The page will update automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed banner */}
        {episode.status === "failed" && (
          <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <p className="font-medium text-red-900 dark:text-red-100">
                Generation failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {(episode.metadata as any)?.error ||
                  "An error occurred during generation. Please try again."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">
                  {episode.audio_duration
                    ? formatDuration(episode.audio_duration)
                    : "--:--"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Format</p>
                <p className="font-semibold capitalize">{episode.format}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Hosts</p>
                <p className="font-semibold text-sm">
                  {episode.host_config.host1.name} &{" "}
                  {episode.host_config.host2.name}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Download className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="font-semibold">
                  {episode.audio_size
                    ? formatFileSize(episode.audio_size)
                    : "--"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player & Transcript */}
        {episode.audio_url && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <AudioPlayer
                audioUrl={episode.audio_url}
                transcript={episode.transcript || undefined}
                chapters={episode.chapters || undefined}
                episodeId={episode.id}
                onTimeUpdate={setCurrentTime}
              />

              {/* Episode info */}
              {episode.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generation Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated in</span>
                      <span>
                        {Math.round(episode.metadata.generationTime)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documents</span>
                      <span>{episode.metadata.documentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source words</span>
                      <span>
                        {episode.metadata.totalWords?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(episode.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Transcript */}
            {episode.transcript && episode.transcript.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <TranscriptViewer
                    transcript={episode.transcript}
                    chapters={episode.chapters || undefined}
                    currentTime={currentTime}
                    onSegmentClick={handleSegmentClick}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
