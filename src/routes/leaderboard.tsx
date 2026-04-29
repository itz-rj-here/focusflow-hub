import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — FocusFlow" },
      { name: "description", content: "Top focus hours across the FocusFlow community." },
    ],
  }),
  component: LeaderboardPage,
});

type Range = "day" | "week" | "all";

function fmtHours(secs: number) {
  const h = secs / 3600;
  if (h >= 10) return h.toFixed(0) + "h";
  return h.toFixed(1) + "h";
}

function LeaderboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>("week");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["leaderboard", range],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", { range_kind: range });
      if (error) throw error;
      return data;
    },
  });

  return (
    <main className="bg-radial-glow min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground"><Timer className="h-3.5 w-3.5" /></div>
          <span className="text-sm font-semibold tracking-tight">FocusFlow</span>
        </Link>
        {user ? (
          <Link to="/app"><Button variant="secondary" size="sm">Open app</Button></Link>
        ) : (
          <Link to="/login"><Button variant="secondary" size="sm">Sign in</Button></Link>
        )}
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-16">
        <div className="mb-6 text-center">
          <Trophy className="mx-auto h-7 w-7 text-primary" />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Total focus time across public profiles.</p>
        </div>

        <div className="mb-4 flex justify-center">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This week</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No public study time yet for this range.</div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r, i) => {
                const isMe = user?.id === r.user_id;
                const rank = i + 1;
                const medal = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-zinc-300" : rank === 3 ? "text-amber-700" : "text-muted-foreground";
                return (
                  <li key={r.user_id} className={`flex items-center gap-4 px-4 py-3 ${isMe ? "bg-accent/40" : ""}`}>
                    <span className={`w-8 text-center font-mono text-sm ${medal}`}>{rank}</span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={r.avatar_url ?? undefined} alt="" />
                      <AvatarFallback>{r.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm font-medium">
                      {r.username}{isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </span>
                    <span className="font-mono text-sm tabular-nums">{fmtHours(Number(r.total_seconds))}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Want to be listed? Sign in and keep your profile public in <Link to="/settings" className="underline">Settings</Link>.
        </p>
      </div>
    </main>
  );
}
