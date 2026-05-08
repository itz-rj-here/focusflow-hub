import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CbLWnQik.js";
import { d as Route, u as useAuth, a as useNavigate, s as supabase, t as toast } from "./router-B4_oxrh4.js";
import { B as Button } from "./button-M6c_QbUe.js";
import { S as Square } from "./square-BD6gt8nV.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CQE-ZmF3.js";
import "./utils-Bz4m9VPB.js";
import "./createLucideIcon-Ci2ZbcRl.js";
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
        data,
        error
      } = await supabase.from("study_sessions").select("task_title, started_at, ended_at, subjects(name, color_code)").eq("id", sessionId).single();
      if (cancelled) return;
      if (error || !data) {
        toast.error("Session not found");
        navigate({
          to: "/app"
        });
        return;
      }
      if (data.ended_at) {
        navigate({
          to: "/review/$sessionId",
          params: {
            sessionId
          }
        });
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
  reactExports.useEffect(() => {
    if (startedAt == null) return;
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1e3)));
    update();
    tickRef.current = setInterval(update, 1e3);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [startedAt]);
  const endSession = async () => {
    if (!startedAt) return;
    const duration = Math.max(0, Math.floor((Date.now() - startedAt) / 1e3));
    const {
      error
    } = await supabase.from("study_sessions").update({
      ended_at: (/* @__PURE__ */ new Date()).toISOString(),
      duration_seconds: duration
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
  if (!taskTitle) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Loading focus session…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "bg-radial-glow grid min-h-screen grid-rows-[1fr_auto] px-6", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-7xl font-light tracking-tight tabular-nums sm:text-9xl timer-tick", children: formatHMS(elapsed) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: endSession, size: "lg", variant: "secondary", className: "h-14 gap-2 rounded-full px-8 text-base", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 fill-current" }),
      "End session"
    ] }) })
  ] });
}
export {
  FocusPage as component
};
