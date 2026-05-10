import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-B_bFK5W9.js";
import { p as Route, u as useAuth, b as useQueryClient, s as supabase, L as Link, t as toast } from "./router-DcQ90zo1.js";
import { u as useQuery } from "./useQuery-CYnMj1bC.js";
import { C as Card } from "./card-WsLkobih.js";
import { B as Button } from "./button-D2sQIMTR.js";
import { I as Input } from "./input-DU-Kk94e.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-xELjwIl5.js";
import { A as ArrowLeft } from "./arrow-left-uRwIFQ9d.js";
import { S as Send } from "./send-rkdYVuwU.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-DkotJOnA.js";
import "./index-CAnTiw_Z.js";
function GroupDetail() {
  const {
    groupId
  } = Route.useParams();
  const {
    user
  } = useAuth();
  const me = user.id;
  const qc = useQueryClient();
  const [text, setText] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  const {
    data: group
  } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("groups").select("id,name,description,owner_id").eq("id", groupId).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: members = []
  } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("group_members").select("user_id,role").eq("group_id", groupId);
      if (error) throw error;
      return data;
    }
  });
  const memberIds = members.map((m) => m.user_id);
  const {
    data: profiles = []
  } = useQuery({
    queryKey: ["group-profiles", memberIds.sort().join(",")],
    enabled: memberIds.length > 0,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("profiles").select("id,username,avatar_url").in("id", memberIds);
      if (error) throw error;
      return data;
    }
  });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const {
    data: messages = []
  } = useQuery({
    queryKey: ["group-messages", groupId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("group_messages").select("id,group_id,user_id,content,created_at").eq("group_id", groupId).order("created_at", {
        ascending: true
      }).limit(200);
      if (error) throw error;
      return data;
    }
  });
  reactExports.useEffect(() => {
    const ch = supabase.channel(`group-${groupId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "group_messages",
      filter: `group_id=eq.${groupId}`
    }, (payload) => {
      qc.setQueryData(["group-messages", groupId], (old = []) => [...old, payload.new]);
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [groupId, qc]);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight
    });
  }, [messages.length]);
  const sendMessage = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    const {
      error
    } = await supabase.from("group_messages").insert({
      group_id: groupId,
      user_id: me,
      content
    });
    if (error) {
      toast.error(error.message);
      setText(content);
    }
  };
  const isMember = members.some((m) => m.user_id === me);
  if (!group) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/groups", className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
      " All groups"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: group.name }),
      group.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: group.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        members.length,
        " members"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex h-[60vh] flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 space-y-3 overflow-y-auto p-4", children: messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "No messages yet — say hi." }) : messages.map((m) => {
        const p = profileMap[m.user_id];
        const mine = m.user_id === me;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-2 ${mine ? "flex-row-reverse" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-7 w-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p?.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: (p?.username ?? "?").slice(0, 2).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: [
            !mine && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-0.5 text-xs font-medium opacity-70", children: p?.username ?? "user" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: m.content })
          ] })
        ] }, m.id);
      }) }),
      isMember ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-t border-border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }, placeholder: "Message the group…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: sendMessage, size: "icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border p-3 text-center text-sm text-muted-foreground", children: "Join the group to chat." })
    ] })
  ] });
}
export {
  GroupDetail as component
};
