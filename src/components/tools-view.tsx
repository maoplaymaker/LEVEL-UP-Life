import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, CalendarDays, CheckSquare2, Clock3, Dices,
  LoaderCircle, NotebookPen, Target, Plus, Send, Share2, Sparkles, Users,
} from "lucide-react";
import { toast } from "sonner";

import { ArcadeView } from "@/components/arcade-view";
import { AgendaView } from "@/components/planner-views";
import { emptyGoalAiState, GoalAi } from "@/components/goal-ai";
import { GoalTracker, initialTracker } from "@/components/goal-tracker";
import { PageTitle, SectionLabel, type Update } from "@/components/shared";
import { useMissionTitle } from "@/components/social-views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { applyStatXp, levelUpService, type DashboardData, type Mission } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";

type Tool = "home" | "goal" | "tracker" | "calendar" | "checklist" | "agenda" | "notes" | "arcade" | "share";
type Reminder = { id: string; title: string; note: string; at: string };

const localDate = () => {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

const toolIcons = { goal: Sparkles, tracker: Target, calendar: CalendarDays, checklist: CheckSquare2, agenda: Clock3, notes: NotebookPen, arcade: Dices };

export function ToolsView({ data, update, busyId, onComplete }: { data: DashboardData; update: Update; busyId: string | null; onComplete: (mission: Mission) => void }) {
  const { t } = useI18n();
  const [tool, setTool] = useState<Tool>("home");
  const [goalState, setGoalState] = useState(emptyGoalAiState);
  const [tracker, setTracker] = useState(initialTracker);

  if (tool === "goal") return <ToolShell title={t("tools.goal")} onBack={() => setTool("home")}><GoalAi data={data} update={update} state={goalState} setState={setGoalState} /></ToolShell>;
  if (tool === "tracker") return <ToolShell title={t("tools.tracker")} onBack={() => setTool("home")}><GoalTracker state={tracker} setState={setTracker} onGoalReached={(category) => update((current) => ({ ...current, lifeStats: applyStatXp(current.lifeStats, category, 100).stats }))} /></ToolShell>;
  if (tool === "calendar") return <ToolShell title={t("tools.calendar")} onBack={() => setTool("home")}><AgendaView data={data} update={update} busyId={busyId} onComplete={onComplete} /></ToolShell>;
  if (tool === "checklist") return <ToolShell title={t("tools.checklist")} onBack={() => setTool("home")}><ChecklistTool data={data} update={update} busyId={busyId} onComplete={onComplete} /></ToolShell>;
  if (tool === "agenda") return <ToolShell title={t("tools.agenda")} onBack={() => setTool("home")}><DailyAgenda data={data} update={update} busyId={busyId} onComplete={onComplete} /></ToolShell>;
  if (tool === "notes") return <ToolShell title={t("tools.notes")} onBack={() => setTool("home")}><NotesTool /></ToolShell>;
  if (tool === "arcade") return <ToolShell title={t("tools.arcade")} onBack={() => setTool("home")}><ArcadeView data={data} update={update} /></ToolShell>;
  if (tool === "share") return <ToolShell title={t("tools.share")} onBack={() => setTool("home")}><ShareCenter data={data} update={update} /></ToolShell>;

  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("tools.eyebrow")} title={t("tools.title")} subtitle={t("tools.subtitle")} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {(Object.keys(toolIcons) as Exclude<Tool, "home" | "share">[]).map((id) => {
          const Icon = toolIcons[id];
          return (
            <Button key={id} variant="outline" onClick={() => setTool(id)} className={cn("group h-36 flex-col items-start justify-between border-border bg-card/80 p-4 text-left hover:border-neon/50 hover:bg-neon/5 sm:h-44 sm:p-6", id === "goal" && "col-span-2 border-neon/35 bg-neon/5 sm:col-span-1 lg:col-span-2")}>
              <span className="grid h-11 w-11 place-items-center border border-neon/35 bg-neon/10 text-neon transition-transform group-hover:scale-105"><Icon className="h-5 w-5" /></span>
              <span className="w-full"><span className="block text-base font-bold sm:text-lg">{t(`tools.${id}`)}</span><span className="mt-1 block whitespace-normal text-xs font-normal leading-relaxed text-muted-foreground">{t(`tools.${id}.sub`)}</span></span>
            </Button>
          );
        })}
        <Button variant="outline" onClick={() => setTool("share")} className="group col-span-2 h-32 flex-col items-start justify-between border-electric/35 bg-electric/5 p-4 text-left hover:border-electric sm:h-36 sm:p-6 lg:col-span-1">
          <span className="grid h-11 w-11 place-items-center border border-electric/40 bg-electric/10 text-electric"><Share2 className="h-5 w-5" /></span>
          <span className="w-full"><span className="block text-base font-bold sm:text-lg">{t("tools.share")}</span><span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">{t("tools.share.sub")}</span></span>
        </Button>
      </div>
    </div>
  );
}

function ToolShell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const { t } = useI18n();
  return <div className="animate-fade-in space-y-5"><Button variant="ghost" onClick={onBack} className="px-0 text-muted-foreground hover:text-neon"><ArrowLeft />{t("tools.back")}</Button><div className="sr-only"><h1>{title}</h1></div>{children}</div>;
}

function ChecklistTool({ data, update, busyId, onComplete }: { data: DashboardData; update: Update; busyId: string | null; onComplete: (mission: Mission) => void }) {
  const { t } = useI18n();
  const title = useMissionTitle();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const quickItems = data.missions.filter((mission) => mission.dueDate === localDate() && (mission.checklist?.length ?? 0) === 0);
  const add = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      const saved = await levelUpService.saveTask({ id: `task_${Date.now()}`, title: text.trim(), category: "Trabajo", difficulty: "Fácil", xp: 25, type: "daily", completed: false, dueDate: localDate() });
      update((current) => ({ ...current, missions: [saved, ...current.missions] }));
      setText("");
      toast.success(t("toast.created"));
    } finally { setSaving(false); }
  };
  const missionSteps = data.missions.filter((mission) => (mission.checklist?.length ?? 0) > 0);
  const toggleMissionStep = (missionId: string, stepId: string) => update((current) => ({ ...current, missions: current.missions.map((mission) => {
    if (mission.id !== missionId || !mission.checklist) return mission;
    return { ...mission, checklist: mission.checklist.map((step) => step.id === stepId ? { ...step, done: !step.done } : step) };
  }) }));
  return <div className="space-y-8"><PageTitle eyebrow={t("tools.organize")} title={t("tools.checklist")} subtitle={t("tools.checklist.sub")} />
    <section><SectionLabel>{t("tools.quick")}</SectionLabel><form onSubmit={(event) => void add(event)} className="mb-4 flex gap-2"><Input value={text} onChange={(event) => setText(event.target.value)} placeholder={t("tools.check.placeholder")} /><Button type="submit" size="icon" disabled={saving} aria-label={t("tools.add")}>{saving ? <LoaderCircle className="animate-spin" /> : <Plus />}</Button></form>
      <div className="space-y-2">{quickItems.map((item) => <div key={item.id} className="flex items-center gap-3 border border-border bg-card/70 p-3"><Checkbox checked={item.completed} disabled={item.completed || busyId === item.id} onCheckedChange={() => onComplete(item)} /><span className={cn("min-w-0 flex-1 text-sm", item.completed && "text-muted-foreground line-through")}>{title(item)}</span><Badge variant="outline">+{item.xp} XP</Badge></div>)}</div>
    </section>
    <section><SectionLabel>{t("tools.questSteps")}</SectionLabel><div className="space-y-3">{missionSteps.map((mission) => <Card key={mission.id} className="bg-card/70"><CardContent className="space-y-3 p-4"><p className="font-semibold">{title(mission)}</p>{mission.checklist?.map((step) => <label key={step.id} className="flex items-center gap-3 text-sm"><Checkbox checked={step.done} onCheckedChange={() => toggleMissionStep(mission.id, step.id)} /><span className={cn(step.done && "text-muted-foreground line-through")}>{step.text}</span></label>)}</CardContent></Card>)}</div></section>
  </div>;
}

function DailyAgenda({ data, update, busyId, onComplete }: { data: DashboardData; update: Update; busyId: string | null; onComplete: (mission: Mission) => void }) {
  const { t } = useI18n();
  const [time, setTime] = useState("09:00");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const missionTitle = useMissionTitle();
  const sorted = useMemo(() => data.missions.filter((item) => item.dueDate === localDate()).sort((a, b) => (a.scheduledTime ?? "23:59").localeCompare(b.scheduledTime ?? "23:59")), [data.missions]);
  const add = async (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; setSaving(true); try { const saved = await levelUpService.saveTask({ id: `task_${Date.now()}`, title: title.trim(), category: "Trabajo", difficulty: "Fácil", xp: 25, type: "daily", completed: false, dueDate: localDate(), scheduledTime: time }); update((current) => ({ ...current, missions: [saved, ...current.missions] })); setTitle(""); toast.success(t("toast.created")); } finally { setSaving(false); } };
  return <div><PageTitle eyebrow={t("tools.planDay")} title={t("tools.agenda")} subtitle={t("tools.agenda.sub")} /><form onSubmit={(event) => void add(event)} className="mb-6 grid grid-cols-[6.5rem_minmax(0,1fr)_auto] gap-2"><Input type="time" value={time} onChange={(event) => setTime(event.target.value)} /><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("tools.agenda.placeholder")} /><Button type="submit" size="icon" disabled={saving} aria-label={t("tools.add")}>{saving ? <LoaderCircle className="animate-spin" /> : <Plus />}</Button></form>
    <div className="relative space-y-3 before:absolute before:bottom-4 before:left-[3.15rem] before:top-4 before:w-px before:bg-border">{sorted.map((item) => <div key={item.id} className="relative grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3"><span className="z-10 bg-background pr-3 font-mono text-xs text-electric">{item.scheduledTime ?? "—"}</span><div className="flex items-center gap-3 border border-border bg-card/80 p-4"><Checkbox checked={item.completed} disabled={item.completed || busyId === item.id} onCheckedChange={() => onComplete(item)} /><span className={cn("flex-1 text-sm font-medium", item.completed && "text-muted-foreground line-through")}>{missionTitle(item)}</span></div></div>)}</div>
  </div>;
}

function NotesTool() {
  const { t } = useI18n();
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [at, setAt] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recipient, setRecipient] = useState("");
  const [sharing, setSharing] = useState<string | null>(null);
  const add = () => { if (!title.trim() || !at) return; setReminders((current) => [{ id: `r_${Date.now()}`, title: title.trim(), note, at }, ...current]); setTitle(""); setNote(""); setAt(""); toast.success(t("tools.reminder.created")); };
  const share = async (reminder: Reminder) => {
    if (!recipient.trim()) return;
    setSharing(reminder.id);
    try { await levelUpService.shareReminder(reminder.id, reminder.title, recipient.trim()); toast.success(t("tools.share.sent", { who: recipient.trim() })); }
    catch { toast.error(t("toast.fail")); } finally { setSharing(null); }
  };
  return <div><PageTitle eyebrow={t("tools.capture")} title={t("tools.notes")} subtitle={t("tools.notes.sub")} /><div className="grid gap-5 lg:grid-cols-2"><Card className="bg-card/80"><CardContent className="space-y-4 p-5"><div className="space-y-2"><Label>{t("tools.reminder.title")}</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("tools.reminder.placeholder")} /></div><div className="space-y-2"><Label>{t("tools.reminder.note")}</Label><Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} /></div><div className="space-y-2"><Label>{t("tools.reminder.when")}</Label><Input type="datetime-local" value={at} onChange={(event) => setAt(event.target.value)} /></div><Button onClick={add} disabled={!title.trim() || !at}><Plus />{t("tools.reminder.create")}</Button></CardContent></Card><div><SectionLabel>{t("tools.reminders")}</SectionLabel>{reminders.length === 0 ? <p className="text-sm text-muted-foreground">{t("tools.reminder.empty")}</p> : <><Input className="mb-3" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={t("sh.placeholder")} />{reminders.map((reminder) => <div key={reminder.id} className="mb-3 border border-border bg-card/70 p-4"><div className="flex flex-wrap justify-between gap-3"><p className="font-semibold">{reminder.title}</p><Badge variant="outline"><Clock3 className="mr-1 h-3 w-3" />{new Date(reminder.at).toLocaleString()}</Badge></div>{reminder.note && <p className="mt-2 text-sm text-muted-foreground">{reminder.note}</p>}<Button variant="outline" size="sm" className="mt-3" disabled={!recipient.trim() || sharing === reminder.id} onClick={() => void share(reminder)}>{sharing === reminder.id ? <LoaderCircle className="animate-spin" /> : <Share2 />}{t("tools.share.send")}</Button></div>)}</>}</div></div></div>;
}

function ShareCenter({ data, update }: { data: DashboardData; update: Update }) {
  const { t } = useI18n();
  const missionTitle = useMissionTitle();
  const [kind, setKind] = useState<"mission" | "coupon" | "reminder">("mission");
  const [itemId, setItemId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [reminder, setReminder] = useState("");
  const [busy, setBusy] = useState(false);
  const options = kind === "mission" ? data.missions : data.coupons;
  const send = async () => {
    if (!recipient.trim() || (kind !== "reminder" && !itemId) || (kind === "reminder" && !reminder.trim())) return;
    setBusy(true);
    try {
      if (kind === "mission") {
        const mission = data.missions.find((entry) => entry.id === itemId);
        if (!mission) return;
        const shared = await levelUpService.shareMission(mission.id, missionTitle(mission), recipient.trim());
        update((current) => ({ ...current, shared: [shared, ...current.shared] }));
      } else if (kind === "coupon") {
        await levelUpService.shareCoupon(itemId, recipient.trim());
        update((current) => ({ ...current, coupons: current.coupons.map((coupon) => coupon.id === itemId ? { ...coupon, sharedWith: recipient.trim() } : coupon) }));
      } else await levelUpService.shareReminder(`reminder_${Date.now()}`, reminder.trim(), recipient.trim());
      toast.success(t("tools.share.sent", { who: recipient.trim() })); setRecipient(""); setItemId(""); setReminder("");
    } catch { toast.error(t("toast.fail")); } finally { setBusy(false); }
  };
  return <div><PageTitle eyebrow={t("tools.together")} title={t("tools.share")} subtitle={t("tools.share.sub")} /><Card className="mx-auto max-w-2xl bg-card/80"><CardContent className="space-y-5 p-5 sm:p-7"><div className="grid grid-cols-3 gap-2">{(["mission", "coupon", "reminder"] as const).map((value) => <Button key={value} variant={kind === value ? "default" : "outline"} onClick={() => { setKind(value); setItemId(""); }} className="px-2"><span className="truncate">{t(`tools.share.${value}`)}</span></Button>)}</div>
    {kind === "reminder" ? <div className="space-y-2"><Label>{t("tools.share.reminder")}</Label><Input value={reminder} onChange={(event) => setReminder(event.target.value)} placeholder={t("tools.reminder.placeholder")} /></div> : <div className="space-y-2"><Label>{t(`tools.share.${kind}`)}</Label><Select value={itemId} onValueChange={setItemId}><SelectTrigger><SelectValue placeholder={t("tools.share.choose")} /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{kind === "mission" ? missionTitle(item as Mission) : t(`reward.${(item as DashboardData["coupons"][number]).rewardId}`)}</SelectItem>)}</SelectContent></Select>{kind === "coupon" && options.length === 0 && <p className="text-xs text-muted-foreground">{t("tools.share.noCoupons")}</p>}</div>}
    <div className="space-y-2"><Label>{t("tools.share.friend")}</Label><Input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={t("sh.placeholder")} /></div><Button onClick={() => void send()} disabled={busy || !recipient.trim() || (kind === "reminder" ? !reminder.trim() : !itemId)} className="w-full">{busy ? <LoaderCircle className="animate-spin" /> : <Send />}{t("tools.share.send")}</Button><p className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{t("tools.serverNote")}</p></CardContent></Card></div>;
}