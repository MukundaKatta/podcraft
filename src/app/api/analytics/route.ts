import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { trackEvent, getAnalyticsSummary } from "@/lib/analytics";
import type { AnalyticsEventType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("series_id") || undefined;
    const days = parseInt(searchParams.get("days") || "30", 10);

    const summary = await getAnalyticsSummary(user.id, seriesId, days);

    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { episodeId, eventType, listenerId, data } = body;

    if (!episodeId || !eventType) {
      return NextResponse.json(
        { error: "episodeId and eventType are required" },
        { status: 400 }
      );
    }

    const validEvents: AnalyticsEventType[] = [
      "play", "pause", "complete", "seek", "download", "share", "subscribe",
    ];

    if (!validEvents.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    await trackEvent(episodeId, eventType, listenerId, data);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to track event" },
      { status: 500 }
    );
  }
}
