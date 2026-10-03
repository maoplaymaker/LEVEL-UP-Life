import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Check, KeyRound, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — Level Up Life" },
    { name: "description", content: "Create a new secure password for your Level Up Life account." },
    { property: "og:title", content: "Reset password — Level Up Life" },
    { property: "og:description", content: "Securely recover access to your Level Up Life account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { setReady(window.location.hash.includes("type=recovery")); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false); if (!error) setDone(true);
  };
  return <main className="grid min-h-screen place-items-center bg-background p-5 cyber-grid"><form onSubmit={submit} className="w-full max-w-md border border-electric/30 bg-card/90 p-7 electric-shadow"><KeyRound className="h-10 w-10 text-neon" /><h1 className="mt-5 text-3xl font-bold">{t("reset.title")}</h1><p className="mt-2 text-sm text-muted-foreground">{done ? t("reset.done") : ready ? t("reset.subtitle") : t("reset.invalid")}</p>{ready && !done && <div className="mt-6 space-y-4"><div className="space-y-2"><Label>{t("reset.new")}</Label><Input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></div><Button type="submit" disabled={busy} className="w-full">{busy ? <LoaderCircle className="animate-spin" /> : <Check />}{t("reset.save")}</Button></div>}<Button asChild variant="ghost" className="mt-3 w-full"><Link to="/">{t("reset.home")}</Link></Button></form></main>;
}