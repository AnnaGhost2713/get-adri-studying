export type Thema = {
  id: string;
  titel: string;
  beschreibung: string;
  schluesselwoerter: string[];
  sitzungenZumAbschluss: number;
  pdfPraefix: string;
};

export type Fach = "wpr" | "wima" | "statistik";

export const WPR_THEMEN: Thema[] = [
  {
    id: "wpr-01",
    titel: "Rechtssubjekte & Rechtsfähigkeit",
    beschreibung: "Natürliche und juristische Personen, Rechtsfähigkeit, Geschäftsfähigkeit",
    schluesselwoerter: ["natürliche Person", "juristische Person", "Rechtsfähigkeit", "Geschäftsfähigkeit", "§ 2 BGB", "§ 104 BGB"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "wpr-01",
  },
  {
    id: "wpr-02",
    titel: "Willenserklärung & Vertragsschluss",
    beschreibung: "Angebot, Annahme, invitatio ad offerendum, Zugang von Willenserklärungen",
    schluesselwoerter: ["Willenserklärung", "Angebot", "Annahme", "§ 145 BGB", "§ 147 BGB", "Zugang"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "wpr-02",
  },
  {
    id: "wpr-03",
    titel: "Nichtigkeitsgründe & Anfechtung",
    beschreibung: "Nichtigkeit, Anfechtbarkeit, Irrtum, arglistige Täuschung, Drohung",
    schluesselwoerter: ["§ 119 BGB", "§ 123 BGB", "Anfechtung", "Inhaltsirrtum", "Erklärungsirrtum", "Nichtigkeit"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "wpr-03",
  },
  {
    id: "wpr-04",
    titel: "Stellvertretung",
    beschreibung: "Vollmacht, Vertretungsmacht, Handeln in fremdem Namen, Prokura",
    schluesselwoerter: ["§ 164 BGB", "Vollmacht", "Vertretungsmacht", "Prokura", "Handelsvertreter"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "wpr-04",
  },
  {
    id: "wpr-05",
    titel: "Leistungsstörungen: Unmöglichkeit & Verzug",
    beschreibung: "Unmöglichkeit (§ 275 BGB), Schuldnerverzug (§ 286 BGB), Gläubigerverzug",
    schluesselwoerter: ["§ 275 BGB", "§ 286 BGB", "Unmöglichkeit", "Verzug", "Mahnung"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "wpr-05",
  },
  {
    id: "wpr-06",
    titel: "Schadensersatz",
    beschreibung: "Schadensersatz statt der Leistung, Pflichtverletzung, §§ 280 ff. BGB",
    schluesselwoerter: ["§ 280 BGB", "§ 281 BGB", "Pflichtverletzung", "Schadensersatz", "Vertretenmüssen"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "wpr-06",
  },
  {
    id: "wpr-07",
    titel: "Kaufvertrag",
    beschreibung: "§§ 433 ff. BGB, Sachmangel, Gewährleistungsrechte, Nacherfüllung",
    schluesselwoerter: ["§ 433 BGB", "§ 434 BGB", "§ 437 BGB", "Sachmangel", "Nacherfüllung", "Rücktritt"],
    sitzungenZumAbschluss: 25,
    pdfPraefix: "wpr-07",
  },
  {
    id: "wpr-08",
    titel: "Werkvertrag & Dienstvertrag",
    beschreibung: "§§ 631 ff. BGB vs. §§ 611 ff. BGB, Abgrenzung, Mängelrechte beim Werkvertrag",
    schluesselwoerter: ["§ 631 BGB", "§ 611 BGB", "Werkvertrag", "Dienstvertrag", "Abnahme"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "wpr-08",
  },
  {
    id: "wpr-09",
    titel: "Sachenrecht: Besitz & Eigentum",
    beschreibung: "Besitz, Eigentum, Eigentumsübertragung, gutgläubiger Erwerb",
    schluesselwoerter: ["§ 854 BGB", "§ 903 BGB", "§ 929 BGB", "Besitz", "Eigentum", "Übergabe"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "wpr-09",
  },
];

export const WIMA_THEMEN: Thema[] = [
  {
    id: "wima-01",
    titel: "Einführung in die Wirtschaftsmathematik",
    beschreibung: "Grundlegende Konzepte, Aufbau und Ziele der Wirtschaftsmathematik",
    schluesselwoerter: ["Wirtschaftsmathematik", "Grundbegriffe", "Modellierung", "mathematische Notation"],
    sitzungenZumAbschluss: 10,
    pdfPraefix: "1_QM_WiMa_Einführung",
  },
  {
    id: "wima-02",
    titel: "Mathematische Grundlagen",
    beschreibung: "Mengen, Zahlenmengen, Rechenregeln, Potenzen, Logarithmen",
    schluesselwoerter: ["Mengen", "reelle Zahlen", "Potenzen", "Logarithmus", "Bruchrechnung"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "2_1_QM_WiMa_Grundlagen",
  },
  {
    id: "wima-03",
    titel: "Gleichungen & Ungleichungen",
    beschreibung: "Lineare und quadratische Gleichungen, Gleichungssysteme, Ungleichungen",
    schluesselwoerter: ["lineare Gleichung", "quadratische Gleichung", "Gleichungssystem", "Ungleichung", "pq-Formel"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "2_2_QM_WiMa_Gleichungen",
  },
  {
    id: "wima-04",
    titel: "Funktionen",
    beschreibung: "Funktionsbegriff, Funktionstypen, Definitionsbereich, Wertebereich, Graphen",
    schluesselwoerter: ["Funktion", "Definitionsbereich", "Wertebereich", "Nullstelle", "Monotonie", "Stetigkeit"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "2_3_QM_WiMa_Funktionen",
  },
  {
    id: "wima-05",
    titel: "Differentialrechnung I: Ableitungsregeln",
    beschreibung: "Ableitungsbegriff, Produkt-, Quotienten- und Kettenregel",
    schluesselwoerter: ["Ableitung", "Differenzierbarkeit", "Produktregel", "Kettenregel", "Quotientenregel"],
    sitzungenZumAbschluss: 30,
    pdfPraefix: "2_4_QM_WiMa_Differentialrechnung1",
  },
  {
    id: "wima-06",
    titel: "Differentialrechnung II: Anwendungen",
    beschreibung: "Extremwerte, Monotonie, Wendepunkte, Kurvendiskussion, Optimierung",
    schluesselwoerter: ["Extremum", "Monotonie", "Wendepunkt", "Kurvendiskussion", "Optimierung"],
    sitzungenZumAbschluss: 30,
    pdfPraefix: "2_5_QM_WiMa_Differentialrechnung2",
  },
  {
    id: "wima-07",
    titel: "Integralrechnung",
    beschreibung: "Stammfunktion, bestimmtes und unbestimmtes Integral, Integrationsmethoden, Flächeninhalt",
    schluesselwoerter: ["Integral", "Stammfunktion", "Substitution", "partielle Integration", "Flächeninhalt"],
    sitzungenZumAbschluss: 35,
    pdfPraefix: "2_6_QM_WiMa_Integralrechnung",
  },
  {
    id: "wima-08",
    titel: "Finanzmathematik",
    beschreibung: "Zinsen, Zinseszins, Rentenrechnung, Tilgungsrechnung, Barwert",
    schluesselwoerter: ["Zins", "Zinseszins", "Rente", "Tilgung", "Barwert", "Endwert", "Annuität"],
    sitzungenZumAbschluss: 25,
    pdfPraefix: "3_QM_WiMa_Finanzmathematik",
  },
];

export const STATISTIK_THEMEN: Thema[] = [
  {
    id: "statistik-01",
    titel: "Gegenstand und Grundbegriffe der Statistik",
    beschreibung: "Was ist Statistik, Grundgesamtheit, Stichprobe, Merkmal, Merkmalsausprägung",
    schluesselwoerter: ["Statistik", "Grundgesamtheit", "Stichprobe", "Merkmal", "Skalenniveau", "Häufigkeit"],
    sitzungenZumAbschluss: 10,
    pdfPraefix: "1_QM_Statistik",
  },
  {
    id: "statistik-02",
    titel: "Darstellung univariater Datensätze",
    beschreibung: "Häufigkeitstabellen, Histogramme, Balkendiagramme, Kreisdiagramme",
    schluesselwoerter: ["Häufigkeitstabelle", "absolute Häufigkeit", "relative Häufigkeit", "Histogramm", "Klassenbreite"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "2_1_QM_Statistik",
  },
  {
    id: "statistik-03",
    titel: "Lagemaße",
    beschreibung: "Arithmetisches Mittel, Median, Modus, geometrisches Mittel, Quantile",
    schluesselwoerter: ["Mittelwert", "Median", "Modus", "Quantil", "geometrisches Mittel", "Zentralwert"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "2_2_QM_Statistik_Lagemaße",
  },
  {
    id: "statistik-04",
    titel: "Streuungsmaße",
    beschreibung: "Varianz, Standardabweichung, Spannweite, Variationskoeffizient, Interquartilsabstand",
    schluesselwoerter: ["Varianz", "Standardabweichung", "Spannweite", "Variationskoeffizient", "Quartilsabstand"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "2_2_QM_Statistik_Streuungsmaße",
  },
  {
    id: "statistik-05",
    titel: "Darstellung bivariater Datensätze",
    beschreibung: "Streudiagramm, Kontingenztabelle, gemeinsame Häufigkeitsverteilung",
    schluesselwoerter: ["Streudiagramm", "bivariate Daten", "Kontingenztabelle", "Randverteilung", "bedingte Verteilung"],
    sitzungenZumAbschluss: 15,
    pdfPraefix: "3_1_Darstellung bivariater",
  },
  {
    id: "statistik-06",
    titel: "Zusammenhangsmaße",
    beschreibung: "Kovarianz, Korrelationskoeffizient nach Pearson und Spearman",
    schluesselwoerter: ["Kovarianz", "Korrelation", "Pearson", "Spearman", "Korrelationskoeffizient"],
    sitzungenZumAbschluss: 20,
    pdfPraefix: "3_2_QM_Statistik_Zusammenhangsmaße",
  },
  {
    id: "statistik-07",
    titel: "Regressionsanalyse",
    beschreibung: "Lineare Regression, Methode der kleinsten Quadrate, Bestimmtheitsmaß R²",
    schluesselwoerter: ["Regression", "kleinste Quadrate", "Regressionskoeffizient", "Bestimmtheitsmaß", "Prognose"],
    sitzungenZumAbschluss: 25,
    pdfPraefix: "3_3_QM_Statistik_Regressionsanalyse",
  },
  {
    id: "statistik-08",
    titel: "Zufallsvariablen",
    beschreibung: "Diskrete und stetige Zufallsvariablen, Wahrscheinlichkeitsverteilung, Erwartungswert, Varianz",
    schluesselwoerter: ["Zufallsvariable", "Wahrscheinlichkeit", "Erwartungswert", "Varianz", "Dichtefunktion"],
    sitzungenZumAbschluss: 25,
    pdfPraefix: "4_1_QM_Statistik_Zufallsvariablen",
  },
  {
    id: "statistik-09",
    titel: "Verteilungen",
    beschreibung: "Binomialverteilung, Normalverteilung, Standardnormalverteilung, Poisson-Verteilung",
    schluesselwoerter: ["Binomialverteilung", "Normalverteilung", "Standardnormalverteilung", "Poisson", "z-Wert"],
    sitzungenZumAbschluss: 30,
    pdfPraefix: "4_2_QM_Statistik_Verteilungen",
  },
];

export function getThemen(fach: Fach): Thema[] {
  if (fach === "wpr") return WPR_THEMEN;
  if (fach === "wima") return WIMA_THEMEN;
  return STATISTIK_THEMEN;
}

export function getAktuellesThema(fach: Fach, index: number): Thema {
  const themen = getThemen(fach);
  return themen[Math.min(index, themen.length - 1)];
}
