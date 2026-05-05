import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ProgressPayload = {
  userId: string;
  xp: number;
  streak: number;
};

function validatePayload(payload: Partial<ProgressPayload>) {
  if (!payload.userId?.trim()) {
    return "Missing userId.";
  }
  if (typeof payload.xp !== "number" || payload.xp < 0) {
    return "Invalid xp.";
  }
  if (typeof payload.streak !== "number" || payload.streak < 0) {
    return "Invalid streak.";
  }
  return null;
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  const userId = req.nextUrl.searchParams.get("userId");

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("user_id, xp, streak, updated_at")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await req.json()) as Partial<ProgressPayload>;
  const validationError = validatePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const payload: ProgressPayload = {
    userId: body.userId!.trim(),
    xp: Math.floor(body.xp!),
    streak: Math.floor(body.streak!),
  };

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: payload.userId,
        xp: payload.xp,
        streak: payload.streak,
      },
      { onConflict: "user_id" }
    )
    .select("user_id, xp, streak, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data });
}
