import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/focus/$sessionId")({
  head: () => ({ meta: [{ title: "Focus — FocusFlow" }] }),
  component: FocusPage,
});

function formatHMS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FocusPage() {
  const { sessionId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [taskTitle, setTaskTitle] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [subjectColor, setSubjectColor] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("task_title, started_at, ended_at, subjects(name, color_code)")
        .eq("id", sessionId)
        .single();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Session not found");
        navigate({ to: "/app" });
        return;
      }
      if (data.ended_at) {
        navigate({ to: "/review/$sessionId", params: { sessionId } });
        return;
      }
      setTaskTitle(data.task_title);
      setSubjectName(data.subjects?.name ?? null);
      setSubjectColor(data.subjects?.color_code ?? null);
      setStartedAt(new Date(data.started_at).getTime());
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, navigate]);

  useEffect(() => {
    if (startedAt == null) return;
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    tickRef.current = setInterval(update, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [startedAt]);

  const endSession = async () => {
    if (!startedAt) return;
    const duration = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const { error } = await supabase
      .from("study_sessions")
      .update({ ended_at: new Date().toISOString(), duration_seconds: duration })
      .eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/review/$sessionId", params: { sessionId } });
  };

  if (!taskTitle) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading focus session…
      </div>
    );
  }

  return (
    <main className="bg-radial-glow grid min-h-screen grid-rows-[1fr_auto] px-6">
      <div className="flex flex-col items-center justify-center gap-12 text-center">
        <div className="flex flex-col items-center gap-3">
          {subjectName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: subjectColor ?? "var(--primary)" }}
              />
              {subjectName}
            </span>
          )}
          <p className="max-w-2xl text-balance text-xl text-muted-foreground sm:text-2xl">
            {taskTitle}
          </p>
        </div>
        <div className="font-mono text-7xl font-light tracking-tight tabular-nums sm:text-9xl timer-tick">
          {formatHMS(elapsed)}
        </div>
      </div>
      <div className="flex justify-center pb-16">
        <Button
          onClick={endSession}
          size="lg"
          variant="secondary"
          className="h-14 gap-2 rounded-full px-8 text-base"
        >
          <Square className="h-4 w-4 fill-current" />
          End session
        </Button>
      </div>
    </main>
  );
}
