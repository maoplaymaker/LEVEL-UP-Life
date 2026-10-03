const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function getLovableAiGatewayRunId(request?: Request) {
  return request?.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
}

export async function createGoalPlanWithAi(input: {
  goal: string;
  category: string;
  targetDate?: string | undefined;
  locale: string;
}) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const language = input.locale === "en" ? "English" : input.locale === "pt" ? "Portuguese" : "Spanish";
  const today = new Date().toISOString().slice(0, 10);
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["title", "summary", "motivation", "visionPrompt", "milestones", "steps"],
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      motivation: { type: "string" },
      visionPrompt: { type: "string" },
      milestones: { type: "array", items: { type: "string" } },
      steps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description", "dueDate", "reminder", "xp", "checklist"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            dueDate: { type: "string" },
            reminder: { type: "string" },
            xp: { type: "integer" },
            checklist: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  };

  const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      reasoning: { effort: "medium", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: { format: { type: "json_schema", name: "goal_plan", strict: true, schema } },
      input: [{
        role: "user",
        content: [{
          type: "input_text",
          text: `You are Level Up Life's practical, supportive goal coach. Today is ${today}. Create a realistic plan in ${language}. Goal: ${input.goal}. Life area: ${input.category}. Target date: ${input.targetDate || "choose a realistic date"}. Return 4-7 chronological steps with ISO YYYY-MM-DD due dates, short reminder text, 20-120 XP, and 1-4 concrete checklist items each. Never give medical, legal, or financial guarantees. The visionPrompt must describe one cohesive aspirational cinematic vision-board image with no text, logos, real people, or copyrighted characters.`,
        }],
      }],
    }),
  });

  if (!response.ok || !response.body) {
    const message = await safeGatewayMessage(response);
    throw new Error(message);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let output = "";
  let completedText = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += chunk.value.replaceAll("\r\n", "\n");
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const data = frame.split("\n").find((line) => line.startsWith("data:"))?.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const event = JSON.parse(data) as {
          type?: string;
          delta?: string;
          error?: { message?: string };
          response?: { output_text?: string };
        };
        if (event.type === "error") throw new Error(event.error?.message ?? "AI request failed");
        if (event.type === "response.output_text.delta" && event.delta) output += event.delta;
        if (event.type === "response.completed" && event.response?.output_text) completedText = event.response.output_text;
      } catch (error) {
        if (error instanceof SyntaxError) continue;
        throw error;
      }
    }
  }
  const raw = completedText || output;
  if (!raw) throw new Error("The AI completed without returning a plan");
  return JSON.parse(raw) as unknown;
}

async function safeGatewayMessage(response: Response) {
  const fallback = `AI request failed (${response.status})`;
  try {
    const body = await response.json() as { message?: string; error?: { message?: string } };
    return body.error?.message ?? body.message ?? fallback;
  } catch {
    return fallback;
  }
}