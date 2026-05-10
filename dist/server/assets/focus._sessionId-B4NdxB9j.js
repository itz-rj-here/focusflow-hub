import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-DjGEjCzc.js";
import { d as Route, u as useAuth, a as useNavigate, s as supabase, t as toast } from "./router-GODDhvyN.js";
import { B as Button } from "./button-C6F0vW5T.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-WSesl_Ao.js";
import { c as createLucideIcon } from "./createLucideIcon-BiE_VpjZ.js";
import { P as Play } from "./play-BqmpDFKF.js";
import { S as Square } from "./square-D7NJNY37.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CoZjXnYr.js";
import "./index-Dqaq2Ls5.js";
import "./index-C3tYGoky.js";
import "./index-CGy_9kWO.js";
import "./index-BK7R10du.js";
import "./x-B_QbXPJL.js";
const __iconNode$1 = [
  ["path", { d: "M10 2v2", key: "7u0qdc" }],
  ["path", { d: "M14 2v2", key: "6buw04" }],
  [
    "path",
    {
      d: "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
      key: "pwadti"
    }
  ],
  ["path", { d: "M6 2v2", key: "colzsn" }]
];
const Coffee = createLucideIcon("coffee", __iconNode$1);
const __iconNode = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode);
function formatHMS(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor(totalSec % 3600 / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function FocusPage() {
  const {
    sessionId
  } = Route.useParams();
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [taskTitle, setTaskTitle] = reactExports.useState(null);
  const [subjectName, setSubjectName] = reactExports.useState(null);
  const [subjectColor, setSubjectColor] = reactExports.useState(null);
  const [startedAt, setStartedAt] = reactExports.useState(null);
  const [elapsed, setElapsed] = reactExports.useState(0);
  const [isPaused, setIsPaused] = reactExports.useState(false);
  const [pausedAt, setPausedAt] = reactExports.useState(null);
  const [totalPausedSeconds, setTotalPausedSeconds] = reactExports.useState(0);
  const [breakReminderEnabled, setBreakReminderEnabled] = reactExports.useState(true);
  const [breakIntervalMinutes, setBreakIntervalMinutes] = reactExports.useState(25);
  const [showBreakReminder, setShowBreakReminder] = reactExports.useState(false);
  const [lastBreakTime, setLastBreakTime] = reactExports.useState(0);
  const tickRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login"
    });
  }, [user, loading, navigate]);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.from("study_sessions").select("task_title, started_at, ended_at, is_paused, paused_at, total_paused_seconds, subjects(name, color_code)").eq("id", sessionId).single();
      if (cancelled) return;
      if (sessionError || !sessionData) {
        toast.error("Session not found");
        navigate({
          to: "/app"
        });
        return;
      }
      if (sessionData.ended_at) {
        navigate({
          to: "/review/$sessionId",
          params: {
            sessionId
          }
        });
        return;
      }
      setTaskTitle(sessionData.task_title);
      setSubjectName(sessionData.subjects?.name ?? null);
      setSubjectColor(sessionData.subjects?.color_code ?? null);
      setStartedAt(new Date(sessionData.started_at).getTime());
      setIsPaused(sessionData.is_paused ?? false);
      setPausedAt(sessionData.paused_at ? new Date(sessionData.paused_at).getTime() : null);
      setTotalPausedSeconds(sessionData.total_paused_seconds ?? 0);
      if (user) {
        const {
          data: profile
        } = await supabase.from("profiles").select("break_reminder_enabled, break_reminder_interval_minutes").eq("id", user.id).single();
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
  reactExports.useEffect(() => {
    if (startedAt == null) return;
    const update = () => {
      const now = Date.now();
      let elapsedSec = Math.floor((now - startedAt) / 1e3);
      if (isPaused && pausedAt) {
        const currentPauseDuration = Math.floor((now - pausedAt) / 1e3);
        elapsedSec = Math.max(0, elapsedSec - totalPausedSeconds - currentPauseDuration);
      } else {
        elapsedSec = Math.max(0, elapsedSec - totalPausedSeconds);
      }
      setElapsed(elapsedSec);
      if (breakReminderEnabled && !isPaused && elapsedSec > 0 && elapsedSec % (breakIntervalMinutes * 60) === 0 && elapsedSec !== lastBreakTime && elapsedSec >= breakIntervalMinutes * 60) {
        setLastBreakTime(elapsedSec);
        setShowBreakReminder(true);
      }
    };
    update();
    tickRef.current = setInterval(update, 1e3);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [startedAt, isPaused, pausedAt, totalPausedSeconds, breakReminderEnabled, breakIntervalMinutes, lastBreakTime]);
  const endSession = async () => {
    if (!startedAt) return;
    let finalDuration = Math.max(0, Math.floor((Date.now() - startedAt) / 1e3));
    let finalPausedSec = totalPausedSeconds;
    if (isPaused && pausedAt) {
      finalPausedSec += Math.floor((Date.now() - pausedAt) / 1e3);
    }
    finalDuration = finalDuration - finalPausedSec;
    const {
      error
    } = await supabase.from("study_sessions").update({
      ended_at: (/* @__PURE__ */ new Date()).toISOString(),
      duration_seconds: finalDuration,
      total_paused_seconds: finalPausedSec
    }).eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({
      to: "/review/$sessionId",
      params: {
        sessionId
      }
    });
  };
  const togglePause = async () => {
    const now = Date.now();
    let newTotalPaused = totalPausedSeconds;
    let newPausedAt = null;
    let newIsPaused = !isPaused;
    if (!isPaused) {
      newPausedAt = now;
    } else {
      if (pausedAt) {
        const pauseDuration = Math.floor((now - pausedAt) / 1e3);
        newTotalPaused = totalPausedSeconds + pauseDuration;
      }
    }
    setIsPaused(newIsPaused);
    setPausedAt(newPausedAt);
    setTotalPausedSeconds(newTotalPaused);
    const {
      error
    } = await supabase.from("study_sessions").update({
      is_paused: newIsPaused,
      paused_at: newIsPaused ? (/* @__PURE__ */ new Date()).toISOString() : null,
      total_paused_seconds: newTotalPaused
    }).eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      setIsPaused(!newIsPaused);
      setPausedAt(isPaused ? pausedAt : null);
      setTotalPausedSeconds(totalPausedSeconds);
    }
  };
  if (!taskTitle) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Loading focus session…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "bg-radial-glow grid min-h-screen grid-rows-[1fr_auto] px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          subjectName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
              backgroundColor: subjectColor ?? "var(--primary)"
            } }),
            subjectName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl text-balance text-xl text-muted-foreground sm:text-2xl", children: taskTitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-7xl font-light tracking-tight tabular-nums sm:text-9xl timer-tick", children: formatHMS(elapsed) }),
        isPaused && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-600 dark:text-yellow-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3 w-3" }),
          "Paused"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-4 pb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: togglePause, size: "lg", variant: "outline", className: "h-14 gap-2 rounded-full px-8 text-base", children: isPaused ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
          "Resume"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }),
          "Pause"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: endSession, size: "lg", variant: "secondary", className: "h-14 gap-2 rounded-full px-8 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 fill-current" }),
          "End session"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showBreakReminder, onOpenChange: setShowBreakReminder, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "h-5 w-5" }),
          "Time for a break!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "You've been focusing for ",
          breakIntervalMinutes,
          " minutes. Take a short break to rest your mind."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex flex-col gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowBreakReminder(false);
          setLastBreakTime(elapsed - (breakIntervalMinutes * 60 - 300));
        }, className: "flex-1", children: "Snooze 5 min" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowBreakReminder(false), className: "flex-1", children: "Got it!" })
      ] })
    ] }) })
  ] });
}
export {
  FocusPage as component
};
