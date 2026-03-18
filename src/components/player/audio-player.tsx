"use client";

import { useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { formatDuration } from "@/lib/audio";
import type { TranscriptSegment, Chapter } from "@/types";

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: TranscriptSegment[];
  chapters?: Chapter[];
  episodeId?: string;
  onTimeUpdate?: (time: number) => void;
}

export function AudioPlayer({
  audioUrl,
  transcript,
  chapters,
  episodeId,
  onTimeUpdate,
}: AudioPlayerProps) {
  const {
    initAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    playbackRate,
    activeChapter,
    togglePlay,
    seek,
    seekToChapter,
    changeVolume,
    changePlaybackRate,
    skipForward,
    skipBackward,
  } = useAudioPlayer({ transcript, chapters, onTimeUpdate });

  useEffect(() => {
    if (audioUrl) {
      initAudio(audioUrl);
    }
  }, [audioUrl, initAudio]);

  // Track play event
  useEffect(() => {
    if (isPlaying && episodeId) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, eventType: "play" }),
      }).catch(() => {});
    }
  }, [isPlaying, episodeId]);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Chapter indicator */}
      {activeChapter && (
        <div className="text-xs text-muted-foreground text-center">
          {activeChapter.title}
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <Slider
          value={[currentTime]}
          onValueChange={([v]) => seek(v)}
          max={duration || 100}
          step={0.1}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Volume */}
        <div className="flex items-center gap-2 w-32">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => changeVolume(volume > 0 ? 0 : 1)}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={([v]) => changeVolume(v)}
            max={1}
            step={0.01}
            className="w-20"
          />
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => skipBackward(15)}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            className="h-12 w-12 rounded-full gradient-podcast border-0 text-white hover:opacity-90"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => skipForward(15)}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Speed */}
        <div className="flex items-center gap-1 w-32 justify-end">
          {playbackRates.map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                playbackRate === rate
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Chapter markers */}
      {chapters && chapters.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Chapters
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => seekToChapter(chapter)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${
                  activeChapter?.id === chapter.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span className="truncate">{chapter.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {formatDuration(chapter.startTime)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
