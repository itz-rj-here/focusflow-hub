import { J as reactExports, j as jsxRuntimeExports } from "./worker-entry-Diy4BZeW.js";
import { u as useAuth, L as Link, s as supabase } from "./router-CCG5AACC-CZ-yG0ZH-CEfRNWjS.js";
import { u as useQuery } from "./useQuery-CL9XlL6_-f7iywAgy-FK-t7j3Q.js";
import { C as Card } from "./card-BAIauDhZ-B_KVktr--Bn4QS8_v.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-0nRf3ZVl-Bz3p5V04-D5Rfsz5T.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-DN3KSxLW-OzC1Qi8f-jKtbPHPc.js";
import { B as Button } from "./createLucideIcon-CtsaNwvN-DSqP8f5b-Cr1_PVNQ.js";
import { T as Timer } from "./timer-BlPlwYpc-DWRxKJwO-TM1GNCSE.js";
import { T as Trophy } from "./trophy-CfPZfD0P-C3FhqkoF-WHHQciiM.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-D3x33Gqd-DMudbEkB-Cf7-GG9X.js";
import "./index-BRVXRqRH-BElZ5nYJ-BRr3V-7u.js";
import "./index-BFUGqzIj-DUwf_lYE-BnmkkcHl.js";
import "./index-DDjbKGWG-CYKFikgM-CwHY1BiI.js";
import "./index-DUskYfy5-3rKdxkJi-C3opnE_9.js";
import "./index-BrxZFvwL-Dn5wxDls-Bwxupdmj.js";
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
  const {
    data: rows = [],
    isLoading
  } = useQuery({
    queryKey: ["leaderboard", range],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc("get_leaderboard", {
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
