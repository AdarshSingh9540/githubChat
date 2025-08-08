import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change * to your frontend domain in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.body || !data.fileContent) {
      return NextResponse.json(
        { error: "No input or file content provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `User input: ${data.body}\nFile content context: ${data.fileContent}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = await response.text();

    return NextResponse.json({ output: output }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
