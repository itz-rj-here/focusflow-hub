import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AwardResult = {
  new_xp: number;
  new_level: number;
  new_coins: number;
  leveled_up: boolean;
  awarded: boolean;
};

/**
 * Award XP and coins to the current user.
 * dedupe_key prevents duplicate awards (e.g. one daily bonus per day).
 */
export async function awardXp(args: {
  action: string;
  xp: number;
  coins: number;
  dedupeKey?: string;
  metadata?: Record<string, unknown>;
  silent?: boolean;
}): Promise<AwardResult | null> {
  const { data, error } = await supabase.rpc("award_xp", {
    _action_key: args.action,
    _xp: args.xp,
    _coins: args.coins,
    _dedupe_key: args.dedupeKey,
    _metadata: (args.metadata ?? {}) as never,
  });
  if (error) {
    console.error("[awardXp]", error);
    return null;
  }
  const row = Array.isArray(data) ? (data[0] as AwardResult | undefined) : (data as AwardResult | undefined);
  if (!row || !row.awarded) return row ?? null;

  if (!args.silent) {
    toast.success(`+${args.xp} XP${args.coins ? ` · +${args.coins} 🪙` : ""}`);
  }
  if (row.leveled_up) {
    toast.success(`Level up! You're now level ${row.new_level} 🎉`, { duration: 5000 });
  }
  // Notify sidebar to refresh stats
  window.dispatchEvent(new CustomEvent("user-stats-changed"));
  return row;
}

/**
 * Advance the user's daily activity streak. Idempotent per day.
 * Returns updated streak info; awards a bonus on first activity of day.
 */
export async function tickDailyStreak(): Promise<void> {
  const { error } = await supabase.rpc("tick_daily_streak");
  if (error) {
    console.error("[tickDailyStreak]", error);
    return;
  }
  window.dispatchEvent(new CustomEvent("user-stats-changed"));
}

/** XP required to reach the given level (cumulative). */
export function xpForLevel(level: number): number {
  return Math.round((100 * level * (level + 1)) / 2);
}

/** Progress info inside the current level. */
export function levelProgress(xp: number, level: number) {
  const floor = xpForLevel(level - 1);
  const ceil = xpForLevel(level);
  const inLevel = Math.max(0, xp - floor);
  const span = Math.max(1, ceil - floor);
  return { inLevel, span, pct: Math.min(100, (inLevel / span) * 100), next: ceil };
}

/** Convenience: award focus session XP (1 XP per minute, 0.2 coins per minute). */
export async function awardFocusSession(sessionId: string, durationSeconds: number) {
  if (durationSeconds < 60) return;
  const minutes = Math.min(360, Math.floor(durationSeconds / 60));
  const xp = minutes;
  const coins = Math.floor(minutes * 0.2);
  await awardXp({
    action: "focus_session",
    xp,
    coins,
    dedupeKey: `focus_session:${sessionId}`,
    metadata: { minutes },
  });
  // First focus of day bonus
  const today = new Date().toISOString().slice(0, 10);
  await awardXp({
    action: "first_focus_of_day",
    xp: 5,
    coins: 0,
    dedupeKey: `first_focus:${today}`,
    silent: true,
  });
  await tickDailyStreak();
}

/** Convenience: award todo completion. */
export async function awardTodoComplete(todoId: string) {
  await awardXp({
    action: "todo_complete",
    xp: 10,
    coins: 2,
    dedupeKey: `todo_complete:${todoId}`,
  });
  await tickDailyStreak();
}
