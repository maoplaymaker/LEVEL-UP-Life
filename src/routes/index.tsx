import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  BadgeCheck, Check, Dices, ChevronRight, CircleAlert, Crown, Edit3, Flame, Gift, Languages, LayoutDashboard, Link2,
  LoaderCircle, Lock, Plus, RefreshCw, Share2, Shield, ShoppingBag, Sparkles, Sword, Target, Trophy, UserRound, X, Zap, BookOpen, LogIn,
  HeartPulse, WalletCards, Users, Gem, Star, PawPrint, Medal, ChevronDown, BarChart3, Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { AvatarFigure, AvatarPortrait } from "@/components/avatar";
import { AvatarView } from "@/components/avatar-view";
import { ArcadeView, DailyBoost } from "@/components/arcade-view";
import { LifeStatsPanel, categoryClass, categoryIcon } from "@/components/life-stats";
import { PageTitle, type Update } from "@/components/shared";
import { RewardsView, ShareView, SyncView, useMissionTitle } from "@/components/social-views";
import { StoreView } from "@/components/store-view";
import { AuthView } from "@/components/auth-view";
import { ProfileView } from "@/components/profile-view";
import { FriendsView } from "@/components/planner-views";
import { ToolsView } from "@/components/tools-view";
import { StoryView } from "@/components/story-view";
import { WorldBanner } from "@/components/world-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import {
  type Achievement, type Category, type DashboardData, type Difficulty, type Mission, type TaskType,
  CATEGORIES, applyStatXp, getLevelRank, levelUpService, onTaskComplete,
} from "@/lib/level-up-service";
import { cn } from "@/lib/utils";
import { loadGame, saveGame } from "@/lib/game-sync";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Level Up Life — Gamified productivity RPG" },
      { name: "description", content: "Complete quests, earn XP, customize your avatar and turn your habits into real progress. Available in English, Español and Português." },
      { property: "og:title", content: "Level Up Life — Gamified productivity RPG" },
      { property: "og:description", content: "Your personal productivity RPG: quests, avatar, store, co-op and app sync." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "dashboard" | "tools" | "friends" | "missions" | "stats" | "avatar" | "store" | "rewards" | "achievements" | "share" | "sync" | "profile" | "auth" | "story";

const navItems: { id: View; icon: typeof Zap }[] = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "stats", icon: BarChart3 },
  { id: "missions", icon: Target },
  { id: "friends", icon: Users },
  { id: "store", icon: ShoppingBag },
  { id: "avatar", icon: UserRound },
  { id: "tools", icon: Wrench },
];

function Index() {
  const { t } = useI18n();
  const title = useMissionTitle();
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [burst, setBurst] = useState(0);

  const update: Update = (fn) => setData((d) => (d ? fn(d) : d));

  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    setSynced(false);
    try {
      const loaded = await loadGame(await levelUpService.getDashboard());
      setUserId(loaded.userId);
      setData(loaded.data);
      setSynced(true);
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : "err.server"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadDashboard(); }, []);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") { if (event === "SIGNED_IN") setView("dashboard"); void loadDashboard(); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!data || !synced) return;
    const timer = setTimeout(() => { saveGame(data, userId).catch(() => toast.error(t("toast.syncFail"))); }, 800);
    return () => clearTimeout(timer);
  }, [data, userId, synced, t]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", data?.themeId ?? "cyber"); }, [data?.themeId]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view]);

  const completeMission = async (mission: Mission) => {
    if (!data || mission.completed || busyId) return;
    setBusyId(mission.id);
    try {
      await onTaskComplete(mission.id);
      let leveled = false;
      update((d) => {
        const { stats, leveledUp } = applyStatXp(d.lifeStats, mission.category, mission.xp);
        leveled = leveledUp;
        let { level, currentXp, nextLevelXp } = d.player;
        currentXp += mission.xp;
        while (currentXp >= nextLevelXp) { currentXp -= nextLevelXp; level += 1; nextLevelXp = level * 100; }
        return {
          ...d,
          lifeStats: stats,
          player: { ...d.player, level, currentXp, nextLevelXp, totalPoints: d.player.totalPoints + mission.xp },
          missions: d.missions.map((item) => (item.id === mission.id ? { ...item, completed: true, completedOn: new Date().toISOString().slice(0, 10) } : item)),
        };
      });
      setBurst((v) => v + 1);
      const cat = t(`cat.${mission.category}`);
      toast.success(t("toast.xp", { xp: Math.min(120, mission.xp), cat }), { description: leveled ? t("toast.levelUp", { cat }) : t("toast.keepGoing") });
    } catch { toast.error(t("toast.missionFail")); } finally { setBusyId(null); }
  };

  const saveMission = async (mission: Mission) => {
    if (!data) return;
    setBusyId("saving");
    try {
      const saved = await levelUpService.saveTask(mission);
      const exists = data.missions.some((item) => item.id === saved.id);
      update((d) => ({ ...d, missions: exists ? d.missions.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...d.missions] }));
      setEditorOpen(false);
      setEditing(null);
      toast.success(exists ? t("toast.updated") : t("toast.created"));
    } finally { setBusyId(null); }
  };

  const simulateError = async () => {
    setError("");
    try { await levelUpService.simulateError(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "err.server"); }
  };

  if (loading) return <LoadingScreen />;
  if (!data) return <ErrorScreen message={t(error)} onRetry={() => void loadDashboard()} />;

  const todayIso = new Date().toISOString().slice(0, 10);
  const completedToday = data.missions.filter((m) => m.completed && m.completedOn === todayIso).length;

  return (
     <div className="app-shell min-h-screen bg-background text-foreground cyber-grid">
      {burst > 0 && <ParticleBurst key={burst} />}
       <aside className="main-nav fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card/95 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Main">
          {navItems.map((item) => (
             <Button key={item.id} variant="ghost" onClick={() => setView(item.id)} className={cn("nav-choice h-10 w-full justify-start gap-3 px-3 text-muted-foreground", view === item.id && "nav-choice-active border border-neon/25 bg-neon/10 text-neon")}>
              <item.icon /> {t(`nav.${item.id}`)}
            </Button>
          ))}
        </nav>
        <div className="m-4 border border-border bg-background/50 p-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase text-neon"><span className="h-2 w-2 animate-pulse rounded-full bg-neon" /> {t("sys.online")}</div>
          <p className="text-xs text-muted-foreground">{t("sys.allOnline")}</p>
        </div>
      </aside>

      <main className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
         <header className="main-header sticky top-0 z-20 grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:hidden"><Brand compact /></div>
          <div className="hidden min-w-0 lg:block"><p className="font-mono text-[10px] uppercase text-muted-foreground">{t("sys.path")} / {t(`nav.${view}`)}</p></div>
          <div className="flex shrink-0 items-center gap-3">
            <LanguageSelect />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{data.player.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{data.player.handle}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" aria-label={t("account.menu")} className="h-10 gap-1 p-0.5 pr-1 text-muted-foreground hover:bg-accent">
                   <span className="block h-8 w-8 shrink-0 overflow-hidden rounded-full border border-violet/40">
                      <AvatarPortrait avatar={data.avatar} className="h-full w-full" />
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-64 border-violet/30 bg-popover/95 p-2 backdrop-blur-xl">
                <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2.5">
                   <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neon/35">
                      <AvatarPortrait avatar={data.avatar} className="h-full w-full" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{data.player.name}</span>
                    <span className="block truncate font-mono text-[10px] font-normal text-muted-foreground">{data.player.handle}</span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setView("profile")} className="py-2.5"><UserRound />{t("nav.profile")}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setView("achievements")} className="py-2.5"><Trophy />{t("nav.achievements")}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setView("rewards")} className="py-2.5"><Gift />{t("nav.rewards")}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setView("share")} className="py-2.5"><Share2 />{t("nav.share")}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setView("sync")} className="py-2.5"><Link2 />{t("nav.sync")}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setView("story")} className="py-2.5"><BookOpen />{t("nav.story")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setView("auth")} className="py-2.5"><LogIn />{t("nav.auth")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          {error && <ApiErrorBanner message={t(error)} onClose={() => setError("")} onRetry={() => void loadDashboard()} />}
           {view === "dashboard" && <Dashboard data={data} completedToday={completedToday} busyId={busyId} onComplete={completeMission} onSeeMissions={() => setView("missions")} onCustomize={() => setView("avatar")} onExplore={() => setView("store")} onSimulateError={() => void simulateError()} />}
          {view === "missions" && <MissionsView missions={data.missions} busyId={busyId} onComplete={completeMission} onAdd={() => { setEditing(null); setEditorOpen(true); }} onEdit={(m) => { setEditing({ ...m, title: title(m) }); setEditorOpen(true); }} />}
           {view === "stats" && <StatsView stats={data.lifeStats} missions={data.missions} onReflect={(category, reflection) => update((current) => ({ ...current, lifeStats: current.lifeStats.map((stat) => stat.category === category && stat.level >= 10 ? { ...stat, reflection } : stat) }))} onCheck={(category) => update((current) => ({ ...current, lifeStats: applyStatXp(current.lifeStats, category, 1).stats }))} />}
           {view === "friends" && <FriendsView data={data} update={update} />}
           {view === "tools" && <ToolsView data={data} update={update} busyId={busyId} onComplete={completeMission} />}
          {view === "avatar" && <AvatarView data={data} update={update} onGoStore={() => setView("store")} />}
          {view === "store" && <StoreView data={data} update={update} />}
          {view === "rewards" && <RewardsView data={data} update={update} />}
          {view === "achievements" && <AchievementsView achievements={data.achievements} />}
          {view === "share" && <ShareView data={data} update={update} />}
          {view === "sync" && <SyncView data={data} update={update} />}
           {view === "profile" && <ProfileView data={data} />}
           {view === "auth" && <AuthView />}
           {view === "story" && <StoryView onStart={() => setView("auth")} />}
        </div>
      </main>

       <nav className="main-mobile-nav fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Mobile">
        {navItems.map((item) => (
           <Button key={item.id} variant="ghost" onClick={() => setView(item.id)} className={cn("nav-choice h-16 min-w-0 flex-1 basis-0 flex-col gap-1 rounded-none px-0.5 text-[9px] text-muted-foreground", view === item.id && "nav-choice-active text-neon")}>
            <item.icon className="h-5 w-5" /> {t(`nav.${item.id}`)}
          </Button>
        ))}
      </nav>

      <MissionEditor open={editorOpen} mission={editing} saving={busyId === "saving"} onOpenChange={setEditorOpen} onSave={saveMission} />
    </div>
  );
}

function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  return (
    <Select value={locale} onValueChange={(v) => { setLocale(v as Locale); void levelUpService.setLocale(v); }}>
      <SelectTrigger aria-label={t("lang.label")} className="h-9 w-auto gap-1 px-2 font-mono text-xs"><Languages className="h-4 w-4" /><SelectValue /></SelectTrigger>
      <SelectContent>{LOCALES.map((l) => <SelectItem key={l.id} value={l.id}>{l.short} · {l.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", !compact && "h-16 border-b border-border px-5")}>
      <div className="grid h-9 w-9 shrink-0 place-items-center border border-neon/40 bg-neon/10 text-neon neon-shadow"><Zap className="h-5 w-5 fill-current" /></div>
      <div className="min-w-0"><p className="truncate text-sm font-bold uppercase">Level Up <span className="text-neon">Life</span></p>{!compact && <p className="font-mono text-[9px] uppercase text-muted-foreground">Personal OS v1.1</p>}</div>
    </div>
  );
}

function Dashboard({ data, completedToday, busyId, onComplete, onSeeMissions, onCustomize, onExplore, onSimulateError }: { data: DashboardData; completedToday: number; busyId: string | null; onComplete: (m: Mission) => void; onSeeMissions: () => void; onCustomize: () => void; onExplore: () => void; onSimulateError: () => void }) {
  const { t, n } = useI18n();
  const xpPercent = Math.round((data.player.currentXp / data.player.nextLevelXp) * 100);
  const active = data.missions.filter((m) => !m.completed).slice(0, 3);
  const rank = getLevelRank(data.player.level);
  return (
    <div className="animate-fade-in space-y-8">
      <section className="border-b border-border pb-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-end">
          <div className="flex items-center gap-5">
            <button type="button" onClick={onCustomize} aria-label={t("dash.customize")} className="group relative hidden h-24 w-24 shrink-0 overflow-hidden border border-violet/40 sm:block">
              <AvatarPortrait avatar={data.avatar} className="h-full w-full" />
              <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center font-mono text-[9px] uppercase text-violet opacity-0 transition-opacity group-hover:opacity-100">{t("dash.customize")}</span>
            </button>
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase text-neon"><Sparkles className="h-4 w-4" /> {t("dash.session")}</div>
              <h1 className="text-3xl font-bold sm:text-5xl">{t("dash.welcome")} <span className="text-neon">Alex.</span></h1>
              <p className="mt-3 max-w-xl text-muted-foreground">{t("dash.tagline")}</p>
            </div>
          </div>
          <div className="border-l-2 border-violet pl-5">
             <div className="flex items-end justify-between"><span className="font-mono text-xs uppercase text-muted-foreground">{t(`rank.${rank?.key ?? "novice"}`)}</span><span className="text-3xl font-bold text-violet">{data.player.level}</span></div>
             <Progress value={xpPercent} className="main-xp-rail mt-3 h-2 bg-violet/15 [&>div]:bg-violet" />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>{data.player.currentXp} XP</span><span>{data.player.nextLevelXp} XP</span></div>
          </div>
        </div>
      </section>

       <section className="dashboard-metrics grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
        <Metric icon={Zap} label={t("dash.points")} value={n(data.player.totalPoints)} accent="neon" />
        <Metric icon={BadgeCheck} label={t("dash.completed")} value={`${completedToday}/${data.missions.length}`} accent="electric" />
        <Metric icon={Flame} label={t("dash.streak")} value={t("dash.days", { n: data.player.streak })} accent="violet" detail={t("dash.multiplier", { n: data.player.multiplier })} />
      </section>

      <DailyBoost stats={data.lifeStats} />

      <WorldBanner onExplore={onExplore} />

      <section>
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0"><p className="font-mono text-[10px] uppercase text-electric">{t("dash.queue")}</p><h2 className="mt-1 truncate text-2xl font-bold">{t("dash.next")}</h2></div>
          <Button variant="ghost" onClick={onSeeMissions} className="shrink-0 text-electric">{t("dash.seeAll")} <ChevronRight /></Button>
        </div>
        <div className="space-y-3">{active.map((m) => <MissionRow key={m.id} mission={m} busy={busyId === m.id} onComplete={onComplete} />)}</div>
      </section>

      <button type="button" hidden={!import.meta.env.DEV} onClick={onSimulateError} className="text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground">{t("dash.simError")}</button>
    </div>
  );
}

function StatsView({ stats, missions, onReflect, onCheck }: { stats: DashboardData["lifeStats"]; missions: DashboardData["missions"]; onReflect: (category: Category, reflection: string) => void; onCheck: (category: Category) => void }) {
  const { t } = useI18n();
  return (
    <div className="animate-fade-in space-y-6">
      <PageTitle eyebrow={t("stats.eyebrow")} title={t("stats.title")} subtitle={t("stats.subtitle")} />
       <LifeStatsPanel stats={stats} missions={missions} onReflect={onReflect} onCheck={onCheck} />
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent, detail }: { icon: typeof Zap; label: string; value: string; accent: "neon" | "electric" | "violet"; detail?: string }) {
  const color = accent === "neon" ? "text-neon" : accent === "electric" ? "text-electric" : "text-violet";
  return <div className="bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">{label}</span><Icon className={cn("h-5 w-5", color)} /></div><p className={cn("text-3xl font-bold", color)}>{value}</p>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div>;
}

function MissionsView({ missions, busyId, onComplete, onAdd, onEdit }: { missions: Mission[]; busyId: string | null; onComplete: (m: Mission) => void; onAdd: () => void; onEdit: (m: Mission) => void }) {
  const { t } = useI18n();
  return (
    <div className="animate-fade-in">
       <PageTitle eyebrow={t("mis.eyebrow")} title={t("mis.title")} subtitle={t("mis.subtitle")} action={<Button onClick={onAdd} className="mission-primary-action"><Plus /> {t("mis.new")}</Button>} />
      {(["daily", "main"] as TaskType[]).map((type) => {
        const items = missions.filter((m) => m.type === type);
        return (
          <section key={type} className="mb-9">
            <div className="mb-4 flex items-center gap-3"><div className={cn("h-px flex-1", type === "daily" ? "bg-neon/30" : "bg-violet/30")} /><h2 className="font-mono text-xs uppercase text-muted-foreground">{t(type === "daily" ? "mis.daily" : "mis.main")} · {items.filter((i) => i.completed).length}/{items.length}</h2></div>
            <div className="space-y-3">{items.map((m) => <MissionRow key={m.id} mission={m} busy={busyId === m.id} onComplete={onComplete} onEdit={onEdit} />)}</div>
          </section>
        );
      })}
    </div>
  );
}

function MissionRow({ mission, busy, onComplete, onEdit }: { mission: Mission; busy: boolean; onComplete: (m: Mission) => void; onEdit?: (m: Mission) => void }) {
  const { t } = useI18n();
  const title = useMissionTitle()(mission);
  const Icon = categoryIcon[mission.category];
  return (
     <Card className={cn("mission-tile group overflow-hidden rounded-md bg-card/90 transition-all", mission.completed && "mission-tile-done opacity-55")}>
      <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 sm:gap-5 sm:p-5">
         <Button aria-label={mission.completed ? t("mis.done") : t("mis.complete", { title })} size="icon" variant="outline" disabled={mission.completed || busy} onClick={() => onComplete(mission)} className={cn("mission-complete h-10 w-10 shrink-0 rounded-full", !mission.completed && "border-neon/40 text-neon hover:bg-neon/10", mission.completed && "border-neon bg-neon text-primary-foreground")}>
          {busy ? <LoaderCircle className="animate-spin" /> : mission.completed ? <Check /> : <Target />}
        </Button>
        <div className="min-w-0">
          <p className={cn("truncate font-semibold", mission.completed && "line-through")}>{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={categoryClass[mission.category]}><Icon className="mr-1 h-3 w-3" />{t(`cat.${mission.category}`)}</Badge>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">{t(`diff.${mission.difficulty}`)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <span className="font-mono text-xs font-semibold text-neon sm:text-sm">+{mission.xp} XP</span>
           {onEdit && <Button aria-label={t("mis.edit", { title })} variant="ghost" size="icon" onClick={() => onEdit(mission)} className="mission-edit text-muted-foreground opacity-70 hover:text-electric sm:opacity-0 sm:group-hover:opacity-100"><Edit3 /></Button>}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementsView({ achievements }: { achievements: Achievement[] }) {
  const { t } = useI18n();
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const icons = { flame: Flame, sword: Sword, crown: Crown, target: Target, bolt: Zap, shield: Shield, heart: HeartPulse, book: BookOpen, wallet: WalletCards, users: Users, gem: Gem, star: Star, paw: PawPrint, medal: Medal };
  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("ach.eyebrow")} title={t("ach.title")} subtitle={t("ach.subtitle", { u: unlocked, n: achievements.length })} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {achievements.map((a) => {
          const Icon = icons[a.icon];
          return (
            <Card key={a.id} className={cn("rounded-md bg-card/90", !a.unlocked && "opacity-55 grayscale")}>
              <CardContent className="flex min-h-44 gap-4 p-5">
                <div className={cn("grid h-14 w-14 shrink-0 place-items-center border", a.unlocked ? "border-neon/40 bg-neon/10 text-neon neon-shadow" : "border-border bg-muted text-muted-foreground")}><Icon className="h-7 w-7" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><h3 className="font-bold">{t(`badge.${a.id}`)}</h3>{a.unlocked ? <Badge className="bg-neon/15 text-neon">{t("ach.earned")}</Badge> : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{t(`badge.${a.id}.d`)}</p>
                  {a.progress !== undefined && <div className="mt-5"><Progress value={a.progress} className="h-1.5 bg-muted [&>div]:bg-electric" /><p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{a.progress}%</p></div>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MissionEditor({ open, mission, saving, onOpenChange, onSave }: { open: boolean; mission: Mission | null; saving: boolean; onOpenChange: (o: boolean) => void; onSave: (m: Mission) => void }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Salud");
  const [difficulty, setDifficulty] = useState<Difficulty>("Media");
  const [type, setType] = useState<TaskType>("daily");
  const [xp, setXp] = useState("50");
  const [dueDate, setDueDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(mission?.title ?? ""); setCategory(mission?.category ?? "Salud"); setDifficulty(mission?.difficulty ?? "Media"); setType(mission?.type ?? "daily"); setXp(String(mission?.xp ?? 50)); setDueDate(mission?.dueDate ?? ""); setScheduledTime(mission?.scheduledTime ?? ""); setSteps(mission?.checklist?.map((step) => step.text) ?? [""]); setFormError("");
  }, [open, mission]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    const points = Number(xp);
    if (clean.length < 3 || clean.length > 80) { setFormError(t("ed.errTitle")); return; }
    if (!Number.isInteger(points) || points < 5 || points > 120) { setFormError(t("ed.errXp")); return; }
    onSave({ id: mission?.id ?? `task_${Date.now()}`, title: clean, category, difficulty, xp: points, type, completed: mission?.completed ?? false, i18n: false, ...(dueDate ? { dueDate } : {}), ...(scheduledTime ? { scheduledTime } : {}), checklist: steps.filter((step) => step.trim()).map((text, index) => ({ id: mission?.checklist?.[index]?.id ?? `step_${Date.now()}_${index}`, text: text.trim(), done: mission?.checklist?.[index]?.done ?? false })) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md border-electric/30 bg-popover electric-shadow">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>{mission ? t("ed.edit") : t("ed.new")}</DialogTitle><DialogDescription>{t("ed.desc")}</DialogDescription></DialogHeader>
          <div className="space-y-5 py-6">
            <Field label={t("ed.title")}><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={t("ed.placeholder")} className="h-11" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("ed.category")}><Select value={category} onValueChange={(v) => setCategory(v as Category)}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`cat.${c}`)}</SelectItem>)}</SelectContent></Select></Field>
              <Field label={t("ed.difficulty")}><Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent>{(["Fácil", "Media", "Difícil"] as Difficulty[]).map((d) => <SelectItem key={d} value={d}>{t(`diff.${d}`)}</SelectItem>)}</SelectContent></Select></Field>
              <Field label={t("ed.type")}><Select value={type} onValueChange={(v) => setType(v as TaskType)}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">{t("type.daily")}</SelectItem><SelectItem value="main">{t("type.main")}</SelectItem></SelectContent></Select></Field>
              <Field label={t("ed.xp")}><Input type="number" min={5} max={120} step={5} value={xp} onChange={(e) => setXp(e.target.value)} className="h-11" /></Field>
              <Field label={t("ed.deadline")}><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-11" /></Field>
              <Field label={t("ed.time")}><Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="h-11" /></Field>
            </div>
            <Field label={t("ed.steps")}><div className="space-y-2">{steps.map((step, index) => <div key={index} className="flex gap-2"><Input value={step} onChange={(event) => setSteps((current) => current.map((value, position) => position === index ? event.target.value : value))} placeholder={t("ed.stepPlaceholder")} /><Button type="button" size="icon" variant="ghost" aria-label={t("tools.delete")} onClick={() => setSteps((current) => current.filter((_, position) => position !== index))}><X /></Button></div>)}<Button type="button" size="sm" variant="outline" onClick={() => setSteps((current) => [...current, ""])}><Plus />{t("ed.addStep")}</Button></div></Field>
            {formError && <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><CircleAlert className="h-4 w-4" />{formError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("ed.cancel")}</Button>
            <Button type="submit" disabled={saving} className="neon-shadow">{saving ? <LoaderCircle className="animate-spin" /> : <Check />}{mission ? t("ed.save") : t("ed.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }

function ApiErrorBanner({ message, onClose, onRetry }: { message: string; onClose: () => void; onRetry: () => void }) {
  const { t } = useI18n();
  return <div role="alert" className="mb-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-destructive/40 bg-destructive/10 p-4 text-sm"><CircleAlert className="h-5 w-5 shrink-0 text-destructive" /><div className="min-w-0"><p className="font-semibold">{t("err.conn")}</p><p className="truncate text-muted-foreground">{message}</p></div><div className="flex shrink-0"><Button aria-label={t("err.retry")} variant="ghost" size="icon" onClick={onRetry}><RefreshCw /></Button><Button aria-label={t("err.close")} variant="ghost" size="icon" onClick={onClose}><X /></Button></div></div>;
}

function LoadingScreen() {
  const { t } = useI18n();
  return <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background cyber-grid"><div className="relative grid h-16 w-16 place-items-center border border-neon/30 text-neon neon-shadow"><Zap className="h-7 w-7" /><div className="absolute inset-[-6px] animate-spin rounded-full border border-transparent border-t-electric" /></div><div className="text-center"><p className="font-mono text-xs uppercase text-neon">{t("load.sync")}</p><p className="mt-2 text-sm text-muted-foreground">{t("load.progress")}</p></div></div>;
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useI18n();
  return <div className="flex min-h-screen items-center justify-center bg-background p-5"><Card className="max-w-md rounded-md"><CardContent className="p-7 text-center"><CircleAlert className="mx-auto h-10 w-10 text-destructive" /><h1 className="mt-5 text-xl font-bold">{t("err.start")}</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button onClick={onRetry} className="mt-6"><RefreshCw /> {t("err.retry")}</Button></CardContent></Card></div>;
}

function ParticleBurst() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ id: i, x: `${Math.cos((i / 18) * Math.PI * 2) * (80 + (i % 4) * 20)}px`, y: `${Math.sin((i / 18) * Math.PI * 2) * (80 + (i % 4) * 20)}px` })), []);
  return <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center" aria-hidden="true">{particles.map((p) => <span key={p.id} className={cn("particle absolute h-2 w-2", p.id % 3 === 0 ? "bg-neon" : p.id % 3 === 1 ? "bg-electric" : "bg-violet")} style={{ "--x": p.x, "--y": p.y } as CSSProperties} />)}<span className="animate-scale-in font-mono text-2xl font-bold text-neon neon-shadow">QUEST COMPLETE</span></div>;
}
