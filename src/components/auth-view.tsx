import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AvatarFigure } from "@/components/avatar";
import { PageTitle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AVATAR_ITEMS, canWearOutfit, type AvatarState, type Slot } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";

const starterSlots: Slot[] = ["character", "outfit", "accessory"];
const defaultAvatar: AvatarState = { equipped: { character: "char_runner", outfit: "outfit_street", accessory: null, scene: "scene_city", pet: null, aura: null } };

type Questionnaire = { sex: string; age: string; area: string; energy: string; mood: string };
const emptyQuestionnaire: Questionnaire = { sex: "", age: "", area: "", energy: "", mood: "" };

export function AuthView() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [quiz, setQuiz] = useState<Questionnaire>(emptyQuestionnaire);
  const [busy, setBusy] = useState(false);
  const steps = [t("auth.account"), t("auth.profile"), t("auth.character"), t("auth.outfit"), t("auth.accessory"), t("auth.ready")];

  const choose = (slot: Slot, id: string) => setAvatar((current) => ({ ...current, equipped: { ...current.equipped, ...(slot === "character" && current.equipped.character !== id ? { outfit: null, accessory: null } : {}), [slot]: id } }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.signedIn"));
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) throw error;
      if (data.user) {
        await supabase.from("profiles").upsert({ user_id: data.user.id, display_name: name, handle: handle.startsWith("@") ? handle : `@${handle}`, locale, onboarding_complete: true });
        await supabase.from("player_progress").upsert({ user_id: data.user.id, equipped: avatar.equipped, owned_items: Object.values(avatar.equipped).filter(Boolean) });
      }
      toast.success(t("auth.checkEmail"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("toast.fail")); } finally { setBusy(false); }
  };
  const resetPassword = async () => {
    if (!email) { toast.error(t("auth.emailFirst")); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    error ? toast.error(error.message) : toast.success(t("auth.resetSent"));
  };

  if (mode === "signin") return (
    <form onSubmit={submit} className="mx-auto max-w-md animate-fade-in border border-border bg-card/80 p-6 sm:p-8">
      <LockKeyhole className="h-9 w-9 text-neon" /><h1 className="mt-5 text-3xl font-bold">{t("auth.signin")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("auth.signinSub")}</p>
      <div className="mt-7 space-y-4"><Field label={t("auth.email")}><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field label={t("auth.password")}><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field></div>
      <Button type="submit" disabled={busy} className="mt-6 w-full">{busy ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}{t("auth.enter")}</Button>
      <Button type="button" variant="ghost" onClick={() => void resetPassword()} className="mt-2 w-full text-muted-foreground">{t("auth.forgot")}</Button>
      <Button type="button" variant="ghost" onClick={() => setMode("signup")} className="mt-2 w-full">{t("auth.needAccount")}</Button>
    </form>
  );

  const slot = starterSlots[step - 1];
  return (
    <div className="animate-fade-in">
      <PageTitle eyebrow={t("auth.eyebrow")} title={t("auth.title")} subtitle={t("auth.subtitle")} action={<Button variant="outline" onClick={() => setMode("signin")}><LockKeyhole />{t("auth.signin")}</Button>} />
      <div className="mb-6 grid grid-cols-5 gap-1" aria-label={t("auth.progress")}>{steps.map((label, index) => <div key={label} className={cn("border-t-2 pt-2 text-center font-mono text-[9px] uppercase", index <= step ? "border-neon text-neon" : "border-border text-muted-foreground")}>{label}</div>)}</div>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4"><AvatarFigure avatar={avatar} className="aspect-[4/5] w-full border border-electric/30" /><p className="text-center font-mono text-xs uppercase text-electric">{steps[step]}</p></div>
        <div className="border border-border bg-card/70 p-5 sm:p-7">
          {step === 0 && <div className="space-y-5"><Field label={t("auth.name")}><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label={t("auth.handle")}><Input required value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@alex" /></Field><Field label={t("auth.email")}><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field label={t("auth.password")}><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field></div>}
          {slot && <ChoiceGrid slot={slot} avatar={avatar} onChoose={choose} />}
          {step === 4 && <div className="py-10 text-center"><UserRound className="mx-auto h-14 w-14 text-neon" /><h2 className="mt-5 text-2xl font-bold">{t("auth.readyTitle", { name: name || t("auth.player") })}</h2><p className="mt-2 text-muted-foreground">{t("auth.readySub")}</p></div>}
          <div className="mt-7 flex justify-between"><Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft />{t("auth.back")}</Button>{step < 4 ? <Button type="button" disabled={step === 0 && (!name || !handle || !email || password.length < 8)} onClick={() => setStep((s) => s + 1)}>{t("auth.next")}<ArrowRight /></Button> : <Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <Check />}{t("auth.create")}</Button>}</div>
        </div>
      </form>
    </div>
  );
}

function ChoiceGrid({ slot, avatar, onChoose }: { slot: Slot; avatar: AvatarState; onChoose: (slot: Slot, id: string) => void }) {
  const { t } = useI18n();
  return <div><h2 className="mb-4 text-xl font-bold">{t(`auth.choose.${slot}`)}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{AVATAR_ITEMS.filter((item) => item.slot === slot && item.source === "free" && (slot !== "outfit" || canWearOutfit(avatar.equipped.character, item.id))).map((item) => <Button type="button" variant="outline" key={item.id} onClick={() => onChoose(slot, item.id)} className={cn("h-auto min-h-20 justify-start p-3 text-left", avatar.equipped[slot] === item.id && "border-neon bg-neon/10 text-neon")}><span>{t(`item.${item.id}`)}</span>{avatar.equipped[slot] === item.id && <Check className="ml-auto" />}</Button>)}</div></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }