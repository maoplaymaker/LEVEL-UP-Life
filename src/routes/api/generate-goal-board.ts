import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { generateImage, imageSettings } from "@/lib/image-gateway.server";

const Body = z.object({ prompt: z.string().trim().min(20).max(1800), stream: z.boolean().default(true) });

export const Route = createFileRoute("/api/generate-goal-board")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input: z.infer<typeof Body>;
        try { input = Body.parse(await request.json()); }
        catch { return Response.json({ message: "Invalid vision board request" }, { status: 400 }); }
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ message: "LOVABLE_API_KEY is not configured" }, { status: 500 });
        const prompt = `Create one cohesive cinematic vision board for a personal goal. ${input.prompt}. Minimal premium editorial collage, grounded and achievable lifestyle, diverse anonymous people only when useful, rich real-world details, dark cyberpunk accents in emerald green, electric blue and warm gold, optimistic natural light, no readable text, no logos, no interface, no copyrighted characters.`;
        const upstream = await generateImage({ ...imageSettings, apiKey }, prompt, input.stream);
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});