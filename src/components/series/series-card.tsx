"use client";

import Link from "next/link";
import { Library, Headphones, Rss, Trash2, Globe, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { Series } from "@/types";

interface SeriesCardProps {
  series: Series;
  onDelete?: (id: string) => void;
}

export function SeriesCard({ series, onDelete }: SeriesCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <Link href={`/dashboard/series/${series.id}`}>
      <Card className="hover:shadow-md transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
              <Library className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {series.title}
                  </h3>
                  {series.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {series.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  {series.episode_count} episodes
                </span>
                <span className="capitalize">{series.default_format}</span>
                <span>{formatRelativeTime(series.updated_at)}</span>
                {series.rss_slug && (
                  <span className="flex items-center gap-1 text-primary">
                    <Rss className="w-3 h-3" />
                    RSS
                  </span>
                )}
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
                  onDelete(series.id);
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
