import { U as jsxRuntimeExports } from "./worker-entry-B_bFK5W9.js";
import { L as Link } from "./router-DcQ90zo1.js";
import { C as Card } from "./card-WsLkobih.js";
import { U as Users } from "./users-DIDg2TC0.js";
import { U as UsersRound } from "./users-round-ByY263eA.js";
import { c as createLucideIcon } from "./createLucideIcon-DkotJOnA.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [
  [
    "path",
    {
      d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
      key: "1s2grr"
    }
  ],
  ["path", { d: "M20 2v4", key: "1rf3ol" }],
  ["path", { d: "M22 4h-4", key: "gwowj6" }],
  ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode);
function CommunityHub() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Community" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Study together with friends, join groups, and start live focus parties." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HubCard, { to: "/friends", icon: Users, title: "Friends", desc: "Connect 1-to-1, chat, and add via invite codes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HubCard, { to: "/groups", icon: UsersRound, title: "Groups", desc: "Permanent communities with shared chat." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HubCard, { to: "/rooms", icon: Sparkles, title: "Parties", desc: "Temporary live focus rooms with synced timers." })
    ] })
  ] });
}
function HubCard({
  to,
  icon: Icon,
  title,
  desc
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full p-5 transition hover:bg-accent", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mb-3 h-5 w-5 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: desc })
  ] }) });
}
export {
  CommunityHub as component
};
