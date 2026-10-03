import type { ReactNode } from "react";
import type { DashboardData, Rarity } from "@/lib/level-up-service";

export type Update = (fn: (d: DashboardData) => DashboardData) => void;

export const rarityClass: Record<Rarity, string> = {
  common: "text-muted-foreground border-border",
  rare: "text-electric border-electric/40",
  epic: "text-violet border-violet/40",
  legendary: "text-gold border-gold/50",
};

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="mb-8 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase text-neon">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex items-center gap-3"><h2 className="font-mono text-xs uppercase text-muted-foreground">{children}</h2><div className="h-px flex-1 bg-border" /></div>;
}
