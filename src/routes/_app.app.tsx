import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Play, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_app/app")({
  head: () => ({ meta: [{ title: "Tasks — FocusFlow" }] }),
  component: TasksPage,
});

type Todo = Tables<"todos">;

function TasksPage() {
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos", userId],
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

  const addTodo = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from("todos").insert({ user_id: userId, title });
      if (error) throw error;
    },
    onSuccess: () => { setNewTitle(""); qc.invalidateQueries({ queryKey: ["todos", userId] }); },
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", userId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", userId] }),
  });

  const rename = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from("todos").update({ title }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", userId] }),
  });

  const startSession = useMutation({
    mutationFn: async (todo: Todo) => {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
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
        <h1 className="text-2xl font-semibold tracking-tight">Today's tasks</h1>
        <p className="text-sm text-muted-foreground">Add what you want to work on, then start a focus session.</p>
      </div>

      <Card className="p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) addTodo.mutate(newTitle.trim()); }}
          className="flex items-center gap-2"
        >
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you want to focus on?"
            className="h-11"
            autoFocus
          />
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
          <p className="text-sm text-muted-foreground">No tasks yet. Add your first one above.</p>
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
