"use client";

import { useRef, useState } from "react";
import { Camera, Type, X, ImageIcon } from "lucide-react";

type Modus = "text" | "foto";

type Props = {
  textWert: string;
  onTextChange: (v: string) => void;
  fotoBase64: string | null;
  onFotoChange: (base64: string | null, mimeType: string | null) => void;
  textPlaceholder?: string;
  akzentFarbe?: "indigo" | "emerald" | "violet";
};

const RING: Record<string, string> = {
  indigo: "focus:ring-indigo-300",
  emerald: "focus:ring-emerald-300",
  violet: "focus:ring-violet-300",
};

export default function LoesungsEingabe({
  textWert,
  onTextChange,
  fotoBase64,
  onFotoChange,
  textPlaceholder = "Schreibe deine Lösung hier...",
  akzentFarbe = "indigo",
}: Props) {
  const [modus, setModus] = useState<Modus>("text");
  const fileRef = useRef<HTMLInputElement>(null);
  const ring = RING[akzentFarbe];

  function bildAuswaehlen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // dataUrl = "data:image/jpeg;base64,/9j/..."
      const [meta, base64] = dataUrl.split(",");
      const mimeType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
      onFotoChange(base64, mimeType);
    };
    reader.readAsDataURL(file);
  }

  function fotoBildLoeschen() {
    onFotoChange(null, null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Modus-Wechsler */}
      <div className="flex rounded-xl bg-slate-100 p-1 gap-1 w-fit">
        <button
          type="button"
          onClick={() => setModus("text")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            modus === "text"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Tippen
        </button>
        <button
          type="button"
          onClick={() => setModus("foto")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            modus === "foto"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Foto
        </button>
      </div>

      {/* Texteingabe */}
      {modus === "text" && (
        <textarea
          className={`w-full min-h-48 rounded-xl border border-slate-200 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 ${ring} font-mono`}
          placeholder={textPlaceholder}
          value={textWert}
          onChange={(e) => onTextChange(e.target.value)}
        />
      )}

      {/* Foto-Upload */}
      {modus === "foto" && (
        <div className="space-y-3">
          {fotoBase64 ? (
            <div className="relative">
              <img
                src={`data:image/jpeg;base64,${fotoBase64}`}
                alt="Deine handschriftliche Lösung"
                className="w-full rounded-xl border border-slate-200 object-contain max-h-96"
              />
              <button
                type="button"
                onClick={fotoBildLoeschen}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full min-h-48 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-400"
            >
              <ImageIcon className="w-10 h-10" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">Foto hochladen</p>
                <p className="text-xs mt-0.5">Schreib deine Lösung auf Papier und fotografiere sie</p>
              </div>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={bildAuswaehlen}
          />
          <p className="text-xs text-slate-400 text-center">
            Tipp: Auf dem Handy öffnet sich direkt die Kamera
          </p>
        </div>
      )}
    </div>
  );
}
