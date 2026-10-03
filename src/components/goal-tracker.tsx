import { useState, type FormEvent } from "react";
import { BarChart3, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageTitle, SectionLabel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, type Category } from "@/lib/level-up-service";

export type TrackedGoal = { id: string; title: string; unit: string; target: number; current: number; checks: string[]; category: Category; rewarded?: boolean };
export type TrackerView = "bars" | "table" | "cards";
export type TrackerState = { goals: TrackedGoal[]; view: TrackerView };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const lastDays = (n: number) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return d; });

export const initialTracker: TrackerState = {
  view: "bars",
  goals: [
    { id: "g_save", title: "Ahorrar para viaje", unit: "$", target: 1000, current: 350, category: "Finanzas", checks: lastDays(7).filter((_, i) => i % 2 === 0).map(iso) },
    { id: "g_read", title: "Leer 12 libros", unit: "libros", target: 12, current: 4, category: "Estudio", checks: lastDays(7).slice(3).map(iso) },
  ],
};

export function GoalTracker({ state, setState, onGoalReached }: { state: TrackerState; setState: (fn: (s: TrackerState) => TrackerState) => void; onGoalReached: (category: Category) => void }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("$");
  const [category, setCategory] = useState<Category>("Finanzas");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const today = iso(new Date());

  const patch = (id: string, fn: (g: TrackedGoal) => TrackedGoal) => setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? fn(g) : g)) }));
  const addAmount = (g: TrackedGoal) => {
    const n = Number(amounts[g.id]);
    if (!Number.isFinite(n) || n <= 0) return;
    const reached = g.current < g.target && g.current + n >= g.target && !g.rewarded;
    patch(g.id, (x) => ({ ...x, current: Math.min(x.target, x.current + n), rewarded: x.rewarded || reached, checks: x.checks.includes(today) ? x.checks : [...x.checks, today] }));
    setAmounts((a) => ({ ...a, [g.id]: "" }));
    if (reached) { onGoalReached(g.category); toast.success(t("gt.reached")); }
  };
  const create = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(target);
    if (!title.trim() || !Number.isFinite(n) || n <= 0) return;
    setState((s) => ({ ...s, goals: [...s.goals, { id: `g_${Date.now()}`, title: title.trim(), unit: unit.trim() || "#", target: n, current: 0, checks: [], category }] }));
    setTitle(""); setTarget("");
    toast.success(t("toast.created"));
  };
  const pct = (g: TrackedGoal) => Math.min(100, Math.round((g.current / g.target) * 100));
  const remove = (id: string) => setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));

  const AmountInput = ({ g }: { g: TrackedGoal }) => (
    <div className="flex gap-2">
      <Input type="number" inputMode="decimal" value={amounts[g.id] ?? ""} onChange={(e) => setAmounts((a) => ({ ...a, [g.id]: e.target.value }))} placeholder={t("gt.addAmount")} className="h-9" />
      <Button size="sm" onClick={() => addAmount(g)} aria-label={t("tools.add")}><Plus /></Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageTitle eyebrow={t("tools.organize")} title={t("tools.tracker")} subtitle={t("tools.tracker.sub")}
        action={
          <ToggleGroup type="single" value={state.view} onValueChange={(v) => v && setState((s) => ({ ...s, view: v as TrackerView }))} variant="outline">
            <ToggleGroupItem value="bars" aria-label={t("gt.bars")}><BarChart3 /><span className="text-xs">{t("gt.bars")}</span></ToggleGroupItem>
            <ToggleGroupItem value="cards" aria-label={t("gt.cards")}><LayoutGrid /><span className="text-xs">{t("gt.cards")}</span></ToggleGroupItem>
          </ToggleGroup>
        } />

      <form onSubmit={create} className="grid grid-cols-[minmax(0,1fr)_5.5rem_4.5rem_auto] gap-2 max-sm:grid-cols-[minmax(0,1fr)_5.5rem_auto]">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("gt.placeholder")} />
        <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={t("gt.target")} />
        <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={t("gt.unit")} className="max-sm:col-start-1" />
        <Button type="submit" size="icon" aria-label={t("tools.add")}><Plus /></Button>
        <Select value={category} onValueChange={(value) => setCategory(value as Category)}><SelectTrigger className="col-span-3 min-w-0 sm:col-span-4"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((area) => <SelectItem key={area} value={area}>{t(`cat.${area}`)}</SelectItem>)}</SelectContent></Select>
      </form>

      {state.goals.length === 0 && <p className="text-sm text-muted-foreground">{t("gt.empty")}</p>}

      {(state.view === "bars" || state.view === "table") && (
        <div className="space-y-3">
          {state.goals.map((g) => (
            <Card key={g.id} className="bg-card/80"><CardContent className="space-y-3 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate font-semibold">{g.title} <span className="ml-1 font-mono text-xs font-normal text-electric">{t(`cat.${g.category}`)}</span></p>
                <span className="shrink-0 font-mono text-xs text-neon">{g.current} / {g.target} {g.unit} · {pct(g)}%</span>
              </div>
              <Progress value={pct(g)} className="h-3" />
              <div className="flex items-center gap-2"><div className="flex-1"><AmountInput g={g} /></div><Button size="icon" variant="ghost" onClick={() => remove(g.id)} aria-label={t("gt.delete")}><Trash2 /></Button></div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {state.view === "cards" && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {state.goals.map((g) => (
            <Card key={g.id} className="bg-card/80"><CardContent className="flex flex-col items-center gap-3 p-4 text-center">
              <div className="relative grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(var(--neon) ${pct(g) * 3.6}deg, var(--muted) 0)` }}>
                <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-card font-mono text-lg font-bold">{pct(g)}%</div>
              </div>
              <p className="line-clamp-2 text-sm font-semibold">{g.title}</p><p className="font-mono text-xs text-electric">{t(`cat.${g.category}`)}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{g.current} / {g.target} {g.unit}</p>
              <AmountInput g={g} />
            </CardContent></Card>
          ))}
        </div>
      )}

    </div>
  );
}
