import { useState, type FormEvent } from "react";
import { BatteryCharging, Check, CircleAlert, BookOpen, Coffee, Film, Flower2, IceCreamCone, Moon, Music, Plane, ShoppingBag, UtensilsCrossed, Gamepad2, Gift, Link2, LoaderCircle, Lock, PlugZap, RefreshCw, Send, Share2, ShieldCheck, Trophy, Unplug, X } from "lucide-react";
import { toast } from "sonner";

import { AvatarFigure } from "@/components/avatar";
import { categoryClass, categoryIcon } from "@/components/life-stats";
import { PageTitle, SectionLabel, rarityClass, type Update } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { AVATAR_ITEMS, levelUpService, type Coupon, type DashboardData, type Mission, type Reward } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";

export function useMissionTitle() {
  const { t } = useI18n();
  return (m: Pick<Mission, "id" | "title" | "i18n" | "titleKey">) => (m.titleKey ? t(m.titleKey) : m.i18n ? t(`m.${m.id}`) : m.title);
}

/* ---------------- Rewards ---------------- */
export function RewardsView({ data, update }: { data: DashboardData; update: Update }) {
  const { t, n } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const icons = { coffee: Coffee, game: Gamepad2, movie: Film, rest: BatteryCharging, icecream: IceCreamCone, dinner: UtensilsCrossed, spa: Flower2, shopping: ShoppingBag, trip: Plane, book: BookOpen, music: Music, sleep: Moon };

  const [shareTarget, setShareTarget] = useState<Coupon | null>(null);
  const [recipient, setRecipient] = useState("");
  const [formError, setFormError] = useState("");

  const redeem = async (reward: Reward) => {
    if (data.player.totalPoints < reward.cost || busy) return;
    setBusy(reward.id);
    try {
      const coupon = await levelUpService.redeemReward(reward.id);
      update((d) => ({ ...d, player: { ...d.player, totalPoints: d.player.totalPoints - reward.cost }, coupons: [coupon, ...d.coupons] }));
      toast.success(t("toast.redeemed", { title: t(`reward.${reward.id}`) }), { description: t("toast.enjoy") });
    } catch { toast.error(t("toast.fail")); } finally { setBusy(null); }
  };

  const openShare = (c: Coupon) => { setShareTarget(c); setRecipient(""); setFormError(""); };

  const sendShare = async (e: FormEvent) => {
    e.preventDefault();
    if (!shareTarget) return;
    const who = recipient.trim();
    if (!RECIPIENT.test(who) || who.length > 120) { setFormError(t("sh.errRecipient")); return; }
    setBusy(shareTarget.id);
    try {
      await levelUpService.shareCoupon(shareTarget.id, who);
      update((d) => ({ ...d, coupons: d.coupons.map((c) => (c.id === shareTarget.id ? { ...c, sharedWith: who } : c)) }));
      toast.success(t("rew.shareSent", { who }));
      setShareTarget(null);
    } catch { toast.error(t("toast.fail")); } finally { setBusy(null); }
  };

  const claim = async (itemId: string) => {
    setBusy(itemId);
    try {
      await levelUpService.claimReward(itemId);
      update((d) => ({ ...d, ownedItems: [...d.ownedItems, itemId] }));
      toast.success(t("rew.claimedToast", { item: t(`item.${itemId}`) }));
    } catch { toast.error(t("toast.fail")); } finally { setBusy(null); }
  };

  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("rew.eyebrow")} title={t("rew.title")} subtitle={t("rew.subtitle")} action={<div className="border border-neon/30 bg-neon/10 px-4 py-2 font-mono text-sm text-neon">{n(data.player.totalPoints)} pts</div>} />
      <SectionLabel>{t("rew.real")}</SectionLabel>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.rewards.map((reward) => {
          const Icon = icons[reward.icon];
          const affordable = data.player.totalPoints >= reward.cost;
          return (
            <Card key={reward.id} className="group rounded-md bg-card/90 transition-all hover:-translate-y-1 hover:border-violet/50">
              <CardContent className="flex min-h-56 flex-col p-5">
                <div className="mb-6 grid h-12 w-12 place-items-center border border-violet/35 bg-violet/10 text-violet"><Icon /></div>
                <h3 className="text-lg font-bold">{t(`reward.${reward.id}`)}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{t(`reward.${reward.id}.d`)}</p>
                <div className="mt-6 flex items-center justify-between"><span className="font-mono text-sm text-neon">{n(reward.cost)} pts</span><Button size="sm" variant={affordable ? "default" : "secondary"} disabled={!affordable || busy !== null} onClick={() => void redeem(reward)}>{busy === reward.id ? <LoaderCircle className="animate-spin" /> : <Gift />}{t("rew.redeem")}</Button></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <SectionLabel>{t("rew.coupons")}</SectionLabel>
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">{t("rew.couponsSub")}</p>
      {data.coupons.length === 0 ? <p className="mb-10 text-sm text-muted-foreground">{t("rew.noCoupons")}</p> : (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.coupons.map((coupon) => {
            const reward = data.rewards.find((r) => r.id === coupon.rewardId);
            const Icon = reward ? icons[reward.icon] : Gift;
            return (
              <Card key={coupon.id} className="rounded-md border-neon/25 bg-card/90">
                <CardContent className="flex flex-col p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center border border-neon/35 bg-neon/10 text-neon"><Icon className="h-5 w-5" /></div>
                    <h3 className="min-w-0 truncate font-bold">{t(`reward.${coupon.rewardId}`)}</h3>
                  </div>
                  {coupon.sharedWith ? (
                    <Badge variant="outline" className="border-electric/40 text-electric"><Share2 className="mr-1 h-3 w-3" />{t("rew.sharedWith", { who: coupon.sharedWith })}</Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="border-electric/40 text-electric" disabled={busy !== null} onClick={() => openShare(coupon)}><Share2 />{t("rew.share")}</Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <SectionLabel>{t("rew.loot")}</SectionLabel>
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">{t("rew.lootSub")}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {AVATAR_ITEMS.filter((i) => i.source === "reward").map((item) => {
          const badge = data.achievements.find((a) => a.id === item.unlockBy);
          const unlocked = !!badge?.unlocked;
          const owned = data.ownedItems.includes(item.id);
          return (
            <Card key={item.id} className={cn("rounded-md bg-card/90", !unlocked && "opacity-60")}>
              <CardContent className="p-4">
                <AvatarFigure avatar={{ ...data.avatar, equipped: { ...data.avatar.equipped, [item.slot]: item.id } }} className={cn("mb-4 aspect-square w-full border border-border", !unlocked && "grayscale")} />
                <div className="flex items-start justify-between gap-2"><h3 className="font-bold">{t(`item.${item.id}`)}</h3><Badge variant="outline" className={cn("text-[10px]", rarityClass[item.rarity])}>{t(`rarity.${item.rarity}`)}</Badge></div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Trophy className="h-3 w-3" />{t("rew.requires", { badge: t(`badge.${item.unlockBy}`) })}</p>
                <div className="mt-4">
                  {owned ? <Badge className="bg-neon/15 text-neon"><Check className="mr-1 h-3 w-3" />{t("rew.claimed")}</Badge>
                    : <Button size="sm" className="w-full" disabled={!unlocked || busy !== null} onClick={() => void claim(item.id)}>{busy === item.id ? <LoaderCircle className="animate-spin" /> : unlocked ? <Gift /> : <Lock />}{t("rew.claim")}</Button>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!shareTarget} onOpenChange={(o) => !o && setShareTarget(null)}>
        <DialogContent className="rounded-md border-electric/30 bg-popover electric-shadow">
          <form onSubmit={sendShare}>
            <DialogHeader><DialogTitle>{t("rew.shareTitle")}</DialogTitle><DialogDescription>{shareTarget && `“${t(`reward.${shareTarget.rewardId}`)}” — `}{t("rew.shareDesc")}</DialogDescription></DialogHeader>
            <div className="space-y-2 py-6">
              <Label htmlFor="coupon-recipient">{t("sh.recipient")}</Label>
              <Input id="coupon-recipient" value={recipient} maxLength={120} onChange={(e) => setRecipient(e.target.value)} placeholder={t("sh.placeholder")} className="h-11" />
              {formError && <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><CircleAlert className="h-4 w-4" />{formError}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy === shareTarget?.id} className="neon-shadow">{busy === shareTarget?.id ? <LoaderCircle className="animate-spin" /> : <Send />}{t("sh.send")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Share ---------------- */
const RECIPIENT = /^(@[a-z0-9._]{3,30}|[^\s@]+@[^\s@]+\.[^\s@]{2,})$/i;

export function ShareView({ data, update }: { data: DashboardData; update: Update }) {
  const { t } = useI18n();
  const title = useMissionTitle();
  const [target, setTarget] = useState<Mission | null>(null);
  const [recipient, setRecipient] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const open = (m: Mission) => { setTarget(m); setRecipient(""); setFormError(""); };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const who = recipient.trim();
    if (!RECIPIENT.test(who) || who.length > 120) { setFormError(t("sh.errRecipient")); return; }
    setBusy("send");
    try {
      const shared = await levelUpService.shareMission(target.id, title(target), who);
      update((d) => ({ ...d, shared: [shared, ...d.shared] }));
      toast.success(t("sh.sent", { who }));
      setTarget(null);
    } catch { toast.error(t("toast.fail")); } finally { setBusy(null); }
  };

  const copyLink = async () => {
    if (!target) return;
    await navigator.clipboard?.writeText(`${window.location.origin}/?invite=${target.id}`).catch(() => undefined);
    toast.success(t("sh.copied"));
  };

  const respond = async (id: string, accept: boolean) => {
    setBusy(id);
    try {
      await levelUpService.respondInvite(id, accept);
      update((d) => {
        const inv = d.invites.find((i) => i.id === id);
        const missions = accept && inv ? [{ ...inv.mission, id: `shared_${id}`, completed: false }, ...d.missions] : d.missions;
        return { ...d, missions, invites: d.invites.filter((i) => i.id !== id) };
      });
      toast.success(accept ? t("sh.accepted") : t("sh.declined"));
    } finally { setBusy(null); }
  };

  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("sh.eyebrow")} title={t("sh.title")} subtitle={t("sh.subtitle")} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <SectionLabel>{t("sh.yours")}</SectionLabel>
          <div className="space-y-2">
            {data.missions.filter((m) => !m.completed).map((m) => {
              const Icon = categoryIcon[m.category];
              return (
                <div key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border border-border bg-card/80 p-3">
                  <div className="min-w-0"><p className="truncate font-semibold">{title(m)}</p><Badge variant="outline" className={cn("mt-1", categoryClass[m.category])}><Icon className="mr-1 h-3 w-3" />{t(`cat.${m.category}`)}</Badge></div>
                  <Button size="sm" variant="outline" onClick={() => open(m)} className="border-electric/40 text-electric"><Share2 />{t("sh.share")}</Button>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="space-y-8">
          <section>
            <SectionLabel>{t("sh.incoming")}</SectionLabel>
            {data.invites.length === 0 ? <p className="text-sm text-muted-foreground">{t("sh.noInvites")}</p> : (
              <div className="space-y-2">
                {data.invites.map((inv) => (
                  <div key={inv.id} className="border border-violet/30 bg-violet/5 p-3">
                    <p className="font-mono text-[10px] uppercase text-violet">{t("sh.from", { who: inv.from })}</p>
                    <p className="mt-1 font-semibold">{inv.mission.title}</p>
                    <p className="text-xs text-muted-foreground">{t(`cat.${inv.mission.category}`)} · +{inv.mission.xp} XP</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" disabled={busy !== null} onClick={() => void respond(inv.id, true)}>{busy === inv.id ? <LoaderCircle className="animate-spin" /> : <Check />}{t("sh.accept")}</Button>
                      <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => void respond(inv.id, false)}><X />{t("sh.decline")}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section>
            <SectionLabel>{t("sh.outgoing")}</SectionLabel>
            {data.shared.length === 0 ? <p className="text-sm text-muted-foreground">{t("sh.empty")}</p> : (
              <div className="space-y-2">{data.shared.map((s) => <div key={s.id} className="flex items-center justify-between gap-3 border border-border p-3 text-sm"><div className="min-w-0"><p className="truncate font-semibold">{s.missionTitle}</p><p className="truncate text-xs text-muted-foreground">{s.recipient}</p></div><Badge variant="outline" className="shrink-0">{t("sh.pending")}</Badge></div>)}</div>
            )}
          </section>
        </aside>
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="rounded-md border-electric/30 bg-popover electric-shadow">
          <form onSubmit={send}>
            <DialogHeader><DialogTitle>{t("sh.dialogTitle")}</DialogTitle><DialogDescription>{target && `“${title(target)}” — `}{t("sh.dialogDesc")}</DialogDescription></DialogHeader>
            <div className="space-y-2 py-6">
              <Label htmlFor="recipient">{t("sh.recipient")}</Label>
              <Input id="recipient" value={recipient} maxLength={120} onChange={(e) => setRecipient(e.target.value)} placeholder={t("sh.placeholder")} className="h-11" />
              {formError && <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><CircleAlert className="h-4 w-4" />{formError}</p>}
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => void copyLink()}><Link2 />{t("sh.copy")}</Button>
              <Button type="submit" disabled={busy === "send"} className="neon-shadow">{busy === "send" ? <LoaderCircle className="animate-spin" /> : <Send />}{t("sh.send")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Sync ---------------- */
export function SyncView({ data, update }: { data: DashboardData; update: Update }) {
  const { t, date } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const unlockedCount = data.achievements.filter((a) => a.unlocked).length;

  const run = async (id: string, name: string, action: "connect" | "disconnect" | "sync") => {
    setBusy(id);
    try {
      if (action === "connect") {
        const r = await levelUpService.connectIntegration(id);
        update((d) => ({ ...d, integrations: d.integrations.map((i) => (i.id === id ? { ...i, connected: true, lastSync: r.lastSync } : i)) }));
        toast.success(t("sy.connectedToast", { app: name }));
      } else if (action === "disconnect") {
        await levelUpService.disconnectIntegration(id);
        update((d) => ({ ...d, integrations: d.integrations.map((i) => (i.id === id ? { ...i, connected: false, lastSync: null } : i)) }));
        toast(t("sy.disconnectedToast", { app: name }));
      } else {
        const r = await levelUpService.syncAchievements(id, unlockedCount);
        update((d) => ({ ...d, integrations: d.integrations.map((i) => (i.id === id ? { ...i, lastSync: r.at } : i)) }));
        toast.success(t("sy.synced", { n: r.synced, app: name }));
      }
    } catch { toast.error(t("toast.fail")); } finally { setBusy(null); }
  };

  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("sy.eyebrow")} title={t("sy.title")} subtitle={t("sy.subtitle")} />
      <div className="mb-6 flex items-start gap-3 border border-electric/30 bg-electric/5 p-4 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-electric" />{t("sy.note")}</div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.integrations.map((app) => (
          <Card key={app.id} className={cn("rounded-md bg-card/90", app.connected && "border-neon/40")}>
            <CardContent className="flex min-h-48 flex-col p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3"><div className={cn("grid h-10 w-10 shrink-0 place-items-center border font-bold", app.connected ? "border-neon/40 bg-neon/10 text-neon" : "border-border bg-muted text-muted-foreground")}>{app.name[0]}</div><h3 className="truncate font-bold">{app.name}</h3></div>
                {app.connected && <Badge className="shrink-0 bg-neon/15 text-neon">{t("sy.connected")}</Badge>}
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{t(`integ.${app.id}`)}</p>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground">{app.lastSync ? t("sy.last", { time: date(app.lastSync) }) : t("sy.never")}</p>
              <div className="mt-4 flex gap-2">
                {app.connected ? (
                  <>
                    <Button size="sm" disabled={busy !== null} onClick={() => void run(app.id, app.name, "sync")}>{busy === app.id ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}{t("sy.syncNow")}</Button>
                    <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => void run(app.id, app.name, "disconnect")}><Unplug />{t("sy.disconnect")}</Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void run(app.id, app.name, "connect")} className="border-electric/40 text-electric">{busy === app.id ? <LoaderCircle className="animate-spin" /> : <PlugZap />}{t("sy.connect")}</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
