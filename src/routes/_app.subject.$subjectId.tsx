import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Play, Plus, Trash2, Pencil, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_app/subject/$subjectId")({
  head: () => ({ meta: [{ title: "Subject — FocusFlow" }] }),
  component: SubjectPage,
});

type Todo = Tables<"todos">;
type Subject = Tables<"subjects">;

function SubjectPage() {
  const { subjectId } = Route.useParams();
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState<string>(subjectId);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusTodoId, setFocusTodoId] = useState<string>("none");

  useEffect(() => { setAssignSubjectId(subjectId); }, [subjectId]);

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").eq("id", subjectId).single();
      if (error) throw error;
      return data as Subject;
    },
  });

  const { data: allSubjects = [] } = useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos", userId, "subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos").select("*")
        .eq("subject_id", subjectId)
        .order("completed", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Todo[];
    },
  });

  const addTodo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("todos").insert({
        user_id: userId, title: newTitle.trim(), subject_id: assignSubjectId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["subject-stats", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (t: Todo) => {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["subject-stats", userId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["subject-stats", userId] });
    },
  });

  const rename = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from("todos").update({ title }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const startSession = useMutation({
    mutationFn: async (todoId: string | null) => {
      const todo = todoId ? todos.find((t) => t.id === todoId) : null;
      const taskTitle = todo ? todo.title : `${subject?.name ?? "Subject"} — general focus`;
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          subject_id: subjectId,
          todo_id: todoId,
          task_title: taskTitle,
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

  const startGeneral = () => {
    setFocusTodoId("none");
    setFocusOpen(true);
  };

  const confirmStart = () => {
    setFocusOpen(false);
    startSession.mutate(focusTodoId === "none" ? null : focusTodoId);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All subjects
        </Link>
        <div className="mt-2 flex items-center gap-3">
          {subject && (
            <span
              className="grid h-10 w-10 place-items-center rounded-lg text-base font-semibold text-white"
              style={{ backgroundColor: subject.color_code }}
            >
              {subject.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{subject?.name ?? "Subject"}</h1>
            <p className="text-sm text-muted-foreground">
              {todos.filter((t) => !t.completed).length} open ·{" "}
              {todos.filter((t) => t.completed).length} done
            </p>
          </div>
          <Button onClick={startGeneral} className="ml-auto gap-1.5" disabled={startSession.isPending}>
            <Play className="h-4 w-4" /> Start focus
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) addTodo.mutate(); }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a task…"
            className="h-11 flex-1"
          />
          <Select value={assignSubjectId} onValueChange={setAssignSubjectId}>
            <SelectTrigger className="h-11 sm:w-44">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {allSubjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color_code }} />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="lg" disabled={!newTitle.trim() || addTodo.isPending}>
            <Plus className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Add</span>
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : todos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No tasks for this subject yet.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {todos.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              onToggle={() => toggle.mutate(t)}
              onDelete={() => remove.mutate(t.id)}
              onRename={(title) => rename.mutate({ id: t.id, title })}
              onStart={() => startSession.mutate(t.id)}
              starting={startSession.isPending}
            />
          ))}
        </ul>
      )}

      <Dialog open={focusOpen} onOpenChange={setFocusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start focus on {subject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Attach a specific task? (optional)</label>
            <Select value={focusTodoId} onValueChange={setFocusTodoId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— General {subject?.name ?? "subject"} session —</SelectItem>
                {todos.filter((t) => !t.completed).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFocusOpen(false)}>Cancel</Button>
            <Button onClick={confirmStart} disabled={startSession.isPending}>
              <Play className="mr-1.5 h-4 w-4" /> Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TodoRow({
  todo, onToggle, onDelete, onRename, onStart, starting,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onStart: () => void;
  starting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  useEffect(() => setDraft(todo.title), [todo.title]);

  return (
    <li>
      <Card className={`flex items-center gap-3 p-3 ${todo.completed ? "opacity-60" : ""}`}>
        <Checkbox checked={todo.completed} onCheckedChange={onToggle} className="h-5 w-5" />
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} className="h-9" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") { onRename(draft.trim() || todo.title); setEditing(false); } if (e.key === "Escape") setEditing(false); }} />
            <Button size="icon" variant="ghost" onClick={() => { onRename(draft.trim() || todo.title); setEditing(false); }}><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <span className={`flex-1 text-sm ${todo.completed ? "line-through" : ""}`}>{todo.title}</span>
        )}

        {!editing && !todo.completed && (
          <Button onClick={onStart} disabled={starting} size="sm" className="gap-1">
            <Play className="h-3.5 w-3.5" /> Focus
          </Button>
        )}
        {!editing && (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
      </Card>
    </li>
  );
}
