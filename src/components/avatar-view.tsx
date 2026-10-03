import { useEffect, useState } from "react";
import { Check, Crown, LoaderCircle, Lock, Palette, Save, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

import { AvatarFigure, PetFigure, WardrobeItem } from "@/components/avatar";
import { PageTitle, SectionLabel, rarityClass, type Update } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { AVATAR_ITEMS, SLOTS, THEMES, canWearOutfit, levelUpService, type AvatarState, type DashboardData, type Slot } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";
import { WorldBanner } from "@/components/world-banner";

export function AvatarView({ data, update, onGoStore }: { data: DashboardData; update: Update; onGoStore: () => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<AvatarState>(data.avatar);
  const [slot, setSlot] = useState<Slot>("character");
  const [saving, setSaving] = useState(false);
  const [themeBusy, setThemeBusy] = useState<string | null>(null);
  useEffect(() => setDraft(data.avatar), [data.avatar]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(data.avatar);
  const ownedItems = new Set([...data.ownedItems, ...AVATAR_ITEMS.filter((i) => i.source === "free").map((i) => i.id)]);
  const trying = Object.values(draft.equipped).filter((id): id is string => !!id && !ownedItems.has(id) && AVATAR_ITEMS.some((i) => i.id === id));

  const save = async () => {
    setSaving(true);
    try {
      const saved = await levelUpService.saveAvatar(draft);
      update((d) => ({ ...d, avatar: saved }));
      toast.success(t("av.saved"));
    } catch { toast.error(t("toast.fail")); } finally { setSaving(false); }
  };

  const applyTheme = async (id: string) => {
    setThemeBusy(id);
    try {
      await levelUpService.setTheme(id);
      update((d) => ({ ...d, themeId: id }));
      toast.success(t("theme.applied"));
    } finally { setThemeBusy(null); }
  };

  const toggleItem = (id: string, s: Slot) => setDraft((a) => ({ ...a, equipped: {
    ...a.equipped,
    ...(s === "character" && a.equipped.character !== id ? { outfit: null, accessory: null } : {}),
    [s]: a.equipped[s] === id ? null : id,
  } }));
  const bonuses = AVATAR_ITEMS.filter((item) => draft.equipped[item.slot] === item.id && item.bonus)
    .reduce<Record<string, number>>((sum, item) => {
      if (!item.bonus) return sum;
      sum[item.bonus.category] = (sum[item.bonus.category] ?? 0) + item.bonus.value;
      return sum;
    }, {});

  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("av.eyebrow")} title={t("av.title")} subtitle={t("av.subtitle")} action={<Button onClick={() => void save()} disabled={!dirty || saving || trying.length > 0} className="neon-shadow">{saving ? <LoaderCircle className="animate-spin" /> : <Save />}{t("av.save")}</Button>} />

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden border border-violet/30 electric-shadow"><AvatarFigure avatar={draft} className="block aspect-square w-full" /></div>
          {trying.length > 0 && <div className="border border-gold/40 bg-gold/10 p-3 text-xs">
            <p className="font-semibold text-gold">{t("av.tryingOn")}</p>
            <p className="mt-1 text-muted-foreground">{trying.map((id) => t(`item.${id}`)).join(", ")}</p>
            <div className="mt-2 flex gap-2"><Button size="sm" onClick={onGoStore}><ShoppingBag />{t("nav.store")}</Button><Button size="sm" variant="ghost" onClick={() => setDraft(data.avatar)}>{t("av.stopTrying")}</Button></div>
          </div>}
          <p className="text-xs text-muted-foreground">{t("av.petHint")}</p>
          <div className="border border-border bg-card/80 p-4">
            <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase text-neon"><Sparkles className="h-4 w-4" />{t("av.statusBonus")}</p>
            <div className="flex flex-wrap gap-2">{Object.entries(bonuses).length ? Object.entries(bonuses).map(([category, value]) => <Badge key={category} variant="outline">{t(`cat.${category}`)} +{value}%</Badge>) : <span className="text-xs text-muted-foreground">{t("av.noBonus")}</span>}</div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-1 border border-border p-1" role="tablist">
            {SLOTS.map((s) => <Button key={s} role="tab" aria-selected={slot === s} size="sm" variant="ghost" onClick={() => setSlot(s)} className={cn("flex-1", slot === s && "bg-neon/10 text-neon")}>{t(`slot.${s}`)}</Button>)}
          </div>
           {(slot === "outfit" || slot === "accessory") && <p className="mb-3 font-mono text-xs uppercase text-neon">{t("av.inventory")} · {AVATAR_ITEMS.filter((item) => item.slot === slot && ownedItems.has(item.id)).length} / {AVATAR_ITEMS.filter((item) => item.slot === slot).length}</p>}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {AVATAR_ITEMS.filter((i) => i.slot === slot && (slot !== "outfit" || canWearOutfit(draft.equipped.character, i.id))).sort((a, b) => Number(ownedItems.has(b.id)) - Number(ownedItems.has(a.id))).map((item) => {
               const owned = ownedItems.has(item.id);
              const equipped = draft.equipped[slot] === item.id;
               const preview: AvatarState = { ...draft, equipped: { ...draft.equipped, ...(slot === "character" ? { outfit: null, accessory: null } : {}), [slot]: item.id } };
              const SourceIcon = item.source === "reward" ? Trophy : item.source === "premium" ? Crown : ShoppingBag;
              return (
                <Button key={item.id} type="button" variant="ghost" onClick={() => toggleItem(item.id, slot)} className={cn("group h-auto min-h-28 min-w-0 justify-start gap-3 whitespace-normal rounded-none border bg-card/80 p-3 text-left transition-all", owned ? "hover:border-electric/50" : "border-dashed opacity-80 hover:opacity-100", equipped ? "border-neon neon-shadow" : "border-border")}>
                  {slot === "pet" ? <PetFigure pet={item.id} className="h-[100px] w-[84px] shrink-0" /> : slot === "outfit" || slot === "accessory" ? <WardrobeItem itemId={item.id} className="h-24 w-20 shrink-0 border border-border" /> : <AvatarFigure avatar={preview} priority className="h-20 w-16 shrink-0 border border-border" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t(`item.${item.id}`)}</p>
                    <Badge variant="outline" className={cn("mt-1 text-[10px]", rarityClass[item.rarity])}>{t(`rarity.${item.rarity}`)}</Badge>
                    {item.bonus && <p className="mt-1 font-mono text-[10px] text-electric">{t(`cat.${item.bonus.category}`)} +{item.bonus.value}%</p>}
                    <p className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
                      {equipped && !owned ? <span className="text-gold">{t("av.tryingLabel")}</span> : equipped ? <><Check className="h-3 w-3 text-neon" />{t("av.equipped")}</> : owned ? null : <><Lock className="h-3 w-3" /><SourceIcon className="h-3 w-3" />{item.source === "reward" ? t("av.fromBadge") : item.source === "premium" ? t("av.premium") : t("av.inStore")}</>}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
          <Button variant="ghost" onClick={onGoStore} className="mt-3 text-electric"><ShoppingBag /> {t("nav.store")}</Button>
        </div>
      </div>

      <section className="mt-10">
        <SectionLabel><Palette className="mr-2 inline h-3.5 w-3.5" />{t("av.themes")}</SectionLabel>
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">{t("av.themesSub")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {THEMES.map((theme) => {
            const owned = data.ownedThemes.includes(theme.id);
            const active = data.themeId === theme.id;
            return (
              <div key={theme.id} data-theme={theme.id} className={cn("border bg-background p-4", active ? "border-neon neon-shadow" : "border-border")}>
                <div className="mb-3 flex gap-1"><span className="h-6 flex-1 bg-neon" /><span className="h-6 flex-1 bg-electric" /><span className="h-6 flex-1 bg-violet" /></div>
                <p className="font-semibold text-foreground">{t(`themeName.${theme.id}`)}</p>
                <p className="mb-3 font-mono text-[10px] uppercase text-muted-foreground">{theme.comingSoon ? t("theme.soon") : theme.premium ? t("av.premium") : theme.cost ? t("av.inStore") : "Free"}</p>
                {active ? <Badge className="bg-neon/15 text-neon">{t("theme.active")}</Badge>
                  : owned ? <Button size="sm" variant="outline" disabled={themeBusy !== null} onClick={() => void applyTheme(theme.id)}>{themeBusy === theme.id && <LoaderCircle className="animate-spin" />}{t("theme.apply")}</Button>
                  : <Button size="sm" variant="ghost" disabled={theme.comingSoon} onClick={onGoStore}><Lock />{theme.comingSoon ? t("theme.soon") : t("nav.store")}</Button>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-10"><WorldBanner compact onExplore={onGoStore} /></div>
    </div>
  );
}
