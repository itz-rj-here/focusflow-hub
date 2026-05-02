import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, FolderOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["subject-stats", userId],
    queryFn: async () => {
      const [todosRes, sessionsRes] = await Promise.all([
        supabase.from("todos").select("subject_id, completed"),
        supabase.from("study_sessions").select("subject_id, duration_seconds").eq("saved", true),
      ]);
      if (todosRes.error) throw todosRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      const out: Record<string, { open: number; secs: number; total: number }> = {};
      todosRes.data.forEach((t) => {
        if (!t.subject_id) return;
        out[t.subject_id] ??= { open: 0, secs: 0, total: 0 };
        out[t.subject_id].total += 1;
        if (!t.completed) out[t.subject_id].open += 1;
      });
      sessionsRes.data.forEach((s) => {
        out[s.subject_id] ??= { open: 0, secs: 0, total: 0 };
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
          <p className="text-sm text-muted-foreground">Pick a subject to view analytics or start focusing.</p>
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
                <ColorPicker value={color} onChange={setColor} />
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
            const st = stats[s.id] ?? { open: 0, secs: 0, total: 0 };
            const hours = Math.floor(st.secs / 3600);
            const mins = Math.floor((st.secs % 3600) / 60);
            return (
              <div key={s.id} className="relative">
                <Link
                  to="/subject/$subjectId"
                  params={{ subjectId: s.id }}
                  className="block"
                >
                  <Card className="relative overflow-hidden p-5 transition hover:border-primary/40 hover:shadow-lg">
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: s.color_code }}
                    />
                    <div className="flex items-center gap-3 pr-8">
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
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Manage ${s.name}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onSelect={() => setEditing(s)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setDeleting(s)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditSubjectDialog subject={editing} onClose={() => setEditing(null)} />
      <DeleteSubjectDialog
        subject={deleting}
        subjects={subjects}
        stats={stats}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((c) => (
        <button
          type="button"
          key={c}
          onClick={() => onChange(c)}
          aria-label={`Pick ${c}`}
          className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition ${value === c ? "ring-foreground" : "ring-transparent"}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function EditSubjectDialog({ subject, onClose }: { subject: Subject | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(subject?.name ?? "");
  const [color, setColor] = useState(subject?.color_code ?? PALETTE[0]);

  // Sync when subject changes
  useState(() => {});
  if (subject && name === "" && color === PALETTE[0]) {
    // first init via effect-less guard
  }

  const update = useMutation({
    mutationFn: async () => {
      if (!subject) return;
      const { error } = await supabase
        .from("subjects")
        .update({ name: name.trim(), color_code: color })
        .eq("id", subject.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["subject"] });
      toast.success("Subject updated");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog
      open={!!subject}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (subject) { setName(subject.name); setColor(subject.color_code); }
      }}
    >
      <DialogContent>
        <DialogHeader><DialogTitle>Edit subject</DialogTitle></DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) update.mutate(); }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || update.isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSubjectDialog({
  subject, subjects, stats, onClose,
}: {
  subject: Subject | null;
  subjects: Subject[];
  stats: Record<string, { open: number; secs: number; total: number }>;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const [mode, setMode] = useState<"reassign" | "cascade">("reassign");

  // Default reassign target: first General-named subject (excluding self), else first other
  const otherSubjects = subjects.filter((s) => s.id !== subject?.id);
  const defaultTarget =
    otherSubjects.find((s) => s.name.toLowerCase() === "general")?.id ??
    otherSubjects[0]?.id ?? "";
  const [targetId, setTargetId] = useState<string>(defaultTarget);

  const st = subject ? stats[subject.id] ?? { open: 0, secs: 0, total: 0 } : { open: 0, secs: 0, total: 0 };
  const taskCount = st.total;
  const hasOthers = otherSubjects.length > 0;

  const submit = useMutation({
    mutationFn: async () => {
      if (!subject) return;
      if (mode === "reassign") {
        if (!targetId) throw new Error("Pick a subject to reassign to");
        // Reassign todos and sessions
        const { error: e1 } = await supabase
          .from("todos").update({ subject_id: targetId })
          .eq("subject_id", subject.id).eq("user_id", userId);
        if (e1) throw e1;
        const { error: e2 } = await supabase
          .from("study_sessions").update({ subject_id: targetId })
          .eq("subject_id", subject.id).eq("user_id", userId);
        if (e2) throw e2;
      } else {
        // Cascade delete
        const { error: e1 } = await supabase
          .from("todos").delete()
          .eq("subject_id", subject.id).eq("user_id", userId);
        if (e1) throw e1;
        const { error: e2 } = await supabase
          .from("study_sessions").delete()
          .eq("subject_id", subject.id).eq("user_id", userId);
        if (e2) throw e2;
      }
      const { error: e3 } = await supabase
        .from("subjects").delete().eq("id", subject.id).eq("user_id", userId);
      if (e3) throw e3;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["subject-stats"] });
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Subject deleted");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog
      open={!!subject}
      onOpenChange={(o) => {
        if (!o) onClose();
        else { setMode(hasOthers ? "reassign" : "cascade"); setTargetId(defaultTarget); }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{subject?.name}”?</DialogTitle>
          <DialogDescription>
            This subject has {taskCount} {taskCount === 1 ? "task" : "tasks"} and{" "}
            {Math.floor(st.secs / 60)} minutes of focus history. Choose what to do with them.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as "reassign" | "cascade")} className="space-y-3">
          <label className={`flex items-start gap-3 rounded-md border border-border p-3 ${!hasOthers ? "opacity-50" : "cursor-pointer hover:bg-accent/30"}`}>
            <RadioGroupItem value="reassign" disabled={!hasOthers} className="mt-0.5" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium">Reassign tasks & sessions</p>
                <p className="text-xs text-muted-foreground">Move everything to another subject and keep your history.</p>
              </div>
              {mode === "reassign" && hasOthers && (
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                  <SelectContent>
                    {otherSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color_code }} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-accent/30">
            <RadioGroupItem value="cascade" className="mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Delete everything</p>
              <p className="text-xs text-muted-foreground">Permanently remove all tasks and focus sessions for this subject.</p>
            </div>
          </label>
        </RadioGroup>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => submit.mutate()}
            disabled={submit.isPending || (mode === "reassign" && !targetId)}
          >
            {mode === "reassign" ? "Reassign & delete subject" : "Delete everything"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
