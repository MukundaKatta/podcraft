"use client";

import Link from "next/link";
import {
  Headphones,
  Clock,
  Play,
  MoreVertical,
  Trash2,
  ExternalLink,
  Share2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/audio";
import { formatRelativeTime, truncateText } from "@/lib/utils";
import type { Episode } from "@/types";

const statusConfig: Record<
  string,
  { variant: "default" | "success" | "warning" | "processing" | "destructive" | "secondary"; label: string }
> = {
  draft: { variant: "secondary", label: "Draft" },
  processing: { variant: "processing", label: "Processing" },
  generating: { variant: "processing", label: "Generating" },
  ready: { variant: "success", label: "Ready" },
  published: { variant: "default", label: "Published" },
  failed: { variant: "destructive", label: "Failed" },
};

interface EpisodeCardProps {
  episode: Episode;
  onDelete?: (id: string) => void;
}

export function EpisodeCard({ episode, onDelete }: EpisodeCardProps) {
  const status = statusConfig[episode.status] || statusConfig.draft;

  return (
    <Link href={`/dashboard/episodes/${episode.id}`}>
      <Card className="hover:shadow-md transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg gradient-podcast flex items-center justify-center shrink-0">
              <Headphones className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {episode.title}
                  </h3>
                  {episode.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {truncateText(episode.description, 120)}
                    </p>
                  )}
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {episode.audio_duration
                    ? formatDuration(episode.audio_duration)
                    : "--:--"}
                </span>
                <span className="capitalize">{episode.format}</span>
                <span>{formatRelativeTime(episode.created_at)}</span>
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {episode.play_count} plays
                </span>
              </div>
            </div>

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(episode.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
