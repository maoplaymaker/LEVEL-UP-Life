import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CATEGORIES } from "@/lib/level-up-service";

const GoalInput = z.object({
  goal: z.string().trim().min(8).max(1200),
  category: z.enum(CATEGORIES as [typeof CATEGORIES[number], ...typeof CATEGORIES[number][]]),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  locale: z.enum(["es", "en", "pt"]),
});

const GoalPlan = z.object({
  title: z.string().min(1).max(100),
  summary: z.string().min(1).max(500),
  motivation: z.string().min(1).max(400),
  visionPrompt: z.string().min(1).max(1500),
  milestones: z.array(z.string().min(1).max(120)).min(2).max(6),
  steps: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(400),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reminder: z.string().min(1).max(180),
    xp: z.number().int().min(20).max(120),
    checklist: z.array(z.string().min(1).max(240)).min(1).max(4),
  })).min(4).max(7),
});

export type GoalPlanResult = z.infer<typeof GoalPlan>;

export const generateGoalPlan = createServerFn({ method: "POST" })
  .validator((input: unknown) => GoalInput.parse(input))
  .handler(async ({ data }) => {
    const { createGoalPlanWithAi } = await import("@/lib/ai-gateway.server");
    const result = await createGoalPlanWithAi(data);
    return GoalPlan.parse(result);
  });