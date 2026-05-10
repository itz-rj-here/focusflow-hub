import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Square, Pause, Play, Coffee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [totalPausedSeconds, setTotalPausedSeconds] = useState(0);
  const [breakReminderEnabled, setBreakReminderEnabled] = useState(true);
  const [breakIntervalMinutes, setBreakIntervalMinutes] = useState(25);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [lastBreakTime, setLastBreakTime] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from("study_sessions")
        .select(
          "task_title, started_at, ended_at, is_paused, paused_at, total_paused_seconds, subjects(name, color_code)",
        )
        .eq("id", sessionId)
        .single();

      if (cancelled) return;
      if (sessionError || !sessionData) {
        toast.error("Session not found");
        navigate({ to: "/app" });
        return;
      }
      if (sessionData.ended_at) {
        navigate({ to: "/review/$sessionId", params: { sessionId } });
        return;
      }

      setTaskTitle(sessionData.task_title);
      setSubjectName(sessionData.subjects?.name ?? null);
      setSubjectColor(sessionData.subjects?.color_code ?? null);
      setStartedAt(new Date(sessionData.started_at).getTime());
      setIsPaused(sessionData.is_paused ?? false);
      setPausedAt(sessionData.paused_at ? new Date(sessionData.paused_at).getTime() : null);
      setTotalPausedSeconds(sessionData.total_paused_seconds ?? 0);

      // Fetch user break reminder settings
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("break_reminder_enabled, break_reminder_interval_minutes")
          .eq("id", user.id)
          .single();
        if (profile) {
          setBreakReminderEnabled(profile.break_reminder_enabled ?? true);
          setBreakIntervalMinutes(profile.break_reminder_interval_minutes ?? 25);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, navigate, user]);

  useEffect(() => {
    if (startedAt == null) return;
    const update = () => {
      const now = Date.now();
      let elapsedSec = Math.floor((now - startedAt) / 1000);
      // Subtract paused time to get active focus time
      if (isPaused && pausedAt) {
        // Currently paused - subtract time from when pause started until now
        const currentPauseDuration = Math.floor((now - pausedAt) / 1000);
        elapsedSec = Math.max(0, elapsedSec - totalPausedSeconds - currentPauseDuration);
      } else {
        // Not paused - subtract total paused time
        elapsedSec = Math.max(0, elapsedSec - totalPausedSeconds);
      }
      setElapsed(elapsedSec);

      // Check for break reminder
      if (
        breakReminderEnabled &&
        !isPaused &&
        elapsedSec > 0 &&
        elapsedSec % (breakIntervalMinutes * 60) === 0 &&
        elapsedSec !== lastBreakTime &&
        elapsedSec >= breakIntervalMinutes * 60
      ) {
        setLastBreakTime(elapsedSec);
        setShowBreakReminder(true);
      }
    };
    update();
    tickRef.current = setInterval(update, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [startedAt, isPaused, pausedAt, totalPausedSeconds, breakReminderEnabled, breakIntervalMinutes, lastBreakTime]);

  const endSession = async () => {
    if (!startedAt) return;
    // Calculate final duration accounting for pause time
    let finalDuration = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    let finalPausedSec = totalPausedSeconds;
    // If currently paused, add the current pause duration
    if (isPaused && pausedAt) {
      finalPausedSec += Math.floor((Date.now() - pausedAt) / 1000);
    }
    finalDuration = finalDuration - finalPausedSec;

    const { error } = await supabase
      .from("study_sessions")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: finalDuration,
        total_paused_seconds: finalPausedSec,
      })
      .eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/review/$sessionId", params: { sessionId } });
  };

  const togglePause = async () => {
    const now = Date.now();
    let newTotalPaused = totalPausedSeconds;
    let newPausedAt: number | null = null;
    let newIsPaused = !isPaused;

    if (!isPaused) {
      // Pausing - record pause start time
      newPausedAt = now;
    } else {
      // Resuming - calculate how long we were paused
      if (pausedAt) {
        const pauseDuration = Math.floor((now - pausedAt) / 1000);
        newTotalPaused = totalPausedSeconds + pauseDuration;
      }
    }

    setIsPaused(newIsPaused);
    setPausedAt(newPausedAt);
    setTotalPausedSeconds(newTotalPaused);

    // Update database
    const { error } = await supabase
      .from("study_sessions")
      .update({
        is_paused: newIsPaused,
        paused_at: newIsPaused ? new Date().toISOString() : null,
        total_paused_seconds: newTotalPaused,
      })
      .eq("id", sessionId);

    if (error) {
      toast.error(error.message);
      // Revert state on error
      setIsPaused(!newIsPaused);
      setPausedAt(isPaused ? pausedAt : null);
      setTotalPausedSeconds(totalPausedSeconds);
    }
  };

  if (!taskTitle) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading focus session…
      </div>
    );
  }

  return (
    <>
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
          {isPaused && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-600 dark:text-yellow-400">
              <Pause className="h-3 w-3" />
              Paused
            </span>
          )}
        </div>
        <div className="flex justify-center gap-4 pb-16">
          <Button
            onClick={togglePause}
            size="lg"
            variant="outline"
            className="h-14 gap-2 rounded-full px-8 text-base"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </Button>
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

      <Dialog open={showBreakReminder} onOpenChange={setShowBreakReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Time for a break!
            </DialogTitle>
            <DialogDescription>
              You've been focusing for {breakIntervalMinutes} minutes. Take a short break to rest your mind.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setShowBreakReminder(false);
                // Snooze for 5 minutes
                setLastBreakTime(elapsed - (breakIntervalMinutes * 60 - 300));
              }}
              className="flex-1"
            >
              Snooze 5 min
            </Button>
            <Button onClick={() => setShowBreakReminder(false)} className="flex-1">
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
