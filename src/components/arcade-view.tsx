import { useState } from "react";
import { Box, Coins, Dices, Heart, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { categoryClass, categoryIcon } from "@/components/life-stats";
import { PageTitle, rarityClass, type Update } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, levelUpService, type Category, type ChestResult, type DashboardData, type LifeStat } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";

const today = () => new Date().toDateString();
const SLICE = 360 / CATEGORIES.length;
const sliceColors = ["var(--neon)", "var(--electric)", "var(--violet)", "var(--gold)"];

export function weakestArea(stats: LifeStat[]): Category {
  return [...stats].sort((a, b) => a.level * a.nextLevelXp + a.xp - (b.level * b.nextLevelXp + b.xp))[0]!.category;
}

/** Daily positive message reinforcing the weakest life area. */
export function DailyBoost({ stats }: { stats: LifeStat[] }) {
  const { t } = useI18n();
  const cat = weakestArea(stats);
  const Icon = categoryIcon[cat];
  const idx = new Date().getDate() % 2 + 1;
  return (
    <section className="relative overflow-hidden border border-violet/30 bg-violet/5 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-violet"><Heart className="h-3.5 w-3.5" />{t("arc.dailyTitle")}</div>
      <p className="text-lg font-semibold leading-snug sm:text-xl">“{t(`msg.${cat}.${idx}`)}”</p>
      <p className={cn("mt-3 flex items-center gap-2 text-xs", categoryClass[cat])}><Icon className="h-4 w-4" />{t("arc.focus", { cat: t(`cat.${cat}`) })}</p>
    </section>
  );
}

export function ArcadeView({ data, update }: { data: DashboardData; update: Update }) {
  const { t, n } = useI18n();
  const focus = weakestArea(data.lifeStats);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<{ category: Category; titleKey: string; xp: number } | null>(null);
  const [opening, setOpening] = useState(false);
  const [loot, setLoot] = useState<ChestResult | null>(null);
  const spunToday = data.arcade.lastSpin === today();
  const chestToday = data.arcade.lastChest === today();

  const spin = async () => {
    if (spinning || spunToday) return;
    setSpinning(true);
    setSpinResult(null);
    try {
      const res = await levelUpService.spinWheel(focus);
      const i = CATEGORIES.indexOf(res.category);
      const target = 360 - (i * SLICE + SLICE / 2);
      setAngle((a) => a - (a % 360) + 360 * 6 + target);
      await new Promise((r) => setTimeout(r, 3200));
      setSpinResult(res);
      update((d) => ({
        ...d,
        arcade: { ...d.arcade, lastSpin: today() },
        missions: [{ id: `spin_${Date.now()}`, title: "", titleKey: res.titleKey, category: res.category, difficulty: "Media", xp: res.xp, type: "daily", completed: false }, ...d.missions],
      }));
      toast.success(t("arc.spinAdded"));
    } catch { toast.error(t("toast.fail")); } finally { setSpinning(false); }
  };

  const openChest = async () => {
    if (opening || chestToday) return;
    setOpening(true);
    try {
      const res = await levelUpService.openChest(data.ownedItems);
      setLoot(res);
      update((d) => ({
        ...d,
        arcade: { ...d.arcade, lastChest: today() },
        player: { ...d.player, totalPoints: d.player.totalPoints + res.coins },
        ownedItems: res.itemId ? [...d.ownedItems, res.itemId] : d.ownedItems,
      }));
      toast.success(t("arc.chestGot", { n: n(res.coins) }));
    } catch { toast.error(t("toast.fail")); } finally { setOpening(false); }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <PageTitle eyebrow={t("arc.eyebrow")} title={t("arc.title")} subtitle={t("arc.subtitle")} />
      <DailyBoost stats={data.lifeStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-card/70 p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase text-electric"><Dices className="h-4 w-4" />{t("arc.wheel")}</div>
          <p className="mb-6 text-sm text-muted-foreground">{t("arc.wheelSub", { cat: t(`cat.${focus}`) })}</p>
          <div className="relative mx-auto aspect-square w-full max-w-xs">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 border-x-[10px] border-t-[18px] border-x-transparent border-t-foreground" />
            <svg viewBox="-100 -100 200 200" className="h-full w-full drop-shadow-[0_0_18px_var(--electric)]" style={{ transform: `rotate(${angle}deg)`, transition: spinning ? "transform 3.2s cubic-bezier(.17,.67,.12,1)" : "none" }}>
              {CATEGORIES.map((c, i) => {
                const a0 = ((i * SLICE - 90) * Math.PI) / 180;
                const a1 = (((i + 1) * SLICE - 90) * Math.PI) / 180;
                const mid = (((i + 0.5) * SLICE - 90) * Math.PI) / 180;
                return (
                  <g key={c}>
                    <path d={`M0 0 L${95 * Math.cos(a0)} ${95 * Math.sin(a0)} A95 95 0 0 1 ${95 * Math.cos(a1)} ${95 * Math.sin(a1)}Z`} fill={sliceColors[i % 4]} fillOpacity={c === focus ? 0.55 : 0.22} stroke="var(--background)" strokeWidth="1.5" />
                    <text x={62 * Math.cos(mid)} y={62 * Math.sin(mid)} fill="var(--foreground)" fontSize="8.5" fontWeight="600" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(i + 0.5) * SLICE} ${62 * Math.cos(mid)} ${62 * Math.sin(mid)})`}>{t(`cat.${c}`)}</text>
                  </g>
                );
              })}
              <circle r="14" fill="var(--card)" stroke="var(--electric)" strokeWidth="2" />
            </svg>
          </div>
          <Button className="mt-6 w-full electric-shadow" disabled={spinning || spunToday} onClick={() => void spin()}>
            {spinning ? <LoaderCircle className="animate-spin" /> : <Dices />}{spunToday ? t("arc.comeBack") : t("arc.spin")}
          </Button>
          {spinResult && (
            <div className="mt-4 animate-scale-in border border-neon/40 bg-neon/5 p-4">
              <p className="font-mono text-[10px] uppercase text-neon">{t("arc.newQuest")} · +{spinResult.xp} XP</p>
              <p className="mt-1 font-semibold">{t(spinResult.titleKey)}</p>
            </div>
          )}
        </section>

        <section className="flex flex-col border border-border bg-card/70 p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase text-gold"><Box className="h-4 w-4" />{t("arc.chest")}</div>
          <p className="mb-6 text-sm text-muted-foreground">{t("arc.chestSub")}</p>
          <button type="button" onClick={() => void openChest()} disabled={opening || chestToday} aria-label={t("arc.open")} className="mx-auto grid flex-1 place-items-center disabled:cursor-default">
            <div className={cn("relative grid h-40 w-40 place-items-center border-2 border-gold/60 bg-gold/10 transition-transform", opening && "animate-chest", !chestToday && !opening && "hover:scale-105", loot && "border-neon")}>
              {loot ? <div className="animate-scale-in text-center"><Coins className="mx-auto h-10 w-10 text-gold" /><p className="mt-2 font-mono text-2xl font-bold text-gold">+{n(loot.coins)}</p></div> : <Box className="h-20 w-20 text-gold" strokeWidth={1.2} />}
              {loot && <Sparkles className="absolute -right-3 -top-3 h-8 w-8 text-neon" />}
            </div>
          </button>
          {loot && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <Badge variant="outline" className={rarityClass[loot.rarity]}>{t(`rarity.${loot.rarity}`)}</Badge>
              <span>{t("arc.chestGot", { n: n(loot.coins) })}</span>
              {loot.itemId && <span className="text-neon">+ {t(`item.${loot.itemId}`)}</span>}
            </div>
          )}
          <Button variant="outline" className="mt-6 w-full border-gold/40 text-gold" disabled={opening || chestToday} onClick={() => void openChest()}>
            {opening ? <LoaderCircle className="animate-spin" /> : <Box />}{chestToday ? t("arc.comeBack") : t("arc.open")}
          </Button>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">{t("arc.serverNote")}</p>
    </div>
  );
}
