import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { levelProgress } from "@/lib/gamification";
import { Flame, Coins } from "lucide-react";

type Stats = {
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  longest_streak: number;
};

export function StatsWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("user_stats")
        .select("xp, level, coins, current_streak, longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setStats({
          xp: Number(data.xp),
          level: data.level,
          coins: data.coins,
          current_streak: data.current_streak,
          longest_streak: data.longest_streak,
        });
      }
    };

    load();

    const onChange = () => load();
    window.addEventListener("user-stats-changed", onChange);

    // Realtime updates (e.g. when sessions complete elsewhere)
    const channel = supabase
      .channel(`user_stats:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_stats", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.removeEventListener("user-stats-changed", onChange);
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user || !stats) return null;

  const prog = levelProgress(stats.xp, stats.level);

  return (
    <div className="hidden items-center gap-3 md:flex">
      {/* Level + XP bar */}
      <div className="flex items-center gap-2" title={`${stats.xp.toLocaleString()} XP · next at ${prog.next.toLocaleString()}`}>
        <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {stats.level}
        </div>
        <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all"
            style={{ width: `${prog.pct}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div
        className="flex items-center gap-1 text-sm"
        title={`Current streak · longest ${stats.longest_streak}`}
      >
        <Flame className={`h-4 w-4 ${stats.current_streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
        <span className="font-medium tabular-nums">{stats.current_streak}</span>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1 text-sm" title="Coins">
        <Coins className="h-4 w-4 text-yellow-500" />
        <span className="font-medium tabular-nums">{stats.coins}</span>
      </div>
    </div>
  );
}
