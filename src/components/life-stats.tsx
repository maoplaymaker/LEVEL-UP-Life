import { useState } from "react";
import { BarChart3, BatteryCharging, CalendarCheck, Check, BookOpen, Dumbbell, Heart, Home, PiggyBank, Radar as RadarIcon, Sparkles, Sun } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Category, LifeStat, Mission } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const categoryIcon: Record<Category, typeof Dumbbell> = {
  Salud: Dumbbell,
  Estudio: BookOpen,
  Trabajo: BatteryCharging,
  Finanzas: PiggyBank,
  Relaciones: Heart,
  Familia: Home,
  Ocio: Sparkles,
  Espiritualidad: Sun,
};

type Accent = "neon" | "electric" | "violet";
const accentOf: Record<Category, Accent> = {
  Salud: "neon", Estudio: "electric", Trabajo: "violet", Finanzas: "neon",
  Relaciones: "violet", Familia: "electric", Ocio: "violet", Espiritualidad: "electric",
};
const accentClass: Record<Accent, { chip: string; text: string; rail: string }> = {
  neon: { chip: "text-neon border-neon/25 bg-neon/10", text: "text-neon", rail: "stat-neon" },
  electric: { chip: "text-electric border-electric/25 bg-electric/10", text: "text-electric", rail: "stat-electric" },
  violet: { chip: "text-violet border-violet/25 bg-violet/10", text: "text-violet", rail: "stat-violet" },
};

export const categoryClass = Object.fromEntries(
  (Object.keys(accentOf) as Category[]).map((c) => [c, accentClass[accentOf[c]].chip]),
) as Record<Category, string>;

type Mode = "bars" | "wheel" | "week";
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const weekDays = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });

const WEEK_CHECKS_KEY = "lul-week-checks";
const loadChecks = (): Record<string, boolean> => {
  try { return JSON.parse(localStorage.getItem(WEEK_CHECKS_KEY) ?? "{}"); } catch { return {}; }
};

function WeekChecks({ stats, missions, onCheck }: { stats: LifeStat[]; missions: Mission[]; onCheck?: ((category: Category) => void) | undefined }) {
  const { t } = useI18n();
  const days = weekDays();
  const today = iso(new Date());
  const [manual, setManual] = useState<Record<string, boolean>>(loadChecks);
  const auto = (c: Category, day: string) => missions.some((m) => m.completed && m.category === c && m.completedOn === day);
  const isOn = (c: Category, day: string) => auto(c, day) || !!manual[`${c}|${day}`];
  const toggle = (c: Category, day: string) => {
    const key = `${c}|${day}`;
    const next = { ...manual, [key]: !manual[key] };
    setManual(next);
    try { localStorage.setItem(WEEK_CHECKS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    // XP is granted once per area/day, so toggling a check off and on cannot farm points.
    if (next[key]) {
      let awarded: string[] = [];
      try { awarded = JSON.parse(localStorage.getItem(`${WEEK_CHECKS_KEY}-xp`) ?? "[]"); } catch { /* ignore */ }
      if (!awarded.includes(key)) {
        onCheck?.(c);
        try { localStorage.setItem(`${WEEK_CHECKS_KEY}-xp`, JSON.stringify([...awarded, key])); } catch { /* ignore */ }
      }
    }
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("life.weekSub")}</p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[32rem] text-sm">
          <thead><tr className="border-b border-border">
            <th className="p-2 text-left font-mono text-[10px] uppercase text-muted-foreground" />
            {days.map((d) => <th key={iso(d)} className={cn("p-2 text-center font-mono text-[10px] uppercase text-muted-foreground", iso(d) === today && "text-neon")}>{d.toLocaleDateString(undefined, { weekday: "short" })}<br />{d.getDate()}</th>)}
            <th className="p-2 text-center font-mono text-[10px] uppercase text-muted-foreground">{t("life.days")}</th>
          </tr></thead>
          <tbody>
            {stats.map(({ category: c }) => { const Icon = categoryIcon[c]; const a = accentClass[accentOf[c]]; const count = days.filter((d) => isOn(c, iso(d))).length; return (
              <tr key={c} className="border-b border-border/60 last:border-0">
                <td className="p-2"><span className="flex items-center gap-2 font-medium"><Icon className={cn("h-4 w-4 shrink-0", a.text)} /><span className="truncate">{t(`cat.${c}`)}</span></span></td>
                {days.map((d) => { const day = iso(d); const on = isOn(c, day); const locked = auto(c, day); return (
                  <td key={day} className="p-1 text-center">
                    <button type="button" disabled={locked} aria-pressed={on} aria-label={`${t(`cat.${c}`)} ${day}`} onClick={() => toggle(c, day)}
                      className={cn("mx-auto grid h-8 w-8 place-items-center border transition-colors", on ? cn(a.chip, "shadow-[0_0_10px_-2px_currentColor]") : "border-border text-transparent hover:border-neon/50")}>
                      <Check className="h-4 w-4" />
                    </button>
                  </td>); })}
                <td className={cn("p-2 text-center font-mono text-xs", a.text)}>{count}/7</td>
              </tr>); })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LifeStatsPanel({ stats, missions = [], onReflect, onCheck }: { stats: LifeStat[]; missions?: Mission[]; onReflect?: (category: Category, reflection: string) => void; onCheck?: (category: Category) => void }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("bars");
  const [reflections, setReflections] = useState<Partial<Record<Category, string>>>({});
  const balance = Math.round(stats.reduce((sum, s) => sum + s.level + (s.level >= 10 ? 0 : s.xp / s.nextLevelXp), 0) / stats.length * 10) / 10;

  return (
    <section className="border border-border bg-card/70 p-5 sm:p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase text-violet">{t("life.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-bold">{t("life.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("life.sub")} <span className="font-mono text-neon">{balance}/10</span></p>
        </div>
        <div className="flex border border-border p-1" role="group">
          <Button size="sm" variant="ghost" aria-pressed={mode === "bars"} onClick={() => setMode("bars")} className={cn("gap-2", mode === "bars" && "bg-neon/10 text-neon")}><BarChart3 /> {t("life.bars")}</Button>
          <Button size="sm" variant="ghost" aria-pressed={mode === "wheel"} onClick={() => setMode("wheel")} className={cn("gap-2", mode === "wheel" && "bg-violet/10 text-violet")}><RadarIcon /> {t("life.wheel")}</Button>
          <Button size="sm" variant="ghost" aria-pressed={mode === "week"} onClick={() => setMode("week")} className={cn("gap-2", mode === "week" && "bg-electric/10 text-electric")}><CalendarCheck /> {t("life.week")}</Button>
        </div>
      </div>

      {mode === "week" ? <WeekChecks stats={stats} missions={missions} onCheck={onCheck} /> : mode === "bars" ? (
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {stats.map((stat) => {
            const Icon = categoryIcon[stat.category];
            const a = accentClass[accentOf[stat.category]];
            const pct = Math.round((stat.xp / stat.nextLevelXp) * 100);
            return (
              <div key={stat.category} className={cn("stat-row", a.rail)}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2"><span className="stat-icon"><Icon className="h-4 w-4" /></span><span className="truncate text-sm font-semibold">{t(`cat.${stat.category}`)}</span></div>
                  <span className={cn("shrink-0 font-mono text-xs", a.text)}>{t("life.lv")} {stat.level}</span>
                </div>
                <div className="stat-rail" aria-label={`${t(`cat.${stat.category}`)} ${t("life.lv")} ${stat.level}/10 · ${stat.level >= 10 ? t("life.max") : `${stat.xp}/${stat.nextLevelXp} XP`}`}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="stat-segment">
                      {i < stat.level && <div className="stat-fill absolute inset-0" />}
                      {i === stat.level && <div className="stat-fill absolute inset-y-0 left-0 transition-[width] duration-700" style={{ width: `${pct}%` }} />}
                    </div>
                  ))}
                </div>
                 <p className="mt-2 text-right font-mono text-[10px] text-muted-foreground">{stat.level >= 10 ? t("life.max") : `${stat.xp}/${stat.nextLevelXp} XP`}</p>
                 {stat.level >= 10 && <div className="mt-3 space-y-2 border-t border-border pt-3">
                   <p className="text-xs text-muted-foreground">{stat.reflection ? t("life.reflected") : t("life.review")}</p>
                   {stat.reflection ? <p className="text-sm text-foreground">{stat.reflection}</p> : onReflect && <><Textarea aria-label={`${t("life.review")} · ${t(`cat.${stat.category}`)}`} value={reflections[stat.category] ?? ""} maxLength={240} onChange={(e) => setReflections((current) => ({ ...current, [stat.category]: e.target.value }))} /><Button size="sm" variant="outline" disabled={!(reflections[stat.category]?.trim())} onClick={() => onReflect(stat.category, reflections[stat.category]?.trim() ?? "")}>{t("life.saveReview")}</Button></>}
                 </div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-80 w-full sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={stats.map((s) => ({ area: t(`cat.${s.category}`), value: s.level >= 10 ? 10 : s.level + s.xp / s.nextLevelXp }))} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tickCount={6} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="var(--neon)" fill="var(--violet)" fillOpacity={0.3} strokeWidth={2} isAnimationActive />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
