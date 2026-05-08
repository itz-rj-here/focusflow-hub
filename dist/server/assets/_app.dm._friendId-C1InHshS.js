import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-CbLWnQik.js";
import { q as Route, u as useAuth, b as useQueryClient, s as supabase, L as Link, t as toast } from "./router-B4_oxrh4.js";
import { u as useQuery } from "./useQuery-X1Rl2y-6.js";
import { C as Card } from "./card-CbFnjLe4.js";
import { B as Button } from "./button-M6c_QbUe.js";
import { I as Input } from "./input-6GkSWlnO.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-CfWY3jDx.js";
import { A as ArrowLeft } from "./arrow-left-aK08jGaV.js";
import { S as Send } from "./send-BCktr7kY.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./index-CQE-ZmF3.js";
import "./index-B-CNts5i.js";
import "./createLucideIcon-Ci2ZbcRl.js";
function DmPage() {
  const {
    friendId
  } = Route.useParams();
  const {
    user
  } = useAuth();
  const me = user.id;
  const qc = useQueryClient();
  const [text, setText] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  const {
    data: friend
  } = useQuery({
    queryKey: ["profile", friendId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("profiles").select("id,username,avatar_url").eq("id", friendId).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: messages = []
  } = useQuery({
    queryKey: ["dm", me, friendId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("direct_messages").select("id,sender_id,recipient_id,content,created_at").or(`and(sender_id.eq.${me},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${me})`).order("created_at", {
        ascending: true
      }).limit(200);
      if (error) throw error;
      return data;
    }
  });
  reactExports.useEffect(() => {
    const ch = supabase.channel(`dm-${me}-${friendId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "direct_messages"
    }, (payload) => {
      const m = payload.new;
      const relevant = m.sender_id === me && m.recipient_id === friendId || m.sender_id === friendId && m.recipient_id === me;
      if (!relevant) return;
      qc.setQueryData(["dm", me, friendId], (old = []) => old.some((x) => x.id === m.id) ? old : [...old, m]);
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me, friendId, qc]);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight
    });
  }, [messages.length]);
  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    const {
      data,
      error
    } = await supabase.from("direct_messages").insert({
      sender_id: me,
      recipient_id: friendId,
      content
    }).select().maybeSingle();
    if (error) {
      toast.error(error.message);
      setText(content);
      return;
    }
    if (data) {
      qc.setQueryData(["dm", me, friendId], (old = []) => old.some((x) => x.id === data.id) ? old : [...old, data]);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/friends", className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
      " Friends"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: friend?.avatar_url ?? void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: (friend?.username ?? "?").slice(0, 2).toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: friend?.username ?? "…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex h-[60vh] flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 space-y-2 overflow-y-auto p-4", children: messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: "No messages yet — start the conversation." }) : messages.map((m) => {
        const mine = m.sender_id === me;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: m.content }) }) }, m.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-t border-border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }, placeholder: "Message…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: send, size: "icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] })
    ] })
  ] });
}
export {
  DmPage as component
};
