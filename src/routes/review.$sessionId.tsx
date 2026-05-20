import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Trash2, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { awardFocusSession, awardTodoComplete } from "@/lib/gamification";

export const Route = createFileRoute("/review/$sessionId")({
  head: () => ({ meta: [{ title: "Session review — FocusFlow" }] }),
  component: ReviewPage,
});

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function ReviewPage() {
  const { sessionId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<{
    task_title: string;
    duration_seconds: number;
    todo_id: string | null;
    notes: string | null;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [askComplete, setAskComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("task_title, duration_seconds, todo_id, notes")
        .eq("id", sessionId)
        .single();
      if (error || !data) {
        toast.error("Session not found");
        navigate({ to: "/app" });
        return;
      }
      setSession(data);
      setNotes(data.notes || "");
    })();
  }, [sessionId, navigate]);

  const finalize = async (completeTask: boolean) => {
    if (!session) return;
    setBusy(true);
    const { error } = await supabase
      .from("study_sessions")
      .update({ saved: true, notes: notes.trim() || null })
      .eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    if (completeTask && session.todo_id) {
      await supabase
        .from("todos")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", session.todo_id);
    }
    toast.success("Session saved");
    navigate({ to: "/history" });
  };

  const discard = async () => {
    setBusy(true);
    const { error } = await supabase.from("study_sessions").delete().eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    toast("Session discarded");
    navigate({ to: "/app" });
  };

  const handleSaveClick = () => {
    if (session?.todo_id) setAskComplete(true);
    else finalize(false);
  };

  if (!session)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );

  return (
    <main className="bg-radial-glow min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md">
        <Card className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Session complete</h1>
          <p className="mt-2 text-sm text-muted-foreground">{session.task_title}</p>

          <div className="mt-8 rounded-xl bg-muted p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total focus time
            </p>
            <p className="mt-1 font-mono text-4xl font-light tabular-nums">
              {fmt(session.duration_seconds)}
            </p>
          </div>

          <div className="mt-6 text-left">
            <label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? Any insights or next steps..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <Button onClick={handleSaveClick} disabled={busy} size="lg" className="gap-2">
              <Save className="h-4 w-4" /> Save to history
            </Button>
            <Button
              onClick={discard}
              disabled={busy}
              variant="ghost"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Discard
            </Button>
          </div>
        </Card>
      </div>

      <AlertDialog open={askComplete} onOpenChange={setAskComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark task complete?</AlertDialogTitle>
            <AlertDialogDescription>
              Finished "{session.task_title}"? We'll mark it done in your task list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => finalize(false)}>Keep open</AlertDialogCancel>
            <AlertDialogAction onClick={() => finalize(true)}>Mark complete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
