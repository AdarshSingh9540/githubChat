import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Ensure the request body is parsed correctly
        const data = await req.json();
        
        // Validate input
        if (!data.body) {
            return NextResponse.json({ 
                error: 'No input provided' 
            }, { status: 400 });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || '');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate content
        const prompt = data.body;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = await response.text();

        // Return response
        return NextResponse.json({ output: output });
    }
    catch(err) {
        console.error('Error in chat API:', err);
        
        // More detailed error handling
        return NextResponse.json({ 
            error: 'An error occurred while processing your request',
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}