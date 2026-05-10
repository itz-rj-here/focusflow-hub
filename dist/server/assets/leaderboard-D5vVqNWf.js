import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-B_bFK5W9.js";
import { u as useAuth, L as Link, s as supabase } from "./router-DcQ90zo1.js";
import { u as useQuery } from "./useQuery-CYnMj1bC.js";
import { C as Card } from "./card-WsLkobih.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-D4qEJe5p.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-xELjwIl5.js";
import { B as Button } from "./button-D2sQIMTR.js";
import { T as Timer } from "./timer-nCjtyG6p.js";
import { T as Trophy } from "./trophy-B4s8TyGA.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-DkotJOnA.js";
import "./index-CCoPBkcz.js";
import "./index-CAnTiw_Z.js";
import "./index-NM_k3dox.js";
import "./index-cWnnIzgt.js";
import "./index-BxmJQFlE.js";
function fmtHours(secs) {
  const h = secs / 3600;
  if (h >= 10) return h.toFixed(0) + "h";
  return h.toFixed(1) + "h";
}
function LeaderboardPage() {
  const {
    user
  } = useAuth();
  const [range, setRange] = reactExports.useState("week");
  const [scope, setScope] = reactExports.useState("global");
  const {
    data: rows = [],
    isLoading
  } = useQuery({
    queryKey: ["leaderboard", range, scope, user?.id],
    queryFn: async () => {
      const fn = scope === "friends" ? "get_friends_leaderboard" : "get_leaderboard";
      const {
        data,
        error
      } = await supabase.rpc(fn, {
        range_kind: range
      });
      if (error) throw error;
      return data;
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "bg-radial-glow min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-3xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tracking-tight", children: "FocusFlow" })
      ] }),
      user ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", children: "Open app" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", children: "Sign in" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-6 pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mx-auto h-7 w-7 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight", children: "Leaderboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Total focus time across public profiles." })
      ] }),
      user && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: scope, onValueChange: (v) => setScope(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "global", children: "Global" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "friends", children: "Friends" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: range, onValueChange: (v) => setRange(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "day", children: "Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "week", children: "This week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "All time" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-sm text-muted-foreground", children: "Loading…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-sm text-muted-foreground", children: "No public study time yet for this range." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: rows.map((r, i) => {
        const isMe = user?.id === r.user_id;
        const rank = i + 1;
        const medal = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-zinc-300" : rank === 3 ? "text-amber-700" : "text-muted-foreground";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `flex items-center gap-4 px-4 py-3 ${isMe ? "bg-accent/40" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-8 text-center font-mono text-sm ${medal}`, children: rank }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: r.avatar_url ?? void 0, alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: r.username.slice(0, 2).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 truncate text-sm font-medium", children: [
            r.username,
            isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: "(you)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm tabular-nums", children: fmtHours(Number(r.total_seconds)) })
        ] }, r.user_id);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-center text-xs text-muted-foreground", children: [
        "Want to be listed? Sign in and keep your profile public in",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings", className: "underline", children: "Settings" }),
        "."
      ] })
    ] })
  ] });
}
export {
  LeaderboardPage as component
};
