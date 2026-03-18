"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/audio";
import type { TranscriptSegment, Chapter } from "@/types";

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
  chapters?: Chapter[];
  currentTime: number;
  onSegmentClick: (segment: TranscriptSegment) => void;
}

export function TranscriptViewer({
  transcript,
  chapters,
  currentTime,
  onSegmentClick,
}: TranscriptViewerProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime]);

  const getChapterForSegment = (segment: TranscriptSegment) => {
    if (!chapters) return null;
    return chapters.find((c) => c.id === segment.chapterId);
  };

  let lastChapterId: string | undefined;

  return (
    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
      {transcript.map((segment) => {
        const isActive =
          currentTime >= segment.startTime && currentTime < segment.endTime;
        const isPast = currentTime >= segment.endTime;
        const chapter = getChapterForSegment(segment);
        const showChapterHeader =
          chapter && chapter.id !== lastChapterId;

        if (chapter) {
          lastChapterId = chapter.id;
        }

        return (
          <div key={segment.id}>
            {showChapterHeader && (
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 px-3 border-b mb-2 mt-4 first:mt-0">
                <h4 className="text-sm font-semibold text-primary">
                  {chapter!.title}
                </h4>
                {chapter!.summary && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {chapter!.summary}
                  </p>
                )}
              </div>
            )}

            <div
              ref={isActive ? activeRef : undefined}
              onClick={() => onSegmentClick(segment)}
              className={cn(
                "flex gap-3 p-2 rounded-lg cursor-pointer transition-all",
                isActive && "bg-primary/10 border-l-2 border-primary",
                isPast && !isActive && "opacity-60",
                !isActive && !isPast && "hover:bg-muted"
              )}
            >
              <div className="shrink-0 w-16 text-right">
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDuration(segment.startTime)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-xs font-semibold block mb-0.5",
                    segment.speaker.includes("host1") || segment.speaker === transcript[0]?.speaker
                      ? "text-podcast-600"
                      : "text-orange-600"
                  )}
                >
                  {segment.speaker}
                </span>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    isActive && "font-medium"
                  )}
                >
                  {segment.text}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
