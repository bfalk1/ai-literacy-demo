import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, systemPrompt } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt || "You are a helpful AI assistant.",
    messages,
  });

  return result.toTextStreamResponse();
}
