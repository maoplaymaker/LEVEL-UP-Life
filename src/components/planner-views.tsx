import { useEffect, useMemo, useState } from "react";
import { BellRing, CalendarClock, Check, ChevronLeft, ChevronRight, Flame, Gift, LoaderCircle, Plus, RefreshCw, Share2, Swords, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { PageTitle, SectionLabel, type Update } from "@/components/shared";
import { useMissionTitle } from "@/components/social-views";
import { categoryClass } from "@/components/life-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, levelUpService, type Category, type Challenge, type DashboardData, type Friend, type Mission } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";

const TXT = {
  es: {
    agEyebrow: "Planificación", agTitle: "Agenda", agSub: "Programa tus días, pon fechas límite y divide tus tareas en pasos de check.",
    sync: "Sincronizar agenda", synced: "Agenda enviada al servidor para sincronizar con tus apps y amigos",
    add: "Nueva tarea", dayTasks: "Tareas del día", none: "Nada programado este día.", overdue: "Vencida", due: "Fecha límite",
    taskTitle: "Título", category: "Área", steps: "Pasos de check", addStep: "Añadir paso", save: "Guardar", cancel: "Cancelar",
    created: "Tarea programada", done: "Hecha", complete: "Completar", upcoming: "Próximas fechas límite",
    frEyebrow: "Comunidad", frTitle: "Amigos", frSub: "Comparte tareas y estadísticas, y reta a tus amigos para subir de nivel juntos.",
    invite: "Invitar amigo", invitePh: "@usuario o correo", inviteSent: "Invitación enviada", level: "Nivel", streak: "racha",
    balance: "Equilibrio", challenge: "Desafiar", shareStats: "Compartir estadísticas", statsShared: "Estadísticas compartidas con",
    chTitle: "Desafiar a", chDesc: "Elige una tarea y apuesta LifeCoins o uno de tus cupones. El servidor reserva la apuesta y decide quién gana.",
    mission: "Tarea", stake: "Apuesta", badStake: "La apuesta debe ser mayor que 0 y no superar tus LifeCoins.", coins: "LifeCoins", coupon: "Cupón", chooseCoupon: "Elige un cupón", noCoupons: "No tienes cupones disponibles", send: "Enviar desafío", chSent: "Desafío enviado", challenges: "Desafíos", completedNotice: "Completó", ago: "hace poco",
    noCh: "Aún no hay desafíos.", st: { pending: "Pendiente", active: "En curso", won: "Ganado", lost: "Perdido" },
    days: ["L", "M", "X", "J", "V", "S", "D"],
  },
  en: {
    agEyebrow: "Planning", agTitle: "Calendar", agSub: "Schedule your days, set deadlines and split tasks into check steps.",
    sync: "Sync calendar", synced: "Calendar sent to the server to sync with your apps and friends",
    add: "New task", dayTasks: "Tasks for the day", none: "Nothing scheduled this day.", overdue: "Overdue", due: "Deadline",
    taskTitle: "Title", category: "Area", steps: "Check steps", addStep: "Add step", save: "Save", cancel: "Cancel",
    created: "Task scheduled", done: "Done", complete: "Complete", upcoming: "Upcoming deadlines",
    frEyebrow: "Community", frTitle: "Friends", frSub: "Share tasks and stats, and challenge your friends to level up together.",
    invite: "Invite friend", invitePh: "@username or email", inviteSent: "Invite sent", level: "Level", streak: "streak",
    balance: "Balance", challenge: "Challenge", shareStats: "Share stats", statsShared: "Stats shared with",
    chTitle: "Challenge", chDesc: "Pick a task and stake LifeCoins or one of your coupons. The server holds the stake and decides the winner.",
    mission: "Task", stake: "Stake", badStake: "Stake must be above 0 and within your LifeCoins.", coins: "LifeCoins", coupon: "Coupon", chooseCoupon: "Choose a coupon", noCoupons: "You have no available coupons", send: "Send challenge", chSent: "Challenge sent", challenges: "Challenges", completedNotice: "Completed", ago: "recently",
    noCh: "No challenges yet.", st: { pending: "Pending", active: "Active", won: "Won", lost: "Lost" },
    days: ["M", "T", "W", "T", "F", "S", "S"],
  },
  pt: {
    agEyebrow: "Planejamento", agTitle: "Agenda", agSub: "Programe seus dias, defina prazos e divida suas tarefas em etapas de check.",
    sync: "Sincronizar calendário", synced: "Calendário enviado ao servidor para sincronizar com seus apps e amigos",
    add: "Nova tarefa", dayTasks: "Tarefas do dia", none: "Nada programado para este dia.", overdue: "Atrasada", due: "Prazo",
    taskTitle: "Título", category: "Área", steps: "Etapas de check", addStep: "Adicionar etapa", save: "Salvar", cancel: "Cancelar",
    created: "Tarefa programada", done: "Feita", complete: "Concluir", upcoming: "Próximos prazos",
    frEyebrow: "Comunidade", frTitle: "Amigos", frSub: "Compartilhe tarefas e estatísticas e desafie seus amigos a subir de nível juntos.",
    invite: "Convidar amigo", invitePh: "@usuário ou e-mail", inviteSent: "Convite enviado", level: "Nível", streak: "sequência",
    balance: "Equilíbrio", challenge: "Desafiar", shareStats: "Compartilhar", statsShared: "Estatísticas compartilhadas com",
    chTitle: "Desafio", chDesc: "Escolha uma tarefa e aposte LifeCoins ou um dos seus cupons. O servidor guarda a aposta e decide o vencedor.",
    mission: "Tarefa", stake: "Aposta", badStake: "A aposta deve ser maior que 0 e não ultrapassar seus LifeCoins.", coins: "LifeCoins", coupon: "Cupom", chooseCoupon: "Escolha um cupom", noCoupons: "Você não tem cupons disponíveis", send: "Enviar desafio", chSent: "Desafio enviado", challenges: "Desafios", completedNotice: "Concluída", ago: "recentemente",
    noCh: "Ainda não há desafios.", st: { pending: "Pendente", active: "Ativo", won: "Ganho", lost: "Perdido" },
    days: ["S", "T", "Q", "Q", "S", "S", "D"],
  },
};
function useTxt() { const { locale } = useI18n(); return TXT[locale] ?? TXT.es; }

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function AgendaView({ data, update, busyId, onComplete }: { data: DashboardData; update: Update; busyId: string | null; onComplete: (m: Mission) => void }) {
  const tx = useTxt();
  const { locale, t } = useI18n();
  const title = useMissionTitle();
  const today = iso(new Date());
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(today);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const cells = useMemo(() => {
    const offset = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);
  const byDay = useMemo(() => {
    const map: Record<string, Mission[]> = {};
    data.missions.forEach((m) => { if (m.dueDate) (map[m.dueDate] ??= []).push(m); });
    return map;
  }, [data.missions]);
  const dayTasks = byDay[selected] ?? [];
  const upcoming = data.missions.filter((m) => m.dueDate && !m.completed).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)).slice(0, 5);

  const toggleStep = (missionId: string, stepId: string) =>
    update((d) => ({ ...d, missions: d.missions.map((m) => m.id === missionId ? { ...m, checklist: (m.checklist ?? []).map((s) => s.id === stepId ? { ...s, done: !s.done } : s) } : m) }));

  const sync = async () => {
    setSyncing(true);
    try { await levelUpService.syncCalendar(); toast.success(tx.synced); } finally { setSyncing(false); }
  };

  return (
    <div>
      <PageTitle eyebrow={tx.agEyebrow} title={tx.agTitle} subtitle={tx.agSub} action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void sync()} disabled={syncing}>{syncing ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}{tx.sync}</Button>
          <Button onClick={() => setOpen(true)}><Plus />{tx.add}</Button>
        </div>
      } />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="border-border bg-card/80">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Button size="icon" variant="ghost" aria-label="prev" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
              <p className="font-mono text-sm uppercase">{month.toLocaleDateString(locale, { month: "long", year: "numeric" })}</p>
              <Button size="icon" variant="ghost" aria-label="next" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {tx.days.map((d, i) => <span key={i} className="pb-2 font-mono text-[10px] text-muted-foreground">{d}</span>)}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const key = iso(d);
                const items = byDay[key] ?? [];
                const late = items.some((m) => !m.completed) && key < today;
                return (
                  <button key={i} onClick={() => setSelected(key)} className={cn("flex aspect-square flex-col items-center justify-center gap-1 border text-sm transition-colors",
                    key === selected ? "border-neon bg-neon/10 text-neon" : "border-border/50 hover:border-neon/40",
                    key === today && key !== selected && "text-neon")}>
                    {d.getDate()}
                    {items.length > 0 && <span className="flex gap-0.5">{items.slice(0, 3).map((m) => <span key={m.id} className={cn("h-1.5 w-1.5 rounded-full", m.completed ? "bg-muted-foreground" : late ? "bg-destructive" : "bg-neon")} />)}</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <SectionLabel>{tx.dayTasks} · {new Date(selected + "T00:00").toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" })}</SectionLabel>
            {dayTasks.length === 0 && <p className="text-sm text-muted-foreground">{tx.none}</p>}
            <div className="space-y-3">
              {dayTasks.map((m) => {
                const steps = m.checklist ?? [];
                const allDone = steps.every((s) => s.done);
                return (
                  <Card key={m.id} className="border-border bg-card/80">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={cn("font-semibold", m.completed && "text-muted-foreground line-through")}>{title(m)}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge variant="outline" className={categoryClass[m.category]}>{t(`cat.${m.category}`)}</Badge>
                            <Badge variant="outline">+{m.xp} XP</Badge>
                            {!m.completed && m.dueDate! < today && <Badge variant="destructive">{tx.overdue}</Badge>}
                          </div>
                        </div>
                        <Button size="sm" disabled={m.completed || !allDone || busyId === m.id} onClick={() => onComplete(m)}>
                          {busyId === m.id ? <LoaderCircle className="animate-spin" /> : <Check />}{m.completed ? tx.done : tx.complete}
                        </Button>
                      </div>
                      {steps.map((s) => (
                        <label key={s.id} className="flex items-center gap-3 text-sm">
                          <Checkbox checked={s.done} disabled={m.completed} onCheckedChange={() => toggleStep(m.id, s.id)} />
                          <span className={cn(s.done && "text-muted-foreground line-through")}>{s.text}</span>
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          <div>
            <SectionLabel>{tx.upcoming}</SectionLabel>
            <div className="space-y-2">
              {upcoming.map((m) => (
                <button key={m.id} onClick={() => setSelected(m.dueDate!)} className="flex w-full items-center justify-between gap-3 border border-border/60 px-3 py-2 text-left text-sm hover:border-neon/40">
                  <span className="truncate">{title(m)}</span>
                  <span className={cn("flex shrink-0 items-center gap-1 font-mono text-xs", m.dueDate! < today ? "text-destructive" : "text-muted-foreground")}><CalendarClock className="h-3.5 w-3.5" />{m.dueDate}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AgendaTaskDialog open={open} onOpenChange={setOpen} date={selected} onSave={async (m) => {
        const saved = await levelUpService.saveTask(m);
        update((d) => ({ ...d, missions: [saved, ...d.missions] }));
        setSelected(saved.dueDate!);
        toast.success(tx.created);
      }} />
    </div>
  );
}

function AgendaTaskDialog({ open, onOpenChange, date, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; date: string; onSave: (m: Mission) => Promise<void> }) {
  const tx = useTxt();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [due, setDue] = useState(date);
  const [category, setCategory] = useState<Category>("Trabajo");
  const [steps, setSteps] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setName(""); setDue(date); setSteps([""]); } }, [open, date]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: `task_${Date.now()}`, title: name.trim(), category, difficulty: "Media", xp: 80, type: "main", completed: false, dueDate: due,
        checklist: steps.filter((s) => s.trim()).map((text, i) => ({ id: `s${i}_${Date.now()}`, text: text.trim(), done: false })),
      });
      onOpenChange(false);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card">
        <DialogHeader><DialogTitle>{tx.add}</DialogTitle><DialogDescription>{tx.agSub}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{tx.taskTitle}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>{tx.due}</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
            <div className="space-y-2"><Label>{tx.category}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`cat.${c}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{tx.steps}</Label>
            {steps.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input value={s} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? e.target.value : x)))} />
                <Button size="icon" variant="ghost" aria-label="remove" onClick={() => setSteps(steps.filter((_, j) => j !== i))}><Trash2 /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setSteps([...steps, ""])}><Plus />{tx.addStep}</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}><X />{tx.cancel}</Button>
          <Button onClick={() => void submit()} disabled={saving || !name.trim()}>{saving ? <LoaderCircle className="animate-spin" /> : <Check />}{tx.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FriendsView({ data, update }: { data: DashboardData; update: Update }) {
  const tx = useTxt();
  const { t } = useI18n();
  const title = useMissionTitle();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [handle, setHandle] = useState("");
  const [target, setTarget] = useState<Friend | null>(null);
  const [missionId, setMissionId] = useState("");
  const [stake, setStake] = useState(100);
  const [stakeType, setStakeType] = useState<"lifecoins" | "coupon">("lifecoins");
  const [couponId, setCouponId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { void levelUpService.getFriends().then((r) => { setFriends(r.friends); setChallenges(r.challenges); }); }, []);
  const open = data.missions.filter((m) => !m.completed);

  const invite = async () => {
    if (!handle.trim()) return;
    setBusy("invite");
    try { await levelUpService.inviteFriend(handle.trim()); toast.success(tx.inviteSent, { description: handle }); setHandle(""); } finally { setBusy(null); }
  };
  const shareStats = async (f: Friend) => {
    setBusy(`s_${f.id}`);
    try { await levelUpService.shareStats(f.id); toast.success(`${tx.statsShared} ${f.name}`); } finally { setBusy(null); }
  };
  const sendChallenge = async () => {
    const m = open.find((x) => x.id === missionId);
    if (!target || !m) return;
    setBusy("challenge");
    try {
      let wager: { type: "lifecoins"; amount: number } | { type: "coupon"; couponId: string; rewardId: string };
      if (stakeType === "lifecoins") {
        if (!Number.isInteger(stake) || stake <= 0 || stake > data.player.totalPoints) { toast.error(tx.badStake); return; }
        wager = { type: "lifecoins", amount: stake };
      }
      else {
        const coupon = data.coupons.find((item) => item.id === couponId);
        if (!coupon) return;
        wager = { type: "coupon", couponId: coupon.id, rewardId: coupon.rewardId };
      }
      const c = await levelUpService.createChallenge(target.id, title(m), wager);
      setChallenges((cs) => [c, ...cs]);
      // The stake is held while the challenge is open: coins leave the balance and a wagered coupon can't be reused.
      update((d) => wager.type === "lifecoins"
        ? { ...d, player: { ...d.player, totalPoints: d.player.totalPoints - wager.amount } }
        : { ...d, coupons: d.coupons.filter((item) => item.id !== wager.couponId) });
      toast.success(tx.chSent, { description: target.name });
      setTarget(null);
    } finally { setBusy(null); }
  };

  return (
    <div>
      <PageTitle eyebrow={tx.frEyebrow} title={tx.frTitle} subtitle={tx.frSub} />
      <div className="mb-6 flex gap-2">
        <Input placeholder={tx.invitePh} value={handle} onChange={(e) => setHandle(e.target.value)} className="max-w-sm" />
        <Button onClick={() => void invite()} disabled={busy === "invite" || !handle.trim()}>{busy === "invite" ? <LoaderCircle className="animate-spin" /> : <UserPlus />}{tx.invite}</Button>
      </div>
      {!friends ? <div className="flex justify-center py-12"><LoaderCircle className="animate-spin text-neon" /></div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {friends.map((f) => (
            <Card key={f.id} className="border-border bg-card/80">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center border border-neon/40 bg-neon/10 font-bold text-neon">{f.name[0]}</div>
                  <div className="min-w-0"><p className="font-semibold">{f.name}</p><p className="font-mono text-xs text-muted-foreground">{f.handle}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="border border-border/60 p-2"><p className="text-lg font-bold">{f.level}</p>{tx.level}</div>
                  <div className="border border-border/60 p-2"><p className="flex items-center justify-center gap-1 text-lg font-bold"><Flame className="h-4 w-4 text-gold" />{f.streak}</p>{tx.streak}</div>
                  <div className="border border-border/60 p-2"><p className="text-lg font-bold">{f.balance}</p>{tx.balance}</div>
                </div>
                <Badge variant="outline" className={categoryClass[f.topCategory]}>{t(`cat.${f.topCategory}`)}</Badge>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => void shareStats(f)} disabled={busy === `s_${f.id}`}>{busy === `s_${f.id}` ? <LoaderCircle className="animate-spin" /> : <Share2 />}{tx.shareStats}</Button>
                  <Button size="sm" onClick={() => { setTarget(f); setMissionId(open[0]?.id ?? ""); setStake(100); setStakeType("lifecoins"); setCouponId(data.coupons[0]?.id ?? ""); }}><Swords />{tx.challenge}</Button>
                </div>
                {f.latestActivity && <div className="border-l-2 border-neon bg-neon/5 px-3 py-2 text-xs"><p className="flex items-center gap-2 font-semibold text-neon"><BellRing className="h-3.5 w-3.5" />{tx.completedNotice} · +{f.latestActivity.xp} XP</p><p className="mt-1 truncate text-muted-foreground">{f.latestActivity.taskTitle} · {tx.ago}</p></div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8">
        <SectionLabel>{tx.challenges}</SectionLabel>
        {challenges.length === 0 && <p className="text-sm text-muted-foreground">{tx.noCh}</p>}
        <div className="space-y-2">
          {challenges.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border border-border/60 px-4 py-3 text-sm">
              <div className="min-w-0"><p className="truncate font-medium">{c.missionTitle}</p><p className="text-xs text-muted-foreground">vs {friends?.find((f) => f.id === c.friendId)?.name} · {c.stakeType === "lifecoins" ? `${c.stake ?? 0} LifeCoins` : c.couponRewardId ? t(`reward.${c.couponRewardId}`) : tx.coupon}</p></div>
              <Badge variant="outline">{tx.st[c.status]}</Badge>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader><DialogTitle>{tx.chTitle} {target?.name}</DialogTitle><DialogDescription>{tx.chDesc}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{tx.mission}</Label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{open.map((m) => <SelectItem key={m.id} value={m.id}>{title(m)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{tx.stake}</Label><div className="grid grid-cols-2 gap-2"><Button type="button" variant={stakeType === "lifecoins" ? "default" : "outline"} onClick={() => setStakeType("lifecoins")}><Flame />{tx.coins}</Button><Button type="button" variant={stakeType === "coupon" ? "default" : "outline"} onClick={() => setStakeType("coupon")}><Gift />{tx.coupon}</Button></div></div>
            {stakeType === "lifecoins" ? <div className="space-y-2"><Label>{tx.coins}</Label><Input type="number" min={0} max={data.player.totalPoints} step={50} value={stake} onChange={(e) => setStake(Math.max(0, Number(e.target.value)))} /></div> : <div className="space-y-2"><Label>{tx.coupon}</Label><Select value={couponId} onValueChange={setCouponId}><SelectTrigger><SelectValue placeholder={tx.chooseCoupon} /></SelectTrigger><SelectContent>{data.coupons.filter((coupon) => !coupon.sharedWith).map((coupon) => <SelectItem key={coupon.id} value={coupon.id}>{t(`reward.${coupon.rewardId}`)}</SelectItem>)}</SelectContent></Select>{data.coupons.filter((coupon) => !coupon.sharedWith).length === 0 && <p className="text-xs text-muted-foreground">{tx.noCoupons}</p>}</div>}
          </div>
          <DialogFooter><Button onClick={() => void sendChallenge()} disabled={busy === "challenge" || !missionId || (stakeType === "coupon" && !couponId) || (stakeType === "lifecoins" && (stake <= 0 || stake > data.player.totalPoints))}>{busy === "challenge" ? <LoaderCircle className="animate-spin" /> : <Swords />}{tx.send}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
