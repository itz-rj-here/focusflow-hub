import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-RQlX2Pcr.js";
import { u as useAuth, a as useNavigate, L as Link } from "./router-DjUwB7c9.js";
import { c as createLucideIcon, B as Button } from "./createLucideIcon-Dbr3Sw-K.js";
import { G as GoogleSignInButton } from "./GoogleSignInButton-DcT2-YsR.js";
import { T as Timer } from "./timer-Dt7Nj5DY.js";
import { T as Trophy } from "./trophy-D6Y-F5LD.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-yyGTFsPO.js";
const __iconNode$1 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$1);
const __iconNode = [
  ["path", { d: "M13 5h8", key: "a7qcls" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 19h8", key: "c3s6r1" }],
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }]
];
const ListChecks = createLucideIcon("list-checks", __iconNode);
function Landing() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && user) navigate({
      to: "/app"
    });
  }, [user, loading, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "bg-radial-glow min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tracking-tight", children: "FocusFlow" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/leaderboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: "Leaderboard" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", children: "Sign in" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground", children: "Minimal. Fast. Built for deep work." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-balance text-5xl font-semibold tracking-tight sm:text-6xl", children: [
        "Focus better.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent", children: "Study smarter." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg", children: "A clean to-do list, a distraction-free focus timer, and a friendly leaderboard. Track every minute you put in — and watch the hours add up." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleSignInButton, { className: "h-12 px-6 text-base" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Free. Private by default if you want it." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3", children: [{
      icon: ListChecks,
      title: "Plan your day",
      body: "Quick to-dos. Click one and start a focus session in a single tap."
    }, {
      icon: Timer,
      title: "Enter flow",
      body: "A full-screen, distraction-free stopwatch. One task. One job."
    }, {
      icon: ChartColumn,
      title: "See progress",
      body: "Session history with charts. Watch your study hours climb."
    }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card/60 p-5 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-medium", children: f.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: f.body })
    ] }, f.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-3xl px-6 pb-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mx-auto h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-2xl font-semibold tracking-tight", children: "Compete (or stay private)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-lg text-sm text-muted-foreground", children: "Public profiles appear on the global leaderboard. Switch to private anytime — your data stays hidden." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/leaderboard", className: "mt-5 inline-block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", children: "View leaderboard" }) })
    ] })
  ] });
}
export {
  Landing as component
};
