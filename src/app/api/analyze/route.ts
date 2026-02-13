import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages, task, duration } = await req.json();

  const userMessages = messages.filter((m: { role: string }) => m.role === "user");
  const promptCount = userMessages.length;

  const conversationText = messages
    .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const analysisPrompt = `You are evaluating a candidate's ability to collaborate with AI. They were given this task:

"${task}"

Here is their conversation with the AI assistant:

${conversationText}

---

Analyze their performance and return a JSON object with these exact fields:
{
  "score": <overall score 0-100>,
  "promptQuality": {
    "score": <0-100>,
    "feedback": "<1 sentence explaining the score>"
  },
  "contextProvided": {
    "score": <0-100>,
    "feedback": "<1 sentence explaining the score>"
  },
  "iteration": {
    "score": <0-100>,
    "feedback": "<1 sentence explaining the score>"
  },
  "efficiency": {
    "score": <0-100>,
    "feedback": "<1 sentence explaining the score>"
  },
  "summary": "<2-3 sentences overall assessment>"
}

Scoring guide:
- promptQuality: Were their prompts clear, specific, and well-structured?
- contextProvided: Did they give relevant context (names, details, tone preferences)?
- iteration: Did they review output and ask for meaningful improvements?
- efficiency: Did they accomplish the task without excessive back-and-forth?

Be fair but discriminating - not everyone should get 90+. A vague "write me an email" with no follow-up is a 40-50. Excellent prompts with good iteration is 85+.

They used ${promptCount} prompts and took ${Math.round(duration / 60)} minutes.

Return ONLY the JSON object, no other text.`;

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: analysisPrompt,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    
    // Fallback analysis
    return NextResponse.json({
      score: 65,
      promptQuality: { score: 65, feedback: "Analysis unavailable" },
      contextProvided: { score: 65, feedback: "Analysis unavailable" },
      iteration: { score: 65, feedback: "Analysis unavailable" },
      efficiency: { score: 65, feedback: "Analysis unavailable" },
      summary: "Unable to generate detailed analysis. Please try again.",
    });
  }
}
