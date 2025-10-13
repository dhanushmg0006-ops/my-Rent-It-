// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pick the last message from the user
    const messages = body.messages;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "No messages provided." },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");

    if (!lastUserMessage?.content) {
      return NextResponse.json(
        { reply: "No user message found." },
        { status: 400 }
      );
    }

    // Call OpenAI Chat API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: lastUserMessage.content },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content || "No response from AI.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("AI error:", err);
    return NextResponse.json(
      { reply: "⚠️ AI is not available right now." },
      { status: 500 }
    );
  }
}
