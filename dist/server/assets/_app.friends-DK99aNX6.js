import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CbLWnQik.js";
import { u as useQuery } from "./useQuery-X1Rl2y-6.js";
import { u as useAuth, b as useQueryClient, s as supabase, L as Link, t as toast } from "./router-B4_oxrh4.js";
import { C as Card } from "./card-CbFnjLe4.js";
import { B as Button } from "./button-M6c_QbUe.js";
import { I as Input } from "./input-6GkSWlnO.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-CfWY3jDx.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-7tcPo241.js";
import { c as createLucideIcon } from "./createLucideIcon-Ci2ZbcRl.js";
import { U as Users } from "./users-DZZHOYqz.js";
import { C as Check } from "./check-X4j3nC4d.js";
import { X } from "./x-B_JWMdtx.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./index-CQE-ZmF3.js";
import "./index-B-CNts5i.js";
import "./index-C-fQ04tc.js";
import "./index-D2x2SsTa.js";
import "./index-qOn3aRTO.js";
import "./index-KQTQytNS.js";
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M4.929 4.929 19.07 19.071", key: "196cmz" }]
];
const Ban = createLucideIcon("ban", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
function FriendsPage() {
  const {
    user
  } = useAuth();
  const me = user.id;
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [inviteCodeInput, setInviteCodeInput] = reactExports.useState("");
  const {
    data: myProfile
  } = useQuery({
    queryKey: ["my-profile-invite", me],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc("get_my_invite_code");
      if (error) throw error;
      return {
        invite_code: data
      };
    }
  });
  const {
    data: friendships = []
  } = useQuery({
    queryKey: ["friendships", me],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("friendships").select("id,requester_id,addressee_id,status,created_at");
      if (error) throw error;
      return data;
    }
  });
  const otherIds = Array.from(new Set(friendships.map((f) => f.requester_id === me ? f.addressee_id : f.requester_id)));
  const {
    data: otherProfiles = []
  } = useQuery({
    queryKey: ["friend-profiles", otherIds.sort().join(",")],
    enabled: otherIds.length > 0,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("profiles").select("id,username,avatar_url").in("id", otherIds);
      if (error) throw error;
      return data;
    }
  });
  const profileMap = Object.fromEntries(otherProfiles.map((p) => [p.id, p]));
  reactExports.useEffect(() => {
    const ch = supabase.channel("friendships-watch").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "friendships"
    }, () => {
      qc.invalidateQueries({
        queryKey: ["friendships", me]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me, qc]);
  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter((f) => f.status === "pending" && f.addressee_id === me);
  const outgoing = friendships.filter((f) => f.status === "pending" && f.requester_id === me);
  const runSearch = async () => {
    const q = search.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const {
      data,
      error
    } = await supabase.from("profiles").select("id,username,avatar_url").ilike("username", `%${q}%`).neq("id", me).limit(10);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSearchResults(data);
  };
  const sendRequest = async (otherId) => {
    const existing = friendships.find((f) => f.requester_id === me && f.addressee_id === otherId || f.requester_id === otherId && f.addressee_id === me);
    if (existing) {
      if (existing.status === "accepted") {
        toast.info("Already friends");
        return;
      }
      if (existing.requester_id === otherId) {
        await acceptRequest(existing.id);
        return;
      }
      toast.info("Request already sent");
      return;
    }
    const {
      error
    } = await supabase.from("friendships").insert({
      requester_id: me,
      addressee_id: otherId
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request sent");
    qc.invalidateQueries({
      queryKey: ["friendships", me]
    });
  };
  const acceptRequest = async (id) => {
    const {
      error
    } = await supabase.from("friendships").update({
      status: "accepted",
      accepted_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Friend added");
    qc.invalidateQueries({
      queryKey: ["friendships", me]
    });
  };
  const declineRequest = async (id) => {
    const {
      error
    } = await supabase.from("friendships").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["friendships", me]
    });
  };
  const blockUser = async (otherId) => {
    if (!confirm("Block this user? They will be removed from your friends.")) return;
    const f = friendships.find((x) => x.requester_id === me && x.addressee_id === otherId || x.requester_id === otherId && x.addressee_id === me);
    if (f) await supabase.from("friendships").delete().eq("id", f.id);
    const {
      error
    } = await supabase.from("user_blocks").insert({
      blocker_id: me,
      blocked_id: otherId
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User blocked");
    qc.invalidateQueries({
      queryKey: ["friendships", me]
    });
  };
  const redeemInviteCode = async () => {
    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) return;
    if (code === myProfile?.invite_code) {
      toast.error("That's your own code");
      return;
    }
    const {
      data,
      error
    } = await supabase.rpc("find_user_by_invite_code", {
      _code: code
    }).maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data) {
      toast.error("Invalid code");
      return;
    }
    await sendRequest(data.id);
    setInviteCodeInput("");
  };
  const copyCode = () => {
    if (!myProfile?.invite_code) return;
    navigator.clipboard.writeText(myProfile.invite_code);
    toast.success("Code copied");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Friends" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Connect to study together and compete on the friends leaderboard." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Your invite code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-sm", children: myProfile?.invite_code ?? "…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", onClick: copyCode, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Share this code with a friend so they can add you." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Redeem a code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inviteCodeInput, onChange: (e) => setInviteCodeInput(e.target.value.toUpperCase()), placeholder: "ABCD1234", maxLength: 8, className: "font-mono" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: redeemInviteCode, children: "Add" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Search by username" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter") runSearch();
        }, placeholder: "Search username…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: runSearch, variant: "secondary", children: "Search" })
      ] }),
      searchResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border rounded-md border border-border", children: searchResults.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-8 w-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.avatar_url ?? void 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: p.username.slice(0, 2).toUpperCase() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm", children: p.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", onClick: () => sendRequest(p.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }) })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "friends", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "friends", children: [
          "Friends (",
          accepted.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "incoming", children: [
          "Incoming (",
          incoming.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "outgoing", children: [
          "Sent (",
          outgoing.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "friends", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-2", children: accepted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "p-6 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-2 h-5 w-5" }),
        "No friends yet."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: accepted.map((f) => {
        const otherId = f.requester_id === me ? f.addressee_id : f.requester_id;
        const p = profileMap[otherId];
        if (!p) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: p.username.slice(0, 2).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm font-medium", children: p.username }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dm/$friendId", params: {
            friendId: otherId
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => blockUser(otherId), title: "Block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => declineRequest(f.id), children: "Remove" })
        ] }, f.id);
      }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "incoming", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-2", children: incoming.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No incoming requests." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: incoming.map((f) => {
        const p = profileMap[f.requester_id];
        if (!p) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: p.username.slice(0, 2).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm font-medium", children: p.username }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => acceptRequest(f.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => declineRequest(f.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }, f.id);
      }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "outgoing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-2", children: outgoing.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No sent requests." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: outgoing.map((f) => {
        const p = profileMap[f.addressee_id];
        if (!p) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: p.username.slice(0, 2).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm font-medium", children: p.username }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => declineRequest(f.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }, f.id);
      }) }) }) })
    ] })
  ] });
}
export {
  FriendsPage as component
};
