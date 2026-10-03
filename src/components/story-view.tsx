import { ArrowRight, Heart, Instagram, Target, Youtube } from "lucide-react";
import worldImage__asset from "@/assets/world_future.jpg.asset.json";
const worldImage = worldImage__asset.url;
import sceneImage__asset from "@/assets/scenes_expansion.jpg.asset.json";
const sceneImage = sceneImage__asset.url;
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function StoryView({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return <div className="animate-fade-in space-y-12">
    <section className="relative min-h-[32rem] overflow-hidden border border-border"><img src={sceneImage} alt="" width={1536} height={768} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-background/65" /><div className="relative flex min-h-[32rem] max-w-3xl flex-col justify-end p-7 sm:p-12"><p className="font-mono text-xs uppercase text-neon">{t("story.eyebrow")}</p><h1 className="mt-3 text-4xl font-bold sm:text-6xl">Level Up Life</h1><p className="mt-5 max-w-2xl text-lg text-foreground/85">{t("story.lead")}</p><Button onClick={onStart} className="mt-7 w-fit neon-shadow">{t("story.start")}<ArrowRight /></Button></div></section>
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center"><div><Target className="h-9 w-9 text-electric" /><h2 className="mt-5 text-3xl font-bold">{t("story.why")}</h2><p className="mt-4 leading-7 text-muted-foreground">{t("story.whyText")}</p></div><img src={worldImage} alt={t("story.vision")} loading="lazy" width={1536} height={768} className="aspect-[2/1] w-full border border-electric/30 object-cover" /></section>
    <section className="border-y border-border py-10 text-center"><Heart className="mx-auto h-9 w-9 text-neon" /><h2 className="mt-4 text-3xl font-bold">{t("story.vision")}</h2><p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("story.visionText")}</p><div className="mt-7 flex justify-center gap-3"><Button size="icon" variant="outline" aria-label="Instagram" disabled><Instagram /></Button><Button size="icon" variant="outline" aria-label="YouTube" disabled><Youtube /></Button><Button size="icon" variant="outline" aria-label="TikTok" disabled>TT</Button><Button size="icon" variant="outline" aria-label="X" disabled>𝕏</Button></div><p className="mt-3 text-xs text-muted-foreground">{t("story.socialSoon")}</p></section>
  </div>;
}