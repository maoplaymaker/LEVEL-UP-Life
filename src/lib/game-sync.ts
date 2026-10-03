import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { statLevelXp, type DashboardData } from "@/lib/level-up-service";

const GUEST_KEY = "levelup-guest-state";

/** A brand-new account starts from zero, keeping the starter missions and catalog. */
export function freshStart(base: DashboardData, name: string, handle: string): DashboardData {
  return {
    ...base,
    player: { ...base.player, name, handle, level: 1, currentXp: 0, nextLevelXp: 100, totalPoints: 0, streak: 0, multiplier: 1 },
    lifeStats: base.lifeStats.map((s) => ({ ...s, level: 1, xp: 0, nextLevelXp: statLevelXp(1) })),
    missions: base.missions.map(({ completedOn: _done, ...m }) => ({ ...m, completed: false, ...(m.checklist ? { checklist: m.checklist.map((c) => ({ ...c, done: false })) } : {}) })),
    achievements: base.achievements.map((a) => ({ ...a, unlocked: false, progress: 0 })),
    coupons: [],
    shared: [],
    invites: [],
    integrations: base.integrations.map((i) => ({ ...i, connected: false, lastSync: null })),
  };
}

/** Loads the saved game for the signed-in user, or the guest copy on this device. */
export async function loadGame(base: DashboardData): Promise<{ data: DashboardData; userId: string | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) {
    try {
      const saved = localStorage.getItem(GUEST_KEY);
      if (saved) return { data: { ...base, ...(JSON.parse(saved) as Partial<DashboardData>) }, userId: null };
    } catch { /* ignore */ }
    return { data: base, userId: null };
  }
  const [{ data: progress }, { data: profile }] = await Promise.all([
    supabase.from("player_progress").select("game_state, equipped").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("display_name, handle").eq("user_id", user.id).maybeSingle(),
  ]);
  const name = profile?.display_name || user.email?.split("@")[0] || "Player";
  const handle = profile?.handle || `@${name.toLowerCase()}`;
  const saved = progress?.game_state as Partial<DashboardData> | null | undefined;
  const data = saved
    ? { ...base, ...saved, player: { ...base.player, ...saved.player, name, handle } }
    : freshStart(base, name, handle);
  if (!saved && progress?.equipped && typeof progress.equipped === "object") {
    data.avatar = { equipped: { ...data.avatar.equipped, ...(progress.equipped as object) } };
  }
  return { data, userId: user.id };
}

/** Saves the whole game so it survives reloads and follows the user across devices. */
export async function saveGame(data: DashboardData, userId: string | null) {
  if (!userId) {
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    return;
  }
  const { error } = await supabase.from("player_progress").upsert({
    user_id: userId,
    game_state: data as unknown as Json,
    level: data.player.level,
    current_xp: data.player.currentXp,
    next_level_xp: data.player.nextLevelXp,
    lifecoins: data.player.totalPoints,
    streak: data.player.streak,
    equipped: data.avatar.equipped as unknown as Json,
    owned_items: data.ownedItems as unknown as Json,
    owned_themes: data.ownedThemes as unknown as Json,
    theme_id: data.themeId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
