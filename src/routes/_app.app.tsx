import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_app/app")({
  head: () => ({ meta: [{ title: "Subjects — FocusFlow" }] }),
  component: HomePage,
});

type Subject = Tables<"subjects">;

const PALETTE = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#8b5cf6", "#ef4444", "#84cc16",
];

function HomePage() {
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Subject[];
    },
  });

  // Aggregate counts: tasks open per subject + total focus seconds
  const { data: stats = {} } = useQuery({
    queryKey: ["subject-stats", userId],
    queryFn: async () => {
      const [todosRes, sessionsRes] = await Promise.all([
        supabase.from("todos").select("subject_id, completed"),
        supabase.from("study_sessions").select("subject_id, duration_seconds").eq("saved", true),
      ]);
      if (todosRes.error) throw todosRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      const out: Record<string, { open: number; secs: number }> = {};
      todosRes.data.forEach((t) => {
        if (!t.subject_id) return;
        out[t.subject_id] ??= { open: 0, secs: 0 };
        if (!t.completed) out[t.subject_id].open += 1;
      });
      sessionsRes.data.forEach((s) => {
        out[s.subject_id] ??= { open: 0, secs: 0 };
        out[s.subject_id].secs += s.duration_seconds;
      });
      return out;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("subjects").insert({
        user_id: userId, name: name.trim(), color_code: color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName(""); setColor(PALETTE[0]); setOpen(false);
      qc.invalidateQueries({ queryKey: ["subjects", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground">Pick a subject to view tasks or start focusing.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New subject</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Calculus" autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      aria-label={`Pick ${c}`}
                      className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition ${color === c ? "ring-foreground" : "ring-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!name.trim() || create.isPending}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No subjects yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const st = stats[s.id] ?? { open: 0, secs: 0 };
            const hours = Math.floor(st.secs / 3600);
            const mins = Math.floor((st.secs % 3600) / 60);
            return (
              <Link
                key={s.id}
                to="/subject/$subjectId"
                params={{ subjectId: s.id }}
                className="group"
              >
                <Card className="relative overflow-hidden p-5 transition hover:border-primary/40 hover:shadow-lg">
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: s.color_code }}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-lg text-base font-semibold text-white"
                      style={{ backgroundColor: s.color_code }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {st.open} open {st.open === 1 ? "task" : "tasks"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Focus time</span>
                    <span className="font-mono text-sm tabular-nums">
                      {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
