export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      episodes: {
        Row: {
          id: string;
          user_id: string;
          series_id: string | null;
          title: string;
          description: string | null;
          format: DiscussionFormat;
          status: EpisodeStatus;
          audio_url: string | null;
          audio_duration: number | null;
          audio_size: number | null;
          cover_image_url: string | null;
          transcript: TranscriptSegment[] | null;
          chapters: Chapter[] | null;
          host_config: HostConfig;
          quality_settings: QualitySettings;
          metadata: EpisodeMetadata | null;
          play_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["episodes"]["Row"],
          "id" | "created_at" | "updated_at" | "play_count"
        >;
        Update: Partial<Database["public"]["Tables"]["episodes"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          episode_id: string;
          user_id: string;
          name: string;
          type: DocumentType;
          source_url: string | null;
          storage_path: string | null;
          content_text: string | null;
          content_summary: string | null;
          page_count: number | null;
          word_count: number | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["documents"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      series: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          default_format: DiscussionFormat;
          default_host_config: HostConfig;
          episode_count: number;
          is_public: boolean;
          rss_slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["series"]["Row"],
          "id" | "created_at" | "updated_at" | "episode_count"
        >;
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
      };
      analytics_events: {
        Row: {
          id: string;
          episode_id: string;
          event_type: AnalyticsEventType;
          listener_id: string | null;
          data: Json | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["analytics_events"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["analytics_events"]["Insert"]
        >;
      };
      feed_subscriptions: {
        Row: {
          id: string;
          series_id: string;
          subscriber_email: string | null;
          subscriber_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["feed_subscriptions"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["feed_subscriptions"]["Insert"]
        >;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type DiscussionFormat = "interview" | "debate" | "explainer" | "qna";

export type EpisodeStatus =
  | "draft"
  | "processing"
  | "generating"
  | "ready"
  | "published"
  | "failed";

export type DocumentType = "pdf" | "url" | "text";

export type AnalyticsEventType =
  | "play"
  | "pause"
  | "complete"
  | "seek"
  | "download"
  | "share"
  | "subscribe";

export interface HostConfig {
  host1: HostPersonality;
  host2: HostPersonality;
}

export interface HostPersonality {
  name: string;
  role: "host" | "guest" | "expert" | "interviewer" | "moderator";
  voice: string;
  personality: string;
  speakingStyle: string;
  expertise: string[];
}

export interface QualitySettings {
  sampleRate: number;
  bitrate: number;
  format: "mp3" | "wav" | "ogg";
  speed: number;
  normalizeVolume: boolean;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
  chapterId?: string;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
}

export interface EpisodeMetadata {
  generationTime: number;
  modelUsed: string;
  documentCount: number;
  totalWords: number;
  tags: string[];
}

export interface ID3Tags {
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  comment: string;
  trackNumber: number;
  image?: {
    mime: string;
    data: ArrayBuffer;
  };
}

export type Episode = Database["public"]["Tables"]["episodes"]["Row"];
export type EpisodeInsert = Database["public"]["Tables"]["episodes"]["Insert"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type Series = Database["public"]["Tables"]["series"]["Row"];
export type SeriesInsert = Database["public"]["Tables"]["series"]["Insert"];
export type AnalyticsEvent =
  Database["public"]["Tables"]["analytics_events"]["Row"];
export type FeedSubscription =
  Database["public"]["Tables"]["feed_subscriptions"]["Row"];
