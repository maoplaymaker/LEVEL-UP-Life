import { useState, type Dispatch, type SetStateAction } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BellRing, CalendarDays, Check, ChevronRight, ImageIcon, LoaderCircle,
  Plus, Sparkles, Target, WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { PageTitle, SectionLabel, type Update } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateGoalPlan, type GoalPlanResult } from "@/lib/goals.functions";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, levelUpService, type Category, type DashboardData, type Mission } from "@/lib/level-up-service";
import { streamImage } from "@/lib/stream-image";
import { cn } from "@/lib/utils";

export type GoalAiState = {
  plan: GoalPlanResult | null;
  board: string;
  boardFinal: boolean;
  added: string[];
};

export const emptyGoalAiState: GoalAiState = { plan: null, board: "", boardFinal: false, added: [] };

export function GoalAi({ data, update, state, setState }: {
  data: DashboardData;
  update: Update;
  state: GoalAiState;
  setState: Dispatch<SetStateAction<GoalAiState>>;
}) {
  const { t, locale } = useI18n();
  const createPlan = useServerFn(generateGoalPlan);
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState<Category>("Trabajo");
  const [targetDate, setTargetDate] = useState("");
  const [planning, setPlanning] = useState(false);
  const [imaging, setImaging] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (goal.trim().length < 8 || planning) return;
    setPlanning(true);
    setError("");
    setState(emptyGoalAiState);
    try {
      const plan = await createPlan({ data: { goal: goal.trim(), category, ...(targetDate ? { targetDate } : {}), locale } });
      setState((current) => ({ ...current, plan }));
      setPlanning(false);
      setImaging(true);
      try {
        await streamImage("/api/generate-goal-board", { prompt: plan.visionPrompt }, (board, boardFinal) => {
          setState((current) => ({ ...current, board, boardFinal }));
        });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("goal.error"));
      } finally { setImaging(false); }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("goal.error"));
      setPlanning(false);
    }
  };

  const toMission = (step: GoalPlanResult["steps"][number], index: number): Mission => ({
    id: `goal_${Date.now()}_${index}`,
    title: step.title,
    category,
    difficulty: step.xp >= 80 ? "Difícil" : step.xp >= 45 ? "Media" : "Fácil",
    xp: step.xp,
    type: "main",
    completed: false,
    dueDate: step.dueDate,
    scheduledTime: "09:00",
    reminder: step.reminder,
    checklist: step.checklist.map((text, itemIndex) => ({ id: `goal_step_${index}_${itemIndex}_${Date.now()}`, text, done: false })),
  });

  const addStep = async (step: GoalPlanResult["steps"][number], index: number) => {
    if (state.added.includes(String(index))) return;
    const saved = await levelUpService.saveTask(toMission(step, index));
    update((current) => ({ ...current, missions: [saved, ...current.missions] }));
    setState((current) => ({ ...current, added: [...current.added, String(index)] }));
    toast.success(t("goal.added"));
  };

  const addAll = async () => {
    if (!state.plan) return;
    setAddingAll(true);
    try {
      const pending = state.plan.steps.map((step, index) => ({ step, index })).filter(({ index }) => !state.added.includes(String(index)));
      const saved = await Promise.all(pending.map(({ step, index }) => levelUpService.saveTask(toMission(step, index))));
      update((current) => ({ ...current, missions: [...saved, ...current.missions] }));
      setState((current) => ({ ...current, added: state.plan?.steps.map((_, index) => String(index)) ?? current.added }));
      toast.success(t("goal.allAdded"));
    } catch { toast.error(t("toast.fail")); }
    finally { setAddingAll(false); }
  };

  if (!state.plan) return (
    <div>
      <PageTitle eyebrow={t("goal.eyebrow")} title={t("goal.title")} subtitle={t("goal.subtitle")} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="border-neon/25 bg-card/85"><CardContent className="space-y-5 p-5 sm:p-7">
          <div className="space-y-2"><Label>{t("goal.describe")}</Label><Textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={7} maxLength={1200} placeholder={t("goal.placeholder")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t("goal.area")}</Label><Select value={category} onValueChange={(value) => setCategory(value as Category)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((item) => <SelectItem key={item} value={item}>{t(`cat.${item}`)}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{t("goal.targetDate")}</Label><Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></div>
          </div>
          {error && <p className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button onClick={() => void generate()} disabled={planning || goal.trim().length < 8} className="w-full sm:w-auto">{planning ? <LoaderCircle className="animate-spin" /> : <WandSparkles />}{planning ? t("goal.planning") : t("goal.create")}</Button>
        </CardContent></Card>
        <aside className="border border-electric/25 bg-electric/5 p-5"><Sparkles className="mb-4 h-8 w-8 text-electric" /><p className="font-bold">{t("goal.coachTitle")}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("goal.coachIntro")}</p></aside>
      </div>
    </div>
  );

  const plan = state.plan;
  return <div className="animate-fade-in space-y-8">
    <PageTitle eyebrow={t("goal.eyebrow")} title={plan.title} subtitle={plan.summary} action={<Button variant="outline" onClick={() => setState(emptyGoalAiState)}><WandSparkles />{t("goal.new")}</Button>} />
    <section className="relative aspect-[4/3] min-h-64 overflow-hidden border border-neon/30 bg-card sm:aspect-[16/7]">
      {state.board ? <img src={state.board} alt={t("goal.boardAlt")} className={cn("h-full w-full object-cover transition-[filter] duration-700", state.boardFinal ? "blur-0" : "blur-2xl")} /> : <div className="grid h-full place-items-center"><div className="text-center text-muted-foreground"><ImageIcon className="mx-auto mb-3 h-9 w-9" /><p>{t("goal.boardCreating")}</p></div></div>}
      {imaging && <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-background/85 p-3 text-xs backdrop-blur"><LoaderCircle className="h-4 w-4 animate-spin text-neon" />{t("goal.boardCreating")}</div>}
      <div className="absolute left-4 top-4"><Badge className="border-neon/40 bg-background/80 text-neon backdrop-blur">VISION BOARD</Badge></div>
    </section>
    {error && <p className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <Card className="border-electric/25 bg-electric/5"><CardContent className="flex gap-4 p-5"><Sparkles className="h-6 w-6 shrink-0 text-electric" /><div><p className="font-mono text-[10px] uppercase text-electric">{t("goal.coachSays")}</p><p className="mt-2 font-medium leading-relaxed">{plan.motivation}</p></div></CardContent></Card>
    <section><SectionLabel>{t("goal.milestones")}</SectionLabel><div className="grid gap-3 sm:grid-cols-2">{plan.milestones.map((milestone, index) => <div key={milestone} className="flex items-center gap-3 border border-border bg-card/70 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center border border-violet/40 font-mono text-xs text-violet">{index + 1}</span><p className="text-sm font-medium">{milestone}</p></div>)}</div></section>
    <section><div className="mb-4 flex items-center justify-between gap-3"><SectionLabel>{t("goal.steps")}</SectionLabel><Button size="sm" onClick={() => void addAll()} disabled={addingAll || state.added.length === plan.steps.length}>{addingAll ? <LoaderCircle className="animate-spin" /> : <Plus />}{t("goal.addAll")}</Button></div>
      <div className="space-y-3">{plan.steps.map((step, index) => { const added = state.added.includes(String(index)); return <Card key={`${step.title}-${index}`} className={cn("bg-card/80", added && "border-neon/30")}><CardContent className="p-4 sm:p-5"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center border border-neon/30 bg-neon/10 font-mono text-xs text-neon">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{step.title}</h3><p className="mt-1 text-sm text-muted-foreground">{step.description}</p></div><Badge variant="outline">+{step.xp} XP</Badge></div><div className="mt-3 flex flex-wrap gap-3 font-mono text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{step.dueDate}</span><span className="flex items-center gap-1"><BellRing className="h-3 w-3" />{step.reminder}</span></div><div className="mt-3 space-y-1">{step.checklist.map((item) => <p key={item} className="flex items-center gap-2 text-xs text-muted-foreground"><ChevronRight className="h-3 w-3 text-violet" />{item}</p>)}</div><Button variant={added ? "outline" : "default"} size="sm" disabled={added} className="mt-4" onClick={() => void addStep(step, index)}>{added ? <Check /> : <Target />}{added ? t("goal.inMissions") : t("goal.addStep")}</Button></div></div></CardContent></Card>; })}</div>
    </section>
    <p className="text-center text-xs text-muted-foreground">{t("goal.serverNote")}</p>
  </div>;
}