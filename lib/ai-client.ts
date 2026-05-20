import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function callGemini(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export function extractJSON<T>(text: string): T {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return JSON.parse(codeBlock[1].trim()) as T;
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return JSON.parse(obj[0]) as T;
  throw new Error(`Kein JSON in Antwort: ${text.slice(0, 300)}`);
}

export async function askStudyAssistant(pdfText: string, userPrompt: string, mode: 'law' | 'math') {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const lawInstruction = [
    "You are a German law learning assistant focused on Gutachtenstil.",
    "You must use only the SOURCE text below for legal definitions and rules.",
    "If the answer is not explicitly supported by SOURCE, reply: 'Nicht im Skript enthalten.'",
    "Structure legal answers as: Obersatz, Definition, Subsumtion, Ergebnis.",
    "After your analysis add a section titled 'Quellenbelege'.",
    "In 'Quellenbelege', provide at least two short direct quotes from SOURCE in this format:",
    "- [filename] \"exact quote from source\"",
    "Never invent a definition. If no direct quote is possible, return only: 'Nicht im Skript enthalten.'"
  ].join(" ");

  const mathInstruction = [
    "You are a mathematics tutor.",
    "Use only the SOURCE text for formulas and methods.",
    "If the method is not in SOURCE, state that clearly.",
    "Provide step-by-step reasoning and render formulas in LaTeX delimiters."
  ].join(" ");

  const systemInstruction = mode === "law" ? lawInstruction : mathInstruction;

  const prompt = [
    `MODE: ${mode}`,
    `INSTRUCTION: ${systemInstruction}`,
    "SOURCE:",
    pdfText,
    "QUESTION:",
    userPrompt
  ].join("\n\n");

  const result = await model.generateContent(prompt);
  return result.response.text();
}