import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-DjGEjCzc.js";
import { i as Route, u as useAuth, a as useNavigate, t as toast, s as supabase, L as Link } from "./router-GODDhvyN.js";
import { u as useQuery } from "./useQuery-DglqVA2p.js";
import { u as useMutation } from "./useMutation-DKgTEQWa.js";
import { B as Button } from "./button-C6F0vW5T.js";
import { C as Card } from "./card-D2AfHmp5.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, b as Table, c as TableHeader, d as TableRow, e as TableHead, f as TableBody, g as TableCell } from "./BarChart-BwcLoVFO.js";
import { A as ArrowLeft } from "./arrow-left-cUkeknBg.js";
import { L as ListTodo } from "./list-todo-HBMcMI4t.js";
import { P as Play } from "./play-BqmpDFKF.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-BiE_VpjZ.js";
function fmt(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor(secs % 3600 / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function SubjectAnalyticsPage() {
  const {
    subjectId
  } = Route.useParams();
  const {
    user
  } = useAuth();
  const userId = user.id;
  const navigate = useNavigate();
  const {
    data: subject
  } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("subjects").select("*").eq("id", subjectId).single();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: sessions = [],
    isLoading
  } = useQuery({
    queryKey: ["sessions", userId, "subject", subjectId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("study_sessions").select("id, task_title, duration_seconds, started_at, ended_at").eq("subject_id", subjectId).eq("saved", true).order("ended_at", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      return data;
    }
  });
  const {
    totalSecs,
    todaySecs,
    weekSecs,
    dailyChart,
    weeklyChart
  } = reactExports.useMemo(() => {
    let total = 0, today = 0, week = 0;
    const now = /* @__PURE__ */ new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const dow = now.getDay();
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - (dow + 6) % 7);
    const dayBuckets = /* @__PURE__ */ new Map();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayBuckets.set(d.toISOString().slice(0, 10), 0);
    }
    const weekBuckets = /* @__PURE__ */ new Map();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const wDow = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (wDow + 6) % 7);
      monday.setHours(0, 0, 0, 0);
      weekBuckets.set(monday.toISOString().slice(0, 10), 0);
    }
    sessions.forEach((s) => {
      total += s.duration_seconds;
      if (!s.ended_at) return;
      const ended = new Date(s.ended_at);
      if (ended >= startOfToday) today += s.duration_seconds;
      if (ended >= startOfWeek) week += s.duration_seconds;
      const dKey = ended.toISOString().slice(0, 10);
      if (dayBuckets.has(dKey)) dayBuckets.set(dKey, (dayBuckets.get(dKey) || 0) + s.duration_seconds);
      const wDow = ended.getDay();
      const monday = new Date(ended);
      monday.setDate(ended.getDate() - (wDow + 6) % 7);
      monday.setHours(0, 0, 0, 0);
      const wKey = monday.toISOString().slice(0, 10);
      if (weekBuckets.has(wKey)) weekBuckets.set(wKey, (weekBuckets.get(wKey) || 0) + s.duration_seconds);
    });
    return {
      totalSecs: total,
      todaySecs: today,
      weekSecs: week,
      dailyChart: Array.from(dayBuckets.entries()).map(([k, v]) => ({
        label: new Date(k).toLocaleDateString(void 0, {
          month: "short",
          day: "numeric"
        }),
        minutes: Math.round(v / 60)
      })),
      weeklyChart: Array.from(weekBuckets.entries()).map(([k, v]) => ({
        label: "Wk " + new Date(k).toLocaleDateString(void 0, {
          month: "short",
          day: "numeric"
        }),
        minutes: Math.round(v / 60)
      }))
    };
  }, [sessions]);
  const startSession = useMutation({
    mutationFn: async () => {
      const {
        data,
        error
      } = await supabase.from("study_sessions").insert({
        user_id: userId,
        subject_id: subjectId,
        todo_id: null,
        task_title: `${subject?.name ?? "Subject"} — quick focus`,
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (sessionId) => navigate({
      to: "/focus/$sessionId",
      params: {
        sessionId
      }
    }),
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app", className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
        " All subjects"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [
        subject && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg text-base font-semibold text-white", style: {
          backgroundColor: subject.color_code
        }, children: subject.name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: subject?.name ?? "Subject" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Analytics & focus history for this subject." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tasks", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListTodo, { className: "h-4 w-4" }),
          " Manage tasks"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => startSession.mutate(), disabled: startSession.isPending, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
          " Quick start"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-2xl", children: fmt(todaySecs) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-2xl", children: fmt(weekSecs) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-2xl", children: fmt(totalSecs) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 font-medium", children: "Daily focus (14d)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: dailyChart, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--border)", strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12
          }, cursor: {
            fill: "var(--accent)",
            opacity: 0.3
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "minutes", fill: subject?.color_code ?? "var(--primary)", radius: [6, 6, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 font-medium", children: "Weekly focus (8w)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: weeklyChart, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--border)", strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12
          }, cursor: {
            fill: "var(--accent)",
            opacity: 0.3
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "minutes", fill: subject?.color_code ?? "var(--primary)", radius: [6, 6, 0, 0] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium", children: "Recent sessions" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Task" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Duration" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground", children: "Loading…" }) }) : sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground", children: "No sessions for this subject yet." }) }) : sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: s.task_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: s.ended_at ? new Date(s.ended_at).toLocaleString() : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: fmt(s.duration_seconds) })
        ] }, s.id)) })
      ] })
    ] })
  ] });
}
export {
  SubjectAnalyticsPage as component
};
