export type Thema = {
  id: string;
  titel: string;
  beschreibung: string;
  schluesselwoerter: string[];
  // Wie viele bestandene Sitzungen (Punkte >= 60) nötig, um zum nächsten Kapitel zu kommen
  sitzungenZumAbschluss: number;
  // Dateinamen-Präfix für PDF-Lookup: sucht zuerst "wpr-01-*.pdf" etc.
  pdfPraefix: string;
};

export type Fach = "wpr" | "mathe";

export const WPR_THEMEN: Thema[] = [
  {
    id: "wpr-01",
    titel: "Rechtssubjekte & Rechtsfähigkeit",
    beschreibung: "Natürliche und juristische Personen, Rechtsfähigkeit, Geschäftsfähigkeit",
    schluesselwoerter: ["natürliche Person", "juristische Person", "Rechtsfähigkeit", "Geschäftsfähigkeit", "§ 2 BGB", "§ 104 BGB"],
    sitzungenZumAbschluss: 5,
    pdfPraefix: "wpr-01",
  },
  {
    id: "wpr-02",
    titel: "Willenserklärung & Vertragsschluss",
    beschreibung: "Angebot, Annahme, invitatio ad offerendum, Zugang von Willenserklärungen",
    schluesselwoerter: ["Willenserklärung", "Angebot", "Annahme", "§ 145 BGB", "§ 147 BGB", "Zugang"],
    sitzungenZumAbschluss: 6,
    pdfPraefix: "wpr-02",
  },
  {
    id: "wpr-03",
    titel: "Nichtigkeitsgründe & Anfechtung",
    beschreibung: "Nichtigkeit, Anfechtbarkeit, Irrtum, arglistige Täuschung, Drohung",
    schluesselwoerter: ["§ 119 BGB", "§ 123 BGB", "Anfechtung", "Inhaltsirrtum", "Erklärungsirrtum", "Nichtigkeit"],
    sitzungenZumAbschluss: 6,
    pdfPraefix: "wpr-03",
  },
  {
    id: "wpr-04",
    titel: "Stellvertretung",
    beschreibung: "Vollmacht, Vertretungsmacht, Handeln in fremdem Namen, Prokura",
    schluesselwoerter: ["§ 164 BGB", "Vollmacht", "Vertretungsmacht", "Prokura", "Handelsvertreter"],
    sitzungenZumAbschluss: 5,
    pdfPraefix: "wpr-04",
  },
  {
    id: "wpr-05",
    titel: "Leistungsstörungen: Unmöglichkeit & Verzug",
    beschreibung: "Unmöglichkeit (§ 275 BGB), Schuldnerverzug (§ 286 BGB), Gläubigerverzug",
    schluesselwoerter: ["§ 275 BGB", "§ 286 BGB", "Unmöglichkeit", "Verzug", "Mahnung"],
    sitzungenZumAbschluss: 7,
    pdfPraefix: "wpr-05",
  },
  {
    id: "wpr-06",
    titel: "Schadensersatz",
    beschreibung: "Schadensersatz statt der Leistung, Pflichtverletzung, §§ 280 ff. BGB",
    schluesselwoerter: ["§ 280 BGB", "§ 281 BGB", "Pflichtverletzung", "Schadensersatz", "Vertretenmüssen"],
    sitzungenZumAbschluss: 7,
    pdfPraefix: "wpr-06",
  },
  {
    id: "wpr-07",
    titel: "Kaufvertrag",
    beschreibung: "§§ 433 ff. BGB, Sachmangel, Gewährleistungsrechte, Nacherfüllung",
    schluesselwoerter: ["§ 433 BGB", "§ 434 BGB", "§ 437 BGB", "Sachmangel", "Nacherfüllung", "Rücktritt"],
    sitzungenZumAbschluss: 8,
    pdfPraefix: "wpr-07",
  },
  {
    id: "wpr-08",
    titel: "Werkvertrag & Dienstvertrag",
    beschreibung: "§§ 631 ff. BGB vs. §§ 611 ff. BGB, Abgrenzung, Mängelrechte beim Werkvertrag",
    schluesselwoerter: ["§ 631 BGB", "§ 611 BGB", "Werkvertrag", "Dienstvertrag", "Abnahme"],
    sitzungenZumAbschluss: 6,
    pdfPraefix: "wpr-08",
  },
  {
    id: "wpr-09",
    titel: "Sachenrecht: Besitz & Eigentum",
    beschreibung: "Besitz, Eigentum, Eigentumsübertragung, gutgläubiger Erwerb",
    schluesselwoerter: ["§ 854 BGB", "§ 903 BGB", "§ 929 BGB", "Besitz", "Eigentum", "Übergabe"],
    sitzungenZumAbschluss: 6,
    pdfPraefix: "wpr-09",
  },
];

export const MATHE_THEMEN: Thema[] = [
  {
    id: "mathe-01",
    titel: "Mengenlehre & Aussagenlogik",
    beschreibung: "Mengen, Teilmengen, Vereinigung, Schnitt, Logische Aussagen",
    schluesselwoerter: ["Menge", "Teilmenge", "Vereinigung", "Schnittmenge", "Aussagenlogik", "Quantoren"],
    sitzungenZumAbschluss: 6,
    pdfPraefix: "mathe-01",
  },
  {
    id: "mathe-02",
    titel: "Reelle Zahlen & Ungleichungen",
    beschreibung: "Zahlenmengen, Intervalle, Betragsungleichungen, Betragsfunktion",
    schluesselwoerter: ["reelle Zahlen", "Intervall", "Betrag", "Ungleichung", "Supremum"],
    sitzungenZumAbschluss: 8,
    pdfPraefix: "mathe-02",
  },
  {
    id: "mathe-03",
    titel: "Folgen & Reihen",
    beschreibung: "Zahlenfolgen, Grenzwerte, geometrische und arithmetische Reihen",
    schluesselwoerter: ["Folge", "Reihe", "Grenzwert", "Konvergenz", "geometrische Reihe"],
    sitzungenZumAbschluss: 10,
    pdfPraefix: "mathe-03",
  },
  {
    id: "mathe-04",
    titel: "Funktionen & Stetigkeit",
    beschreibung: "Funktionstypen, Definitionsbereich, Wertebereich, Stetigkeit",
    schluesselwoerter: ["Funktion", "Definitionsbereich", "Wertebereich", "Stetigkeit", "Nullstelle"],
    sitzungenZumAbschluss: 10,
    pdfPraefix: "mathe-04",
  },
  {
    id: "mathe-05",
    titel: "Differentialrechnung I: Ableitungsregeln",
    beschreibung: "Ableitungsbegriff, Produkt-/Quotienten-/Kettenregel",
    schluesselwoerter: ["Ableitung", "Differenzierbarkeit", "Produktregel", "Kettenregel", "Quotientenregel"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "mathe-05",
  },
  {
    id: "mathe-06",
    titel: "Differentialrechnung II: Kurvendiskussion",
    beschreibung: "Extremwerte, Monotonie, Wendepunkte, vollständige Kurvendiskussion",
    schluesselwoerter: ["Extremum", "Monotonie", "Wendepunkt", "Kurvendiskussion", "Hochpunkt", "Tiefpunkt"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "mathe-06",
  },
  {
    id: "mathe-07",
    titel: "Integralrechnung I: Grundintegrale",
    beschreibung: "Stammfunktion, Grundintegrale, unbestimmtes Integral",
    schluesselwoerter: ["Integral", "Stammfunktion", "unbestimmtes Integral", "Integrationsregeln"],
    sitzungenZumAbschluss: 12,
    pdfPraefix: "mathe-07",
  },
  {
    id: "mathe-08",
    titel: "Integralrechnung II: Integrationsmethoden",
    beschreibung: "Substitution, partielle Integration, bestimmtes Integral, Flächeninhalt",
    schluesselwoerter: ["Substitution", "partielle Integration", "bestimmtes Integral", "Flächeninhalt"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "mathe-08",
  },
  {
    id: "mathe-09",
    titel: "Lineare Algebra: Vektoren & Matrizen",
    beschreibung: "Vektoren, Matrizenrechnung, Determinante, Inverse",
    schluesselwoerter: ["Vektor", "Matrix", "Determinante", "Inverse", "Matrixmultiplikation"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "mathe-09",
  },
  {
    id: "mathe-10",
    titel: "Lineare Gleichungssysteme",
    beschreibung: "Gauß-Elimination, Lösbarkeit, Cramer'sche Regel",
    schluesselwoerter: ["lineares Gleichungssystem", "Gauß-Elimination", "Rang", "Lösungsmenge"],
    sitzungenZumAbschluss: 12,
    pdfPraefix: "mathe-10",
  },
  {
    id: "mathe-11",
    titel: "Statistik & Wahrscheinlichkeitsrechnung",
    beschreibung: "Lage- und Streumaße, Zufallsvariablen, Normalverteilung, bedingte Wahrscheinlichkeit",
    schluesselwoerter: ["Erwartungswert", "Varianz", "Normalverteilung", "Wahrscheinlichkeit", "Binomialverteilung"],
    sitzungenZumAbschluss: 12,
    pdfPraefix: "mathe-11",
  },
];

export function getThemen(fach: Fach): Thema[] {
  return fach === "wpr" ? WPR_THEMEN : MATHE_THEMEN;
}

export function getAktuellesThema(fach: Fach, index: number): Thema {
  const themen = getThemen(fach);
  return themen[Math.min(index, themen.length - 1)];
}
