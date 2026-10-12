import Anthropic from "@anthropic-ai/sdk";
import { answerFromKeywords, assistantSystemPrompt } from "@/data/voiceAnswers";

/*
 * POST /api/assistant  { question: string }  →  { answer: string, source: "ai" | "keywords" }
 *
 * With AI_API_KEY set, Claude answers (model from AI_MODEL, default claude-opus-5-5).
 * Without it, or if the call fails or is declined, the keyword rules in
 * data/voiceAnswers.ts answer instead, so the demo always works.
 */

const MAX_QUESTION_LENGTH = 300;
/** Per visitor, per server instance: a light guard against someone draining the API budget. */
const RATE_LIMIT = { requests: 8, windowMs: 60_000 };

const model = process.env.AI_MODEL ?? "claude-opus-5-5";
const client = process.env.AI_API_KEY
  ? new Anthropic({ apiKey: process.env.AI_API_KEY, timeout: 20_000, maxRetries: 1 })
  : null;

/**
 * Server-side refusal fallback ("default" mode re-runs a declined request on a
 * suitable model). Only these models accept the "default" form.
 */
const supportsFallbacks = /^claude-(opus-5|fable-5-1|sonnet-5-5)/.test(model);

const recent = new Map<string, number[]>();

function rateLimited(visitor: string) {
  const now = Date.now();
  const hits = (recent.get(visitor) ?? []).filter((time) => now - time < RATE_LIMIT.windowMs);
  hits.push(now);
  recent.set(visitor, hits);
  if (recent.size > 5_000) recent.clear();
  return hits.length > RATE_LIMIT.requests;
}

function reply(answer: string, source: "ai" | "keywords") {
  return Response.json({ answer, source });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON like { \"question\": \"...\" }." }, { status: 400 });
  }
  const raw = (body as { question?: unknown } | null)?.question;
  if (typeof raw !== "string" || !raw.trim()) {
    return Response.json({ error: "The question is missing." }, { status: 400 });
  }
  const question = raw.trim().slice(0, MAX_QUESTION_LENGTH);
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!client || rateLimited(visitor)) return reply(answerFromKeywords(question), "keywords");

  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: 4096,
      // Short spoken answers to service questions don't need deep reasoning.
      output_config: { effort: "low" },
      system: assistantSystemPrompt,
      messages: [{ role: "user", content: question }],
      ...(supportsFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });

    if (response.stop_reason === "refusal") return reply(answerFromKeywords(question), "keywords");

    const answer = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join(" ")
      .trim();
    return answer ? reply(answer, "ai") : reply(answerFromKeywords(question), "keywords");
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.warn("assistant: rate limited by the API, using keyword answers");
    } else if (error instanceof Anthropic.AuthenticationError) {
      console.error("assistant: AI_API_KEY was rejected, using keyword answers");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`assistant: API error ${error.status}, using keyword answers`);
    } else {
      console.error("assistant: request failed, using keyword answers", error);
    }
    return reply(answerFromKeywords(question), "keywords");
  }
}
