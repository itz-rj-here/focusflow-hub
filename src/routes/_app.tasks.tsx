import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Plus, Trash2, Pencil, Check, X, Flag, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { awardTodoComplete } from "@/lib/gamification";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — FocusFlow" }] }),
  component: TasksPage,
});

type Todo = Tables<"todos">;
type Subject = Tables<"subjects">;

const PRIORITY_LABELS = {
  1: { label: "Low", color: "text-green-500" },
  2: { label: "Medium", color: "text-yellow-500" },
  3: { label: "High", color: "text-red-500" },
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  const today = new Date(new Date().toDateString());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function TasksPage() {
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState<string>("");
  const [newPriority, setNewPriority] = useState<number>(2);
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "due_date" | "created_at">("created_at");

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Subject[];
    },
  });

  useEffect(() => {
    if (!newSubjectId && subjects.length > 0) setNewSubjectId(subjects[0].id);
  }, [subjects, newSubjectId]);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos", userId, "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("completed", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Todo[];
    },
  });

  const subjectMap = useMemo(() => {
    const m: Record<string, Subject> = {};
    subjects.forEach((s) => (m[s.id] = s));
    return m;
  }, [subjects]);

  const filtered = useMemo(() => {
    let result = todos.filter((t) => {
      if (filterSubject !== "all" && t.subject_id !== filterSubject) return false;
      if (!showCompleted && t.completed) return false;
      return true;
    });

    // Sort by priority (high first) or due date (soonest first)
    if (sortBy === "priority") {
      result = [...result].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    } else if (sortBy === "due_date") {
      result = [...result].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    }

    return result;
  }, [todos, filterSubject, showCompleted, sortBy]);

  const addTodo = useMutation({
    mutationFn: async () => {
      if (!newSubjectId) throw new Error("Pick a subject first");
      const { error } = await supabase.from("todos").insert({
        user_id: userId,
        title: newTitle.trim(),
        subject_id: newSubjectId,
        priority: newPriority,
        due_date: newDueDate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      setNewPriority(2);
      setNewDueDate("");
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["subject-stats", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (t: Todo) => {
      const becomingComplete = !t.completed;
      const { error } = await supabase
        .from("todos")
        .update({
          completed: becomingComplete,
          completed_at: becomingComplete ? new Date().toISOString() : null,
        })
        .eq("id", t.id);
      if (error) throw error;
      if (becomingComplete) await awardTodoComplete(t.id);
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

  const reassign = useMutation({
    mutationFn: async ({ id, subject_id }: { id: string; subject_id: string }) => {
      const { error } = await supabase.from("todos").update({ subject_id }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["subject-stats", userId] });
    },
  });

  const updatePriority = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: number }) => {
      const { error } = await supabase.from("todos").update({ priority }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateDueDate = useMutation({
    mutationFn: async ({ id, due_date }: { id: string; due_date: string | null }) => {
      const { error } = await supabase.from("todos").update({ due_date }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const startSession = useMutation({
    mutationFn: async (todo: Todo) => {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          subject_id: todo.subject_id!,
          todo_id: todo.id,
          task_title: todo.title,
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
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">All your to-dos across every subject.</p>
      </div>

      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) addTodo.mutate();
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task…"
              className="h-11 flex-1"
            />
            <Select value={newSubjectId} onValueChange={setNewSubjectId}>
              <SelectTrigger className="h-11 sm:w-44">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.color_code }}
                      />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(newPriority)} onValueChange={(v) => setNewPriority(Number(v))}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-green-500" />
                    Low
                  </span>
                </SelectItem>
                <SelectItem value="2">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-yellow-500" />
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value="3">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-red-500" />
                    High
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="h-9 w-40"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!newTitle.trim() || !newSubjectId || addTodo.isPending}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Add</span>
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="h-9 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color_code }}
                  />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Newest first</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="due_date">Due date</SelectItem>
          </SelectContent>
        </Select>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={showCompleted} onCheckedChange={(v) => setShowCompleted(!!v)} />
          Show completed
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No tasks to show.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              subject={t.subject_id ? subjectMap[t.subject_id] : undefined}
              subjects={subjects}
              onToggle={() => toggle.mutate(t)}
              onDelete={() => remove.mutate(t.id)}
              onRename={(title) => rename.mutate({ id: t.id, title })}
              onReassign={(sid) => reassign.mutate({ id: t.id, subject_id: sid })}
              onUpdatePriority={(p) => updatePriority.mutate({ id: t.id, priority: p })}
              onUpdateDueDate={(d) => updateDueDate.mutate({ id: t.id, due_date: d })}
              onStart={() => startSession.mutate(t)}
              starting={startSession.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TodoRow({
  todo,
  subject,
  subjects,
  onToggle,
  onDelete,
  onRename,
  onReassign,
  onUpdatePriority,
  onUpdateDueDate,
  onStart,
  starting,
}: {
  todo: Todo;
  subject?: Subject;
  subjects: Subject[];
  onToggle: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onReassign: (subjectId: string) => void;
  onUpdatePriority: (priority: number) => void;
  onUpdateDueDate: (due_date: string | null) => void;
  onStart: () => void;
  starting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  useEffect(() => setDraft(todo.title), [todo.title]);

  const priorityConfig =
    PRIORITY_LABELS[todo.priority as keyof typeof PRIORITY_LABELS] || PRIORITY_LABELS[2];
  const overdue = isOverdue(todo.due_date);

  return (
    <li>
      <Card
        className={`flex flex-wrap items-center gap-3 p-3 ${todo.completed ? "opacity-60" : ""}`}
      >
        <Checkbox checked={todo.completed} onCheckedChange={onToggle} className="h-5 w-5" />
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-9"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(draft.trim() || todo.title);
                  setEditing(false);
                }
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                onRename(draft.trim() || todo.title);
                setEditing(false);
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <span className={`text-sm ${todo.completed ? "line-through" : ""}`}>{todo.title}</span>
            {/* Priority badge */}
            <Select
              value={String(todo.priority ?? 2)}
              onValueChange={(v) => onUpdatePriority(Number(v))}
            >
              <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0">
                <Flag className={`h-3.5 w-3.5 ${priorityConfig.color}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-green-500" /> Low
                  </span>
                </SelectItem>
                <SelectItem value="2">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-yellow-500" /> Medium
                  </span>
                </SelectItem>
                <SelectItem value="3">
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-red-500" /> High
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Due date badge */}
            {todo.due_date ? (
              <button
                onClick={() => setShowDueDatePicker(true)}
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs ${
                  overdue && !todo.completed
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {formatDueDate(todo.due_date)}
              </button>
            ) : (
              <button
                onClick={() => setShowDueDatePicker(true)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
              >
                <Calendar className="h-3 w-3" />
                Set due date
              </button>
            )}
            {showDueDatePicker && (
              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  value={todo.due_date ?? ""}
                  onChange={(e) => {
                    onUpdateDueDate(e.target.value || null);
                    setShowDueDatePicker(false);
                  }}
                  className="h-6 w-32 text-xs"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    onUpdateDueDate(null);
                    setShowDueDatePicker(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {!editing && (
          <Select value={todo.subject_id ?? ""} onValueChange={onReassign}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue>
                {subject ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: subject.color_code }}
                    />
                    {subject.name}
                  </span>
                ) : (
                  "—"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color_code }}
                    />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {!editing && !todo.completed && (
          <Button onClick={onStart} disabled={starting} size="sm" className="gap-1">
            <Play className="h-3.5 w-3.5" /> Focus
          </Button>
        )}
        {!editing && (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </Card>
    </li>
  );
}
