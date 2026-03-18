import type { Series, Episode, RSSFeedConfig } from "@/types";

export function generateRSSFeed(
  series: Series,
  episodes: Episode[],
  config: RSSFeedConfig
): string {
  const publishedEpisodes = episodes
    .filter((e) => e.status === "published" && e.audio_url)
    .sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
    );

  const lastBuildDate = publishedEpisodes[0]
    ? new Date(publishedEpisodes[0].published_at || publishedEpisodes[0].created_at).toUTCString()
    : new Date().toUTCString();

  const items = publishedEpisodes
    .map((ep, index) => {
      const pubDate = new Date(ep.published_at || ep.created_at).toUTCString();
      const duration = ep.audio_duration
        ? formatITunesDuration(ep.audio_duration)
        : "00:00:00";

      return `    <item>
      <title><![CDATA[${escapeXml(ep.title)}]]></title>
      <description><![CDATA[${escapeXml(ep.description || "")}]]></description>
      <link>${config.websiteUrl}/episodes/${ep.id}</link>
      <guid isPermaLink="false">${ep.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${ep.audio_url}" length="${ep.audio_size || 0}" type="audio/mpeg" />
      <itunes:duration>${duration}</itunes:duration>
      <itunes:episode>${publishedEpisodes.length - index}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:summary><![CDATA[${escapeXml(ep.description || "")}]]></itunes:summary>
      ${ep.cover_image_url ? `<itunes:image href="${ep.cover_image_url}" />` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${escapeXml(config.title)}]]></title>
    <description><![CDATA[${escapeXml(config.description)}]]></description>
    <link>${config.websiteUrl}</link>
    <language>${config.language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${config.websiteUrl}/api/rss/${series.rss_slug}" rel="self" type="application/rss+xml" />
    <itunes:author>${escapeXml(config.author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${escapeXml(config.author)}</itunes:name>
      <itunes:email>${escapeXml(config.email)}</itunes:email>
    </itunes:owner>
    <itunes:category text="${escapeXml(config.category)}" />
    <itunes:image href="${config.imageUrl}" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
${items}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatITunesDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
