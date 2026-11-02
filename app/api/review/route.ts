import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type Fach = "wpr" | "wima" | "statistik";

type LernversuchPayload = {
  id: string;
  fach: Fach;
  themaId: string;
  themaTitel: string;
  punkte: number;
  fehler: string[];
  feedback: string;
  aufgabe: string;
  istWiederholung: boolean;
  erstelltAm: string;
};

const REVIEW_INTERVALLE = [0, 1, 3, 7, 14, 30];

async function authentifizierterBenutzer(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!supabase || !token) return { supabase, user: null };

  const { data, error } = await supabase.auth.getUser(token);
  return { supabase, user: error ? null : data.user };
}

function datumInTagen(tage: number): string {
  const datum = new Date();
  datum.setDate(datum.getDate() + tage);
  return datum.toISOString();
}

function istGueltigerVersuch(body: Partial<LernversuchPayload>): body is LernversuchPayload {
  return (
    typeof body.id === "string" &&
    ["wpr", "wima", "statistik"].includes(body.fach ?? "") &&
    typeof body.themaId === "string" &&
    typeof body.themaTitel === "string" &&
    typeof body.punkte === "number" &&
    body.punkte >= 0 &&
    body.punkte <= 100 &&
    Array.isArray(body.fehler) &&
    typeof body.feedback === "string" &&
    typeof body.aufgabe === "string" &&
    typeof body.istWiederholung === "boolean" &&
    typeof body.erstelltAm === "string"
  );
}

export async function GET(req: NextRequest) {
  const { supabase, user } = await authentifizierterBenutzer(req);
  if (!supabase) return NextResponse.json({ lernversuche: [], fehlerbuch: [] });
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const [{ data: versuche, error: versucheFehler }, { data: eintraege, error: eintraegeFehler }] =
    await Promise.all([
      supabase
        .from("learning_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("review_items")
        .select("*")
        .eq("user_id", user.id)
        .order("next_review_at", { ascending: true }),
    ]);

  if (versucheFehler || eintraegeFehler) {
    return NextResponse.json(
      { error: versucheFehler?.message ?? eintraegeFehler?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    lernversuche: (versuche ?? []).map((versuch) => ({
      id: versuch.id,
      fach: versuch.fach,
      themaId: versuch.thema_id,
      themaTitel: versuch.thema_titel,
      punkte: versuch.punkte,
      fehler: versuch.fehler ?? [],
      feedback: versuch.feedback ?? "",
      aufgabe: versuch.aufgabe ?? "",
      istWiederholung: versuch.ist_wiederholung,
      erstelltAm: versuch.created_at,
    })),
    fehlerbuch: (eintraege ?? []).map((eintrag) => ({
      id: eintrag.id,
      fach: eintrag.fach,
      themaId: eintrag.thema_id,
      themaTitel: eintrag.thema_titel,
      letztePunktzahl: eintrag.letzte_punktzahl,
      mastery: eintrag.mastery,
      fehler: eintrag.fehler ?? [],
      feedback: eintrag.feedback ?? "",
      versuche: eintrag.versuche,
      erfolgreicheWiederholungen: eintrag.erfolgreiche_wiederholungen,
      zuletztGeuebtAm: eintrag.zuletzt_geuebt_am,
      naechsteWiederholungAm: eintrag.next_review_at,
      gemeistert: eintrag.gemeistert,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await authentifizierterBenutzer(req);
  if (!supabase) return NextResponse.json({ gespeichert: false });
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const body = (await req.json()) as Partial<LernversuchPayload>;
  if (!istGueltigerVersuch(body)) {
    return NextResponse.json({ error: "Ungültiger Lernversuch." }, { status: 400 });
  }

  const { error: versuchFehler } = await supabase.from("learning_attempts").insert({
    id: body.id,
    user_id: user.id,
    fach: body.fach,
    thema_id: body.themaId,
    thema_titel: body.themaTitel,
    punkte: Math.round(body.punkte),
    fehler: body.fehler,
    feedback: body.feedback,
    aufgabe: body.aufgabe,
    ist_wiederholung: body.istWiederholung,
    created_at: body.erstelltAm,
  });

  if (versuchFehler) {
    return NextResponse.json({ error: versuchFehler.message }, { status: 500 });
  }

  const { data: vorhanden, error: lesenFehler } = await supabase
    .from("review_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("fach", body.fach)
    .eq("thema_id", body.themaId)
    .maybeSingle();

  if (lesenFehler) {
    return NextResponse.json({ error: lesenFehler.message }, { status: 500 });
  }

  const sollGespeichertWerden = Boolean(vorhanden) || body.punkte < 85 || body.fehler.length > 0;
  if (!sollGespeichertWerden) return NextResponse.json({ gespeichert: true });

  const bestanden = body.punkte >= 75;
  const wiederholungen = bestanden ? (vorhanden?.erfolgreiche_wiederholungen ?? 0) + 1 : 0;
  const mastery = vorhanden
    ? Math.round(vorhanden.mastery * 0.4 + body.punkte * 0.6)
    : Math.round(body.punkte);
  const intervall = bestanden
    ? REVIEW_INTERVALLE[Math.min(wiederholungen, REVIEW_INTERVALLE.length - 1)]
    : 0;

  const { error: eintragFehler } = await supabase.from("review_items").upsert(
    {
      user_id: user.id,
      fach: body.fach,
      thema_id: body.themaId,
      thema_titel: body.themaTitel,
      letzte_punktzahl: Math.round(body.punkte),
      mastery,
      fehler: body.fehler.length > 0 ? body.fehler : vorhanden?.fehler ?? [],
      feedback: body.feedback || vorhanden?.feedback || "",
      versuche: (vorhanden?.versuche ?? 0) + 1,
      erfolgreiche_wiederholungen: wiederholungen,
      zuletzt_geuebt_am: body.erstelltAm,
      next_review_at: datumInTagen(intervall),
      gemeistert: wiederholungen >= 3 && mastery >= 80,
    },
    { onConflict: "user_id,fach,thema_id" }
  );

  if (eintragFehler) {
    return NextResponse.json({ error: eintragFehler.message }, { status: 500 });
  }

  return NextResponse.json({ gespeichert: true });
}
