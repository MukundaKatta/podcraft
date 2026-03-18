import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("series_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("episodes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (seriesId) {
      query = query.eq("series_id", seriesId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, format, hostConfig, qualitySettings, seriesId } = body;

    if (!title || !format || !hostConfig) {
      return NextResponse.json(
        { error: "title, format, and hostConfig are required" },
        { status: 400 }
      );
    }

    const { data: episode, error } = await supabase
      .from("episodes")
      .insert({
        user_id: user.id,
        series_id: seriesId || null,
        title,
        description: description || null,
        format,
        status: "draft",
        host_config: hostConfig,
        quality_settings: qualitySettings || {
          sampleRate: 44100,
          bitrate: 128,
          format: "mp3",
          speed: 1.0,
          normalizeVolume: true,
        },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(episode);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create episode" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("episodes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete episode" },
      { status: 500 }
    );
  }
}
