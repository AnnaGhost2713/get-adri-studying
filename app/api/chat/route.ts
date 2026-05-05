import { NextRequest, NextResponse } from "next/server";
import { askStudyAssistant } from "@/lib/ai-client";
import { listScriptPdfs, readAllScriptPdfs, readScriptPdf } from "@/lib/pdf-utils";

type ChatRequest = {
	question: string;
	mode: "law" | "math";
	scriptFile?: string;
};

function buildSourceHeader(fileNames: string[]) {
	return `Verwendete Skripte: ${fileNames.join(", ") || "keine"}`;
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as Partial<ChatRequest>;
		const question = body.question?.trim();
		const mode = body.mode;

		if (!question) {
			return NextResponse.json({ error: "Missing question." }, { status: 400 });
		}

		if (mode !== "law" && mode !== "math") {
			return NextResponse.json({ error: "Invalid mode. Use 'law' or 'math'." }, { status: 400 });
		}

		let docs = [] as Awaited<ReturnType<typeof readAllScriptPdfs>>;

		if (body.scriptFile) {
			const single = await readScriptPdf(body.scriptFile);
			docs = single && single.text ? [single] : [];
		} else {
			docs = await readAllScriptPdfs(3);
		}

		if (docs.length === 0) {
			return NextResponse.json(
				{
					error: "No readable PDF script found in /public/scripts.",
					hint: "Add at least one .pdf file to /public/scripts or pass scriptFile in request body.",
				},
				{ status: 400 }
			);
		}

		const combinedSource = docs
			.map((doc) => `### ${doc.fileName}\n${doc.text}`)
			.join("\n\n")
			.slice(0, 50000);

		const answer = await askStudyAssistant(combinedSource, question, mode);

		return NextResponse.json({
			answer,
			sourceInfo: buildSourceHeader(docs.map((d) => d.fileName)),
			sourceFiles: docs.map((d) => d.fileName),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown server error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

export async function GET() {
	const files = await listScriptPdfs();
	return NextResponse.json({ availableScripts: files });
}
