import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify episode exists and belongs to user
    const { data: episode, error: fetchError } = await supabase
      .from("episodes")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    if (episode.status !== "ready") {
      return NextResponse.json(
        { error: "Episode must be in 'ready' status to publish" },
        { status: 400 }
      );
    }

    if (!episode.audio_url) {
      return NextResponse.json(
        { error: "Episode has no audio" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("episodes")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to publish episode" },
      { status: 500 }
    );
  }
}
