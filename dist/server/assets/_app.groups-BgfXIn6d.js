import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-B_bFK5W9.js";
import { u as useAuth, b as useQueryClient, L as Link, s as supabase, t as toast } from "./router-DcQ90zo1.js";
import { u as useQuery } from "./useQuery-CYnMj1bC.js";
import { C as Card } from "./card-WsLkobih.js";
import { B as Button } from "./button-D2sQIMTR.js";
import { I as Input } from "./input-DU-Kk94e.js";
import { T as Textarea } from "./textarea-BKR9S-FY.js";
import { P as Plus } from "./plus-pSHZqa53.js";
import { U as UsersRound } from "./users-round-ByY263eA.js";
import { L as LogOut } from "./log-out-U2Gbp7vM.js";
import { c as createLucideIcon } from "./createLucideIcon-DkotJOnA.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode);
function GroupsPage() {
  const {
    user
  } = useAuth();
  const me = user.id;
  const qc = useQueryClient();
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [creating, setCreating] = reactExports.useState(false);
  const {
    data: groups = []
  } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("groups").select("id,name,description,owner_id,created_at").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: myMemberships = []
  } = useQuery({
    queryKey: ["my-group-memberships", me],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("group_members").select("group_id").eq("user_id", me);
      if (error) throw error;
      return data.map((r) => r.group_id);
    }
  });
  const memberSet = new Set(myMemberships);
  const createGroup = async () => {
    if (!name.trim()) return;
    const {
      error
    } = await supabase.from("groups").insert({
      owner_id: me,
      name: name.trim(),
      description: description.trim() || null
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Group created");
    setName("");
    setDescription("");
    setCreating(false);
    qc.invalidateQueries({
      queryKey: ["groups"]
    });
    qc.invalidateQueries({
      queryKey: ["my-group-memberships", me]
    });
  };
  const join = async (groupId) => {
    const {
      error
    } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: me
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["my-group-memberships", me]
    });
  };
  const leave = async (groupId) => {
    const {
      error
    } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", me);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["my-group-memberships", me]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Groups" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Permanent study communities with group-wide chat." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setCreating((v) => !v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " New"
      ] })
    ] }),
    creating && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Group name", value: name, onChange: (e) => setName(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Description (optional)", value: description, onChange: (e) => setDescription(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setCreating(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: createGroup, children: "Create" })
      ] })
    ] }),
    groups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "mx-auto mb-2 h-5 w-5" }),
      "No groups yet — create the first one."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: groups.map((g) => {
      const isMember = memberSet.has(g.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/group/$groupId", params: {
            groupId: g.id
          }, className: "font-medium hover:underline", children: g.name }),
          g.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: g.description })
        ] }),
        isMember ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/group/$groupId", params: {
            groupId: g.id
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", children: "Open" }) }),
          g.owner_id !== me && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => leave(g.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => join(g.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "mr-1 h-4 w-4" }),
          " Join"
        ] })
      ] }) }, g.id);
    }) })
  ] });
}
export {
  GroupsPage as component
};
