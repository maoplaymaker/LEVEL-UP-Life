import { useState } from "react";
import { Check, Coins, Crown, Home, LoaderCircle, Lock, ShoppingBag, CarFront, Palette, PawPrint, Shirt, UserRound, Glasses, Image } from "lucide-react";
import { toast } from "sonner";

import { AvatarFigure, PetFigure, WardrobeItem } from "@/components/avatar";
import { PageTitle, SectionLabel, rarityClass, type Update } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { AVATAR_ITEMS, THEMES, levelUpService, type AvatarItem, type DashboardData, type Theme } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";

type Tab = "character" | "outfit" | "accessory" | "pet" | "scene" | "theme" | "vehicle" | "home";
const tabs: { id: Tab; icon: typeof ShoppingBag }[] = [
  { id: "character", icon: UserRound }, { id: "outfit", icon: Shirt }, { id: "accessory", icon: Glasses },
  { id: "pet", icon: PawPrint }, { id: "scene", icon: Image }, { id: "theme", icon: Palette },
  { id: "vehicle", icon: CarFront }, { id: "home", icon: Home },
];

export function CoinTag({ value }: { value: string }) {
  return <span className="inline-flex items-center gap-1 font-mono text-sm text-gold"><Coins className="h-4 w-4" />{value} LC</span>;
}

export function StoreView({ data, update }: { data: DashboardData; update: Update }) {
  const { t, n } = useI18n();
  const [tab, setTab] = useState<Tab>("character");
  const [busy, setBusy] = useState<string | null>(null);
  const coins = data.player.totalPoints;

  const buy = async (id: string, cost: number, kind: "item" | "theme", name: string) => {
    if (coins < cost || busy) return;
    setBusy(id);
    try {
      await levelUpService.buyWithPoints(id);
      update((d) => ({
        ...d,
        player: { ...d.player, totalPoints: d.player.totalPoints - cost },
        ownedItems: kind === "item" ? [...d.ownedItems, id] : d.ownedItems,
        ownedThemes: kind === "theme" ? [...d.ownedThemes, id] : d.ownedThemes,
      }));
      toast.success(t("st.bought", { item: name }));
    } catch { toast.error(t("toast.fail")); } finally { setBusy(null); }
  };

  const premium = false;
  const items = AVATAR_ITEMS.filter((i) => i.slot === tab && (i.source === "store" || i.source === "premium" || (i.slot === "outfit" && i.source === "free" && i.id !== "outfit_street")));
  const themes = tab === "theme" ? THEMES.filter((th) => th.cost) : [];

  const buyButton = (id: string, cost: number, kind: "item" | "theme", name: string, owned: boolean, soon?: boolean) =>
    owned ? <Badge className="bg-neon/15 text-neon"><Check className="mr-1 h-3 w-3" />{t("st.owned")}</Badge>
      : <Button size="sm" variant={premium ? "outline" : "default"} disabled={soon || coins < cost || busy !== null} onClick={() => void buy(id, cost, kind, name)}>
          {busy === id ? <LoaderCircle className="animate-spin" /> : coins < cost || soon ? <Lock /> : <ShoppingBag />}{soon ? t("theme.soon") : t("st.buy")}
        </Button>;

  const itemCard = (item: AvatarItem) => {
    const name = t(`item.${item.id}`);
    const cost = item.cost ?? 0;
    return (
      <Card key={item.id} className={cn("rounded-md bg-card/90 transition-all hover:-translate-y-1", premium ? "border-gold/30" : "hover:border-electric/50")}>
        <CardContent className="p-4">
          {item.slot === "pet" ? <PetFigure pet={item.id} className="mb-4 aspect-square w-full border border-border bg-card" /> : item.slot === "outfit" || item.slot === "accessory" ? <WardrobeItem itemId={item.id} className="mb-4 aspect-square w-full border border-border" /> : <AvatarFigure avatar={{ equipped: { ...data.avatar.equipped, ...(item.slot === "character" ? { outfit: null, accessory: null } : {}), [item.slot]: item.id } }} className="mb-4 aspect-square w-full border border-border" />}
          <div className="flex items-start justify-between gap-2"><h3 className="font-bold">{name}</h3><Badge variant="outline" className={cn("text-[10px]", rarityClass[item.rarity])}>{t(`rarity.${item.rarity}`)}</Badge></div>
          <p className="text-xs text-muted-foreground">{t(`slot.${item.slot}`)}</p>
          {item.bonus && <p className="mt-2 font-mono text-xs text-electric">{t(`cat.${item.bonus.category}`)} +{item.bonus.value}%</p>}
          <div className="mt-4 flex items-center justify-between gap-2"><CoinTag value={n(cost)} />{buyButton(item.id, cost, "item", name, item.source === "free" || data.ownedItems.includes(item.id))}</div>
        </CardContent>
      </Card>
    );
  };

  const themeCard = (theme: Theme) => {
    const name = t(`themeName.${theme.id}`);
    const cost = theme.cost ?? 0;
    return (
      <Card key={theme.id} data-theme={theme.id} className={cn("rounded-md bg-background", premium && "border-gold/30", theme.comingSoon && "opacity-60")}>
        <CardContent className="p-4">
          <div className="mb-4 grid h-20 grid-cols-3 gap-1"><span className="bg-neon" /><span className="bg-electric" /><span className="bg-violet" /></div>
          <h3 className="font-bold text-foreground">{name}</h3>
          <div className="mt-4 flex items-center justify-between gap-2"><CoinTag value={n(cost)} />{buyButton(theme.id, cost, "theme", name, data.ownedThemes.includes(theme.id), theme.comingSoon)}</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("st.eyebrow")} title={t("st.title")} subtitle={t("st.subtitle")} action={<div className="border border-gold/30 bg-gold/10 px-4 py-2"><CoinTag value={n(coins)} /></div>} />

      <div className="mb-8 flex flex-wrap border border-border p-1" role="tablist">
        {tabs.map(({ id, icon: Icon }) => <Button key={id} role="tab" aria-selected={tab === id} variant="ghost" onClick={() => setTab(id)} className={cn("flex-1 gap-2", tab === id && "bg-neon/10 text-neon")}><Icon />{t(`storeCat.${id}`)}</Button>)}
      </div>

      {(tab === "vehicle" || tab === "home") && <div className="border border-gold/30 bg-gold/5 p-8 text-center"><Crown className="mx-auto h-10 w-10 text-gold" /><h2 className="mt-4 text-2xl font-bold">{t(`storeCat.${tab}`)}</h2><p className="mt-2 text-muted-foreground">{t("st.futureCollection")}</p><Badge variant="outline" className="mt-4 text-gold">{t("future.soon")}</Badge></div>}
      <div className="space-y-10">
        {!!items.length && <section><SectionLabel>{t(`storeCat.${tab}`)}</SectionLabel><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(itemCard)}</div></section>}
        {!!themes.length && <section><SectionLabel>{t("st.themes")}</SectionLabel><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{themes.map(themeCard)}</div></section>}
      </div>
    </div>
  );
}
