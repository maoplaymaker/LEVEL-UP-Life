import { useEffect, useState } from "react";
import { CreditCard, LogOut, Mail, Medal, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AvatarFigure } from "@/components/avatar";
import { PageTitle } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { getLevelRank, type DashboardData } from "@/lib/level-up-service";

export function ProfileView({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  const [name, setName] = useState(data.player.name);
  const [handle, setHandle] = useState(data.player.handle);
  const [email, setEmail] = useState("");
  const rank = getLevelRank(data.player.level);
  useEffect(() => { void supabase.auth.getUser().then(({ data: auth }) => setEmail(auth.user?.email ?? t("profile.demo"))); }, [t]);
  const save = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { toast.info(t("profile.signinFirst")); return; }
    const { error } = await supabase.from("profiles").upsert({ user_id: auth.user.id, display_name: name, handle, updated_at: new Date().toISOString() });
    error ? toast.error(error.message) : toast.success(t("profile.saved"));
  };
  const logout = async () => { await supabase.auth.signOut(); toast.success(t("profile.signedOut")); };
  return <div className="animate-fade-in"><PageTitle eyebrow={t("profile.eyebrow")} title={t("profile.title")} subtitle={t("profile.subtitle")} />
    <section className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[16rem_1fr]">
      <AvatarFigure avatar={data.avatar} className="aspect-square w-full border border-electric/30" />
      <div className="flex flex-col justify-center"><div className="flex flex-wrap items-center gap-3"><h2 className="text-3xl font-bold">{data.player.name}</h2><Badge className="bg-violet/15 text-violet">{t(`rank.${rank?.key ?? "novice"}`)} · LV {data.player.level}</Badge></div><p className="mt-2 text-muted-foreground">{data.player.handle}</p><Progress value={(data.player.currentXp / data.player.nextLevelXp) * 100} className="mt-5 max-w-lg [&>div]:bg-violet" /><p className="mt-2 font-mono text-xs text-muted-foreground">{data.player.currentXp} / {data.player.nextLevelXp} XP · {data.player.totalPoints} LC</p></div>
    </section>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><UserRound className="text-neon" />{t("profile.personal")}</h2><div className="space-y-4 border border-border bg-card/70 p-5"><ProfileField label={t("auth.name")} value={name} onChange={setName} /><ProfileField label={t("auth.handle")} value={handle} onChange={setHandle} /><div><Label>{t("auth.email")}</Label><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{email}</p></div><div className="flex gap-2"><Button onClick={() => void save()}><Save />{t("profile.save")}</Button><Button variant="ghost" onClick={() => void logout()}><LogOut />{t("profile.logout")}</Button></div></div></section>
      <section><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><CreditCard className="text-electric" />{t("profile.payments")}</h2><div className="border border-border bg-card/70 p-5"><div className="flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-neon" /><div><p className="font-semibold">{t("profile.secure")}</p><p className="text-sm text-muted-foreground">{t("profile.secureSub")}</p></div></div><Badge variant="outline" className="mt-5 text-gold">{t("profile.testMode")}</Badge></div></section>
    </div>
    <section className="mt-8"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Medal className="text-gold" />{t("profile.badges")}</h2><div className="grid gap-3 sm:grid-cols-3">{data.achievements.map((badge) => <div key={badge.id} className={`border p-4 ${badge.unlocked ? "border-gold/40 bg-gold/5" : "border-border opacity-55"}`}><p className="font-semibold">{t(`badge.${badge.id}`)}</p><p className="mt-1 text-xs text-muted-foreground">{badge.unlocked ? t("ach.earned") : `${badge.progress ?? 0}%`}</p></div>)}</div></section>
    <section className="mt-8"><h2 className="mb-4 text-xl font-bold">{t("profile.inventory")}</h2><div className="flex flex-wrap gap-2">{data.ownedItems.map((id) => <Badge key={id} variant="outline">{t(`item.${id}`)}</Badge>)}</div></section>
  </div>;
}
function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <div className="space-y-2"><Label>{label}</Label><Input value={value} onChange={(event) => onChange(event.target.value)} /></div>; }