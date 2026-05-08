import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CbLWnQik.js";
import { u as useAuth, b as useQueryClient, a as useNavigate, s as supabase, L as Link, t as toast } from "./router-B4_oxrh4.js";
import { u as useQuery } from "./useQuery-X1Rl2y-6.js";
import { C as Card } from "./card-CbFnjLe4.js";
import { B as Button } from "./button-M6c_QbUe.js";
import { I as Input } from "./input-6GkSWlnO.js";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-BCgnhruT.js";
import { C as Checkbox } from "./checkbox-CQB1x8BD.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-CfWY3jDx.js";
import { P as Plus } from "./plus-C4td9My5.js";
import { C as Check } from "./check-X4j3nC4d.js";
import { X } from "./x-B_JWMdtx.js";
import { U as Users } from "./users-DZZHOYqz.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./index-CQE-ZmF3.js";
import "./index-DA1u0bcF.js";
import "./index-C-fQ04tc.js";
import "./index-B-CNts5i.js";
import "./index-uVbT33vL.js";
import "./index-KQTQytNS.js";
import "./index-D00wcloN.js";
import "./createLucideIcon-Ci2ZbcRl.js";
function RoomsPage() {
  const {
    user
  } = useAuth();
  const me = user.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [selectedFriends, setSelectedFriends] = reactExports.useState(/* @__PURE__ */ new Set());
  const {
    data: rooms = []
  } = useQuery({
    queryKey: ["rooms", me],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("study_rooms").select("id,name,owner_id,status,started_at").eq("status", "active").order("started_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: invites = []
  } = useQuery({
    queryKey: ["my-invites", me],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("room_invites").select("id,room_id,inviter_id,status,study_rooms(name,status)").eq("invitee_id", me).eq("status", "pending");
      if (error) throw error;
      return data;
    }
  });
  const {
    data: friends = []
  } = useQuery({
    queryKey: ["accepted-friends", me],
    queryFn: async () => {
      const {
        data: f,
        error
      } = await supabase.from("friendships").select("requester_id,addressee_id").eq("status", "accepted");
      if (error) throw error;
      const ids = (f ?? []).map((r) => r.requester_id === me ? r.addressee_id : r.requester_id);
      if (ids.length === 0) return [];
      const {
        data: p,
        error: e2
      } = await supabase.from("profiles").select("id,username,avatar_url").in("id", ids);
      if (e2) throw e2;
      return p;
    }
  });
  const inviterIds = Array.from(new Set(invites.map((i) => i.inviter_id)));
  const {
    data: inviterProfiles = []
  } = useQuery({
    queryKey: ["inviter-profiles", inviterIds.sort().join(",")],
    enabled: inviterIds.length > 0,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("profiles").select("id,username,avatar_url").in("id", inviterIds);
      if (error) throw error;
      return data;
    }
  });
  const inviterMap = Object.fromEntries(inviterProfiles.map((p) => [p.id, p]));
  reactExports.useEffect(() => {
    const ch = supabase.channel("rooms-watch").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "room_invites"
    }, () => {
      qc.invalidateQueries({
        queryKey: ["my-invites", me]
      });
    }).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "study_rooms"
    }, () => {
      qc.invalidateQueries({
        queryKey: ["rooms", me]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me, qc]);
  const createRoom = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name required");
      return;
    }
    const {
      data: room,
      error
    } = await supabase.from("study_rooms").insert({
      owner_id: me,
      name: trimmed
    }).select("id").single();
    if (error || !room) {
      toast.error(error?.message ?? "Failed");
      return;
    }
    if (selectedFriends.size > 0) {
      const rows = Array.from(selectedFriends).map((fid) => ({
        room_id: room.id,
        invitee_id: fid,
        inviter_id: me
      }));
      const {
        error: e2
      } = await supabase.from("room_invites").insert(rows);
      if (e2) toast.error(e2.message);
    }
    await supabase.from("room_participants").insert({
      room_id: room.id,
      user_id: me
    });
    setOpen(false);
    setName("");
    setSelectedFriends(/* @__PURE__ */ new Set());
    navigate({
      to: "/room/$roomId",
      params: {
        roomId: room.id
      }
    });
  };
  const acceptInvite = async (inviteId, roomId) => {
    const {
      error
    } = await supabase.from("room_invites").update({
      status: "accepted"
    }).eq("id", inviteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("room_participants").upsert({
      room_id: roomId,
      user_id: me
    });
    navigate({
      to: "/room/$roomId",
      params: {
        roomId
      }
    });
  };
  const declineInvite = async (inviteId) => {
    await supabase.from("room_invites").update({
      status: "declined"
    }).eq("id", inviteId);
    qc.invalidateQueries({
      queryKey: ["my-invites", me]
    });
  };
  const toggleFriend = (id) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Group focus rooms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Study together with friends in real time." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          "Create room"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New focus room" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Room name (e.g. Calc cram)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm font-medium", children: "Invite friends" }),
              friends.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "No friends yet. ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/friends", className: "underline", children: "Add some" }),
                "."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2", children: friends.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selectedFriends.has(f.id), onCheckedChange: () => toggleFriend(f.id) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-7 w-7", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: f.avatar_url ?? void 0 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: f.username.slice(0, 2).toUpperCase() })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: f.username })
              ] }, f.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createRoom, children: "Create & join" }) })
        ] })
      ] })
    ] }),
    invites.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm font-medium", children: "Pending invitations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: invites.map((i) => {
        const room = i.study_rooms;
        const inviter = inviterMap[i.inviter_id];
        if (!room || room.status !== "active") return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 rounded-md border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-8 w-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: inviter?.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: inviter?.username.slice(0, 2).toUpperCase() ?? "?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: room.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "from ",
              inviter?.username ?? "…"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => acceptInvite(i.id, i.room_id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => declineInvite(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }, i.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm font-medium", children: "Your active rooms" }),
      rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-2 h-6 w-6" }),
        "No active rooms. Create one to study with friends."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/room/$roomId", params: {
        roomId: r.id
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 transition hover:bg-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: r.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          "Started ",
          new Date(r.started_at).toLocaleString(),
          r.owner_id === me && " · You own this room"
        ] })
      ] }) }, r.id)) })
    ] })
  ] });
}
export {
  RoomsPage as component
};
