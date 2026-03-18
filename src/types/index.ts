export * from "./database";

export interface GenerateRequest {
  title: string;
  description?: string;
  format: import("./database").DiscussionFormat;
  hostConfig: import("./database").HostConfig;
  qualitySettings: import("./database").QualitySettings;
  documentIds: string[];
  seriesId?: string;
}

export interface GenerateResponse {
  episodeId: string;
  status: "processing";
  estimatedTime: number;
}

export interface UploadResponse {
  documentId: string;
  name: string;
  type: import("./database").DocumentType;
  wordCount: number;
  summary: string;
}

export interface ScriptLine {
  speaker: string;
  text: string;
  emotion?: string;
  pauseAfter?: number;
}

export interface PodcastScript {
  title: string;
  chapters: {
    title: string;
    summary: string;
    lines: ScriptLine[];
  }[];
  estimatedDuration: number;
}

export interface AnalyticsSummary {
  totalPlays: number;
  totalDownloads: number;
  totalListeners: number;
  averageCompletion: number;
  playsByDay: { date: string; plays: number }[];
  topEpisodes: { episodeId: string; title: string; plays: number }[];
  listenerRetention: { timestamp: number; percentage: number }[];
}

export interface RSSFeedConfig {
  title: string;
  description: string;
  author: string;
  email: string;
  language: string;
  category: string;
  imageUrl: string;
  websiteUrl: string;
}

export interface FormatPreset {
  id: import("./database").DiscussionFormat;
  name: string;
  description: string;
  icon: string;
  defaultHostConfig: import("./database").HostConfig;
  systemPrompt: string;
}
