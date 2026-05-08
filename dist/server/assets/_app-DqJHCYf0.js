import { r as reactExports, U as jsxRuntimeExports, _ as Outlet } from "./worker-entry-CbLWnQik.js";
import { u as useAuth, a as useNavigate, L as Link } from "./router-B4_oxrh4.js";
import { B as Button } from "./button-M6c_QbUe.js";
import { T as Timer } from "./timer-Ca-yX0QU.js";
import { c as createLucideIcon } from "./createLucideIcon-Ci2ZbcRl.js";
import { L as ListTodo } from "./list-todo-DQ434m5-.js";
import { U as Users } from "./users-DZZHOYqz.js";
import { U as UsersRound } from "./users-round-DxKnGyVH.js";
import { T as Trophy } from "./trophy-CRoKSAzP.js";
import { L as LogOut } from "./log-out-CkoQl5OM.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CQE-ZmF3.js";
import "./utils-Bz4m9VPB.js";
const __iconNode$2 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
const LayoutGrid = createLucideIcon("layout-grid", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode);
function AppLayout() {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login"
    });
  }, [user, loading, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Loading…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tracking-tight", children: "FocusFlow" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/app", icon: LayoutGrid, label: "Subjects" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/tasks", icon: ListTodo, label: "Tasks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/history", icon: History, label: "History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/community", icon: Users, label: "Community" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/groups", icon: UsersRound, label: "Groups" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/leaderboard", icon: Trophy, label: "Leaderboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/settings", icon: Settings, label: "Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
          await signOut();
          navigate({
            to: "/"
          });
        }, className: "ml-2", "aria-label": "Sign out", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-5xl px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
function NavItem({
  to,
  icon: Icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, activeProps: {
    className: "bg-accent text-accent-foreground"
  }, className: "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: label })
  ] });
}
export {
  AppLayout as component
};
