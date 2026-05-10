import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-B_bFK5W9.js";
import { R as Route, u as useAuth, a as useNavigate, b as useQueryClient, s as supabase, L as Link, t as toast } from "./router-DcQ90zo1.js";
import { u as useQuery } from "./useQuery-CYnMj1bC.js";
import { B as Button } from "./button-D2sQIMTR.js";
import { C as Card } from "./card-WsLkobih.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-xELjwIl5.js";
import { A as ArrowLeft } from "./arrow-left-uRwIFQ9d.js";
import { L as LogOut } from "./log-out-U2Gbp7vM.js";
import { S as Square } from "./square-DFVTgEOb.js";
import { U as Users } from "./users-DIDg2TC0.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-DkotJOnA.js";
import "./index-CAnTiw_Z.js";
function fmt(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
function RoomPage() {
  const {
    roomId
  } = Route.useParams();
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = user?.id;
  const [now, setNow] = reactExports.useState(Date.now());
  const tickRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/login"
    });
  }, [user, loading, navigate]);
  const {
    data: room,
    isError
  } = useQuery({
    queryKey: ["room", roomId],
    enabled: !!me,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("study_rooms").select("id,name,owner_id,status,started_at,ended_at").eq("id", roomId).single();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: participants = []
  } = useQuery({
    queryKey: ["room-participants", roomId],
    enabled: !!me,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("room_participants").select("user_id,joined_at,left_at,duration_seconds").eq("room_id", roomId);
      if (error) throw error;
      return data;
    }
  });
  const partIds = participants.map((p) => p.user_id);
  const {
    data: profiles = []
  } = useQuery({
    queryKey: ["room-profiles", partIds.sort().join(",")],
    enabled: partIds.length > 0,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("profiles").select("id,username,avatar_url").in("id", partIds);
      if (error) throw error;
      return data;
    }
  });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  reactExports.useEffect(() => {
    if (!me || !room) return;
    const inList = participants.some((p) => p.user_id === me);
    if (!inList) {
      supabase.from("room_participants").upsert({
        room_id: roomId,
        user_id: me
      }).then(() => {
        qc.invalidateQueries({
          queryKey: ["room-participants", roomId]
        });
      });
    }
  }, [me, room, participants, roomId, qc]);
  reactExports.useEffect(() => {
    const ch = supabase.channel(`room-${roomId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "room_participants",
      filter: `room_id=eq.${roomId}`
    }, () => {
      qc.invalidateQueries({
        queryKey: ["room-participants", roomId]
      });
    }).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "study_rooms",
      filter: `id=eq.${roomId}`
    }, () => {
      qc.invalidateQueries({
        queryKey: ["room", roomId]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [roomId, qc]);
  reactExports.useEffect(() => {
    tickRef.current = setInterval(() => setNow(Date.now()), 1e3);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);
  const myParticipation = participants.find((p) => p.user_id === me);
  const myStart = myParticipation && !myParticipation.left_at ? new Date(myParticipation.joined_at).getTime() : null;
  const myElapsed = myStart ? Math.floor((now - myStart) / 1e3) : myParticipation?.duration_seconds ?? 0;
  const leaveRoom = async () => {
    if (!myParticipation || !me) return;
    const start = new Date(myParticipation.joined_at).getTime();
    const dur = Math.max(0, Math.floor((Date.now() - start) / 1e3)) + (myParticipation.duration_seconds ?? 0);
    await supabase.from("room_participants").update({
      left_at: (/* @__PURE__ */ new Date()).toISOString(),
      duration_seconds: dur
    }).eq("room_id", roomId).eq("user_id", me);
    navigate({
      to: "/rooms"
    });
  };
  const endRoom = async () => {
    if (!room || room.owner_id !== me) return;
    await supabase.from("study_rooms").update({
      status: "ended",
      ended_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", roomId);
    toast.success("Room ended");
    navigate({
      to: "/rooms"
    });
  };
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Room not found or no access." });
  }
  if (!room) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Loading…" });
  }
  const active = participants.filter((p) => !p.left_at);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "bg-radial-glow min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-4xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/rooms", className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: leaveRoom, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-1 h-4 w-4" }),
          "Leave"
        ] }),
        room.owner_id === me && room.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", size: "sm", onClick: endRoom, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "mr-1 h-4 w-4" }),
          "End room"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-6 pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
          active.length,
          " focusing now"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl font-semibold tracking-tight", children: room.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: room.status === "ended" ? "Ended" : `Started ${new Date(room.started_at).toLocaleTimeString()}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 font-mono text-6xl font-light tabular-nums sm:text-8xl timer-tick", children: fmt(myElapsed) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Your time in this room" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm font-medium", children: "Participants" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: participants.map((p) => {
          const prof = profileMap[p.user_id];
          const isActive = !p.left_at;
          const start = new Date(p.joined_at).getTime();
          const live = isActive ? Math.floor((now - start) / 1e3) : p.duration_seconds ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `flex items-center gap-3 p-3 ${isActive ? "" : "opacity-60"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-10 w-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: prof?.avatar_url ?? void 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: prof?.username.slice(0, 2).toUpperCase() ?? "?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
                prof?.username ?? "…",
                p.user_id === me && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-muted-foreground", children: "(you)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isActive ? "Focusing" : "Left" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm tabular-nums", children: fmt(live) })
          ] }, p.user_id);
        }) })
      ] })
    ] })
  ] });
}
export {
  RoomPage as component
};
