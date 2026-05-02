import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "History — FocusFlow" }] }),
  component: HistoryPage,
});

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function HistoryPage() {
  const { user } = useAuth();
  const userId = user!.id;
  const [bucket, setBucket] = useState<"day" | "week">("day");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("id, task_title, duration_seconds, started_at, ended_at, subject_id, subjects(name, color_code)")
        .eq("saved", true)
        .order("ended_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    const now = new Date();
    if (bucket === "day") {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, 0);
      }
      sessions.forEach((s) => {
        if (!s.ended_at) return;
        const key = new Date(s.ended_at).toISOString().slice(0, 10);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + s.duration_seconds);
      });
      return Array.from(buckets.entries()).map(([key, v]) => ({
        label: new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        minutes: Math.round(v / 60),
      }));
    } else {
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i * 7);
        const dow = d.getDay(); const monday = new Date(d); monday.setDate(d.getDate() - ((dow + 6) % 7));
        const key = monday.toISOString().slice(0, 10);
        if (!buckets.has(key)) buckets.set(key, 0);
      }
      sessions.forEach((s) => {
        if (!s.ended_at) return;
        const d = new Date(s.ended_at);
        const dow = d.getDay(); const monday = new Date(d); monday.setDate(d.getDate() - ((dow + 6) % 7));
        const key = monday.toISOString().slice(0, 10);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + s.duration_seconds);
      });
      return Array.from(buckets.entries()).map(([key, v]) => ({
        label: "Wk " + new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        minutes: Math.round(v / 60),
      }));
    }
  }, [sessions, bucket]);

  const totalSecs = sessions.reduce((a, s) => a + s.duration_seconds, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">All your saved focus sessions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total saved time</p><p className="mt-1 font-mono text-2xl">{fmt(totalSecs)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Sessions</p><p className="mt-1 font-mono text-2xl">{sessions.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Avg session</p><p className="mt-1 font-mono text-2xl">{sessions.length ? fmt(Math.round(totalSecs / sessions.length)) : "—"}</p></Card>
      </div>

      <Card className="p-4">
        <Tabs value={bucket} onValueChange={(v) => setBucket(v as "day" | "week")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Focus minutes</h2>
            <TabsList>
              <TabsTrigger value="day">Daily (14d)</TabsTrigger>
              <TabsTrigger value="week">Weekly (8w)</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={bucket} className="mt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                  />
                  <Bar dataKey="minutes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : sessions.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No sessions yet. Start one from your tasks.</TableCell></TableRow>
            ) : sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.task_title}</TableCell>
                <TableCell className="text-muted-foreground">{s.ended_at ? new Date(s.ended_at).toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right font-mono">{fmt(s.duration_seconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
