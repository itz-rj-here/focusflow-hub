import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-RQlX2Pcr.js";
import { u as useQuery } from "./useQuery-CLER0c11.js";
import { u as useAuth, s as supabase } from "./router-DjUwB7c9.js";
import { C as Card } from "./card-D0kQ7RYH.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-B_WNr1yw.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, b as Table, c as TableHeader, d as TableRow, e as TableHead, f as TableBody, g as TableCell } from "./BarChart-yIxwu8aZ.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-yyGTFsPO.js";
import "./index-DFXycfMV.js";
import "./index-DsW1k7xg.js";
import "./index-D77H3rnX.js";
import "./index-Bv9rL0xp.js";
import "./index-CKiysB-v.js";
function fmt(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor(secs % 3600 / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function HistoryPage() {
  const {
    user
  } = useAuth();
  const userId = user.id;
  const [bucket, setBucket] = reactExports.useState("day");
  const {
    data: sessions = [],
    isLoading
  } = useQuery({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("study_sessions").select("id, task_title, duration_seconds, started_at, ended_at, subject_id, subjects(name, color_code)").eq("saved", true).order("ended_at", {
        ascending: false
      }).limit(200);
      if (error) throw error;
      return data;
    }
  });
  const chartData = reactExports.useMemo(() => {
    const buckets = /* @__PURE__ */ new Map();
    const now = /* @__PURE__ */ new Date();
    if (bucket === "day") {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, 0);
      }
      sessions.forEach((s) => {
        if (!s.ended_at) return;
        const key = new Date(s.ended_at).toISOString().slice(0, 10);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + s.duration_seconds);
      });
      return Array.from(buckets.entries()).map(([key, v]) => ({
        label: new Date(key).toLocaleDateString(void 0, {
          month: "short",
          day: "numeric"
        }),
        minutes: Math.round(v / 60)
      }));
    } else {
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const dow = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (dow + 6) % 7);
        const key = monday.toISOString().slice(0, 10);
        if (!buckets.has(key)) buckets.set(key, 0);
      }
      sessions.forEach((s) => {
        if (!s.ended_at) return;
        const d = new Date(s.ended_at);
        const dow = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (dow + 6) % 7);
        const key = monday.toISOString().slice(0, 10);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + s.duration_seconds);
      });
      return Array.from(buckets.entries()).map(([key, v]) => ({
        label: "Wk " + new Date(key).toLocaleDateString(void 0, {
          month: "short",
          day: "numeric"
        }),
        minutes: Math.round(v / 60)
      }));
    }
  }, [sessions, bucket]);
  const totalSecs = sessions.reduce((a, s) => a + s.duration_seconds, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "All your saved focus sessions." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total saved time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-2xl", children: fmt(totalSecs) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-2xl", children: sessions.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-2xl", children: sessions.length ? fmt(Math.round(totalSecs / sessions.length)) : "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: bucket, onValueChange: (v) => setBucket(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium", children: "Focus minutes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "day", children: "Daily (14d)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "week", children: "Weekly (8w)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: bucket, className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "minutes", fill: "var(--primary)", radius: [6, 6, 0, 0] })
      ] }) }) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Task" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Duration" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground", children: "Loading…" }) }) : sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground", children: "No sessions yet. Start one from your tasks." }) }) : sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: s.subjects ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
            backgroundColor: s.subjects.color_code
          } }),
          s.subjects.name
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: s.task_title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: s.ended_at ? new Date(s.ended_at).toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: fmt(s.duration_seconds) })
      ] }, s.id)) })
    ] }) })
  ] });
}
export {
  HistoryPage as component
};
