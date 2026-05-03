import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry-RQlX2Pcr.js";
import { u as useAuth, b as useQueryClient, a as useNavigate, t as toast, s as supabase } from "./router-DjUwB7c9.js";
import { u as useQuery } from "./useQuery-CLER0c11.js";
import { u as useMutation } from "./useMutation-C7tbtrRM.js";
import { c as createLucideIcon, d as cva, B as Button } from "./createLucideIcon-Dbr3Sw-K.js";
import { I as Input, C as Check } from "./input-C091OJdU.js";
import { C as Card } from "./card-D0kQ7RYH.js";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogDescription, e as DialogFooter } from "./dialog-BEYU5XZ1.js";
import { c as cn } from "./utils-yyGTFsPO.js";
import { P as Plus } from "./plus-B0VaEAW8.js";
import { U as Users } from "./users-hvqPoiOv.js";
import { C as Copy } from "./copy-D2tMZxzq.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CuCYRh8S.js";
import "./index-DFXycfMV.js";
import "./index-DsW1k7xg.js";
import "./index-DvAOGsH7.js";
import "./index-CKiysB-v.js";
import "./x-DxHbxZWx.js";
const __iconNode = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode);
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
function GroupsPage() {
  const {
    user
  } = useAuth();
  const userId = user.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = reactExports.useState(false);
  const [joinOpen, setJoinOpen] = reactExports.useState(false);
  const [joinCode, setJoinCode] = reactExports.useState("");
  const [copiedCode, setCopiedCode] = reactExports.useState(null);
  const {
    data: groups = [],
    isLoading
  } = useQuery({
    queryKey: ["user-groups", userId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc("get_user_groups");
      if (error) throw error;
      return data;
    }
  });
  const createGroup = useMutation({
    mutationFn: async (data) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const {
        data: group,
        error
      } = await supabase.from("study_groups").insert({
        name: data.name,
        description: data.description || null,
        invite_code: inviteCode,
        created_by: userId
      }).select().single();
      if (error) throw error;
      const {
        error: memberError
      } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: userId,
        role: "admin"
      });
      if (memberError) throw memberError;
      return group;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["user-groups", userId]
      });
      setCreateOpen(false);
      toast.success("Group created!");
    },
    onError: (e) => toast.error(e.message)
  });
  const joinGroup = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.rpc("join_group_by_code", {
        p_invite_code: joinCode.toUpperCase()
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["user-groups", userId]
      });
      setJoinOpen(false);
      setJoinCode("");
      toast.success("Joined group!");
    },
    onError: (e) => toast.error(e.message)
  });
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Study Groups" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Join or create study groups to study together." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: joinOpen, onOpenChange: setJoinOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "mr-1.5 h-4 w-4" }),
            "Join Group"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Join a Group" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter the invite code shared by a group member." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
              e.preventDefault();
              if (joinCode.trim()) joinGroup.mutate();
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: joinCode, onChange: (e) => setJoinCode(e.target.value.toUpperCase()), placeholder: "Enter invite code", className: "uppercase tracking-widest", autoFocus: true }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: !joinCode.trim() || joinGroup.isPending, children: "Join" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: createOpen, onOpenChange: setCreateOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
            "Create Group"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create a Group" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreateGroupForm, { onSubmit: (data) => createGroup.mutate(data), isPending: createGroup.isPending, onCancel: () => setCreateOpen(false) })
          ] })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : groups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "No groups yet. Create or join one to get started!" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: groups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCard, { group, copiedCode, onCopyCode: copyCode, onViewGroup: () => navigate({
      to: "/groups/$groupId",
      params: {
        groupId: group.group_id
      }
    }) }, group.group_id)) })
  ] });
}
function CreateGroupForm({
  onSubmit,
  isPending,
  onCancel
}) {
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    if (name.trim()) onSubmit({
      name: name.trim(),
      description
    });
  }, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Group Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Math Study Squad", autoFocus: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Description (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "What's your group about?" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: !name.trim() || isPending, children: "Create" })
    ] })
  ] });
}
function GroupCard({
  group,
  copiedCode,
  onCopyCode,
  onViewGroup
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate font-medium", children: group.name }),
      group.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-xs text-muted-foreground", children: group.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: group.role }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          group.member_count,
          " ",
          group.member_count === 1 ? "member" : "members"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "flex-1", onClick: onViewGroup, children: "View" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onCopyCode(group.invite_code), "aria-label": "Copy invite code", children: copiedCode === group.invite_code ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
      "Invite code: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tracking-widest", children: group.invite_code })
    ] })
  ] });
}
export {
  GroupsPage as component
};
