import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY (or GOOGLE_API_KEY) in env" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemHint = `You are a helpful website assistant. Answer in English if the user's prompt is English. Prioritize the provided page context.`;

    const pageBlock = context?.pageText ? `\n\n=== PAGE CONTEXT (truncated) ===\n${context.pageText}\n=== END CONTEXT ===` : '';
    const urlLine = context?.url ? `\nSource URL: ${context.url}` : '';

    const fullPrompt = `${systemHint}${urlLine}${pageBlock}\n\nUser question: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ error: "Failed to fetch Gemini response" }, { status: 500 });
  }
}
