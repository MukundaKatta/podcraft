"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TranscriptSegment, Chapter } from "@/types";

interface UseAudioPlayerOptions {
  transcript?: TranscriptSegment[];
  chapters?: Chapter[];
  onPlay?: () => void;
  onComplete?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<TranscriptSegment | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  const initAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener("loadstart", () => setIsLoading(true));
    audio.addEventListener("canplay", () => setIsLoading(false));
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      options.onTimeUpdate?.(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      options.onComplete?.();
    });
    audio.addEventListener("play", () => {
      setIsPlaying(true);
      options.onPlay?.();
    });
    audio.addEventListener("pause", () => setIsPlaying(false));

    audio.volume = volume;
    audio.playbackRate = playbackRate;
  }, [volume, playbackRate, options]);

  // Track active segment/chapter
  useEffect(() => {
    if (options.transcript) {
      const segment = options.transcript.find(
        (s) => currentTime >= s.startTime && currentTime < s.endTime
      );
      setActiveSegment(segment || null);
    }
    if (options.chapters) {
      const chapter = options.chapters.find(
        (c) => currentTime >= c.startTime && currentTime < c.endTime
      );
      setActiveChapter(chapter || null);
    }
  }, [currentTime, options.transcript, options.chapters]);

  const play = useCallback(async () => {
    if (audioRef.current) {
      await audioRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const seekToChapter = useCallback(
    (chapter: Chapter) => {
      seek(chapter.startTime);
    },
    [seek]
  );

  const seekToSegment = useCallback(
    (segment: TranscriptSegment) => {
      seek(segment.startTime);
    },
    [seek]
  );

  const changeVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const skipForward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      seek(Math.min(audioRef.current.currentTime + seconds, duration));
    }
  }, [seek, duration]);

  const skipBackward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      seek(Math.max(audioRef.current.currentTime - seconds, 0));
    }
  }, [seek]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return {
    initAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    playbackRate,
    activeSegment,
    activeChapter,
    play,
    pause,
    togglePlay,
    seek,
    seekToChapter,
    seekToSegment,
    changeVolume,
    changePlaybackRate,
    skipForward,
    skipBackward,
  };
}
