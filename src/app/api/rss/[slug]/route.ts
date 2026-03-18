import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateRSSFeed } from "@/lib/rss";
import type { RSSFeedConfig } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServiceRoleClient();

    // Find series by RSS slug
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .select("*")
      .eq("rss_slug", params.slug)
      .eq("is_public", true)
      .single();

    if (seriesError || !series) {
      return new NextResponse("Feed not found", { status: 404 });
    }

    // Get published episodes
    const { data: episodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", series.id)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const config: RSSFeedConfig = {
      title: series.title,
      description: series.description || `${series.title} - powered by PodCraft`,
      author: "PodCraft",
      email: "feeds@podcraft.ai",
      language: "en",
      category: "Technology",
      imageUrl: series.cover_image_url || `${appUrl}/podcast-cover.png`,
      websiteUrl: appUrl,
    };

    const rss = generateRSSFeed(series as any, (episodes || []) as any, config);

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    });
  } catch (err: any) {
    console.error("RSS feed error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
