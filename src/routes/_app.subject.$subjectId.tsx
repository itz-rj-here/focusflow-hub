import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Play, ArrowLeft, ListTodo } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_app/subject/$subjectId")({
  head: () => ({ meta: [{ title: "Subject Analytics — FocusFlow" }] }),
  component: SubjectAnalyticsPage,
});

type Subject = Tables<"subjects">;

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function SubjectAnalyticsPage() {
  const { subjectId } = Route.useParams();
  const { user } = useAuth();
  const userId = user!.id;
  const navigate = useNavigate();

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();
      if (error) throw error;
      return data as Subject;
    },
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", userId, "subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("id, task_title, duration_seconds, started_at, ended_at")
        .eq("subject_id", subjectId)
        .eq("saved", true)
        .order("ended_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { totalSecs, todaySecs, weekSecs, dailyChart, weeklyChart } = useMemo(() => {
    let total = 0,
      today = 0,
      week = 0;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const dow = now.getDay();
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - ((dow + 6) % 7));

    const dayBuckets = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayBuckets.set(d.toISOString().slice(0, 10), 0);
    }
    const weekBuckets = new Map<string, number>();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const wDow = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((wDow + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      weekBuckets.set(monday.toISOString().slice(0, 10), 0);
    }

    sessions.forEach((s) => {
      total += s.duration_seconds;
      if (!s.ended_at) return;
      const ended = new Date(s.ended_at);
      if (ended >= startOfToday) today += s.duration_seconds;
      if (ended >= startOfWeek) week += s.duration_seconds;
      const dKey = ended.toISOString().slice(0, 10);
      if (dayBuckets.has(dKey))
        dayBuckets.set(dKey, (dayBuckets.get(dKey) || 0) + s.duration_seconds);
      const wDow = ended.getDay();
      const monday = new Date(ended);
      monday.setDate(ended.getDate() - ((wDow + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const wKey = monday.toISOString().slice(0, 10);
      if (weekBuckets.has(wKey))
        weekBuckets.set(wKey, (weekBuckets.get(wKey) || 0) + s.duration_seconds);
    });

    return {
      totalSecs: total,
      todaySecs: today,
      weekSecs: week,
      dailyChart: Array.from(dayBuckets.entries()).map(([k, v]) => ({
        label: new Date(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        minutes: Math.round(v / 60),
      })),
      weeklyChart: Array.from(weekBuckets.entries()).map(([k, v]) => ({
        label:
          "Wk " + new Date(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        minutes: Math.round(v / 60),
      })),
    };
  }, [sessions]);

  const startSession = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          subject_id: subjectId,
          todo_id: null,
          task_title: `${subject?.name ?? "Subject"} — quick focus`,
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (sessionId) => navigate({ to: "/focus/$sessionId", params: { sessionId } }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/app"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All subjects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {subject && (
            <span
              className="grid h-10 w-10 place-items-center rounded-lg text-base font-semibold text-white"
              style={{ backgroundColor: subject.color_code }}
            >
              {subject.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{subject?.name ?? "Subject"}</h1>
            <p className="text-sm text-muted-foreground">
              Analytics & focus history for this subject.
            </p>
          </div>
          <Link to="/tasks">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ListTodo className="h-4 w-4" /> Manage tasks
            </Button>
          </Link>
          <Button
            onClick={() => startSession.mutate()}
            disabled={startSession.isPending}
            className="gap-1.5"
          >
            <Play className="h-4 w-4" /> Quick start
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="mt-1 font-mono text-2xl">{fmt(todaySecs)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">This week</p>
          <p className="mt-1 font-mono text-2xl">{fmt(weekSecs)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">All time</p>
          <p className="mt-1 font-mono text-2xl">{fmt(totalSecs)}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 font-medium">Daily focus (14d)</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={dailyChart}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                />
                <Bar
                  dataKey="minutes"
                  fill={subject?.color_code ?? "var(--primary)"}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 font-medium">Weekly focus (8w)</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={weeklyChart}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                />
                <Bar
                  dataKey="minutes"
                  fill={subject?.color_code ?? "var(--primary)"}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-medium">Recent sessions</h2>
        </div>
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
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No sessions for this subject yet.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.task_title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.ended_at ? new Date(s.ended_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">{fmt(s.duration_seconds)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
