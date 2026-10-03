import { useState } from "react";
import { CarFront, Home, PawPrint, ShoppingBag } from "lucide-react";
import petImage__asset from "@/assets/future_pet.jpg.asset.json";
const petImage = petImage__asset.url;
import homeImage__asset from "@/assets/future_home.jpg.asset.json";
const homeImage = homeImage__asset.url;
import vehicleImage__asset from "@/assets/future_vehicle.jpg.asset.json";
const vehicleImage = vehicleImage__asset.url;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const worlds = {
  pet: { image: petImage, icon: PawPrint },
  home: { image: homeImage, icon: Home },
  vehicle: { image: vehicleImage, icon: CarFront },
} as const;

export function WorldBanner({ compact = false, onExplore }: { compact?: boolean; onExplore?: () => void }) {
  const { t } = useI18n();
  const [active, setActive] = useState<keyof typeof worlds>("pet");
  const world = worlds[active];
  return (
    <section className="overflow-hidden border border-electric/30 bg-card/80">
      <div className={cn("grid", compact ? "md:grid-cols-[1fr_1.1fr]" : "min-h-80 lg:grid-cols-[.85fr_1.4fr]")}>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="font-mono text-xs uppercase text-electric">{t("future.eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("future.title")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("future.subtitle")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(Object.keys(worlds) as (keyof typeof worlds)[]).map((id) => {
              const Icon = worlds[id].icon;
              return <Button key={id} size="sm" variant={active === id ? "default" : "outline"} onClick={() => setActive(id)}><Icon />{t(`future.${id}`)}</Button>;
            })}
          </div>
          {onExplore && <Button variant="ghost" onClick={onExplore} className="mt-4 w-fit text-electric"><ShoppingBag />{t("future.explore")}</Button>}
        </div>
        <div className="group relative min-h-64 overflow-hidden">
          <img key={active} src={world.image} alt={t(`future.${active}Name`)} loading="lazy" width={512} height={768} className="absolute inset-0 h-full w-full animate-fade-in object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 bg-background/80 p-5 backdrop-blur-sm">
            <p className="text-xl font-bold">{t(`future.${active}Name`)}</p>
            <Badge className="mt-2 bg-background/80 text-foreground">{active === "pet" ? t("future.available") : t("future.soon")}</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}