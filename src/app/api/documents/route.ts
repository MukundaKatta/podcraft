import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractTextFromPdf, extractTextFromUrl, countWords, estimatePageCount } from "@/lib/documents";
import { summarizeDocument } from "@/lib/openai";
import { uploadToR2 } from "@/lib/r2";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const episodeId = formData.get("episode_id") as string;
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;
    const text = formData.get("text") as string | null;

    if (!episodeId) {
      return NextResponse.json(
        { error: "episode_id is required" },
        { status: 400 }
      );
    }

    let contentText = "";
    let docType: "pdf" | "url" | "text" = "text";
    let name = "Untitled Document";
    let storagePath: string | null = null;
    let sourceUrl: string | null = null;

    if (file) {
      docType = file.name.endsWith(".pdf") ? "pdf" : "text";
      name = file.name;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (docType === "pdf") {
        contentText = await extractTextFromPdf(buffer);
      } else {
        contentText = buffer.toString("utf-8");
      }

      // Upload original to R2
      const key = `documents/${user.id}/${uuid()}-${file.name}`;
      await uploadToR2(key, buffer, file.type);
      storagePath = key;
    } else if (url) {
      docType = "url";
      name = url;
      sourceUrl = url;
      contentText = await extractTextFromUrl(url);
    } else if (text) {
      docType = "text";
      name = text.slice(0, 50).trim() + (text.length > 50 ? "..." : "");
      contentText = text;
    } else {
      return NextResponse.json(
        { error: "Provide a file, url, or text" },
        { status: 400 }
      );
    }

    const wordCount = countWords(contentText);
    const pageCount = estimatePageCount(contentText);
    const summary = await summarizeDocument(contentText);

    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        episode_id: episodeId,
        user_id: user.id,
        name,
        type: docType,
        source_url: sourceUrl,
        storage_path: storagePath,
        content_text: contentText,
        content_summary: summary,
        page_count: pageCount,
        word_count: wordCount,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documentId: doc.id,
      name: doc.name,
      type: doc.type,
      wordCount: doc.word_count,
      summary: doc.content_summary,
    });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("episode_id");

    let query = supabase
      .from("documents")
      .select("id, episode_id, name, type, content_summary, word_count, page_count, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (episodeId) {
      query = query.eq("episode_id", episodeId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
