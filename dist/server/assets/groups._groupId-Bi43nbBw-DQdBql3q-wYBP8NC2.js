import { J as reactExports, j as jsxRuntimeExports } from "./worker-entry-Diy4BZeW.js";
import { u as useQuery } from "./useQuery-CL9XlL6_-f7iywAgy-FK-t7j3Q.js";
import { b as Route$7, u as useAuth, c as useQueryClient, t as toast, s as supabase } from "./router-CCG5AACC-CZ-yG0ZH-CEfRNWjS.js";
import { u as useMutation } from "./useMutation-BdEHgP_r-BYVLmOlr-cdXYLdSh.js";
import { B as Button, c as createLucideIcon } from "./createLucideIcon-CtsaNwvN-DSqP8f5b-Cr1_PVNQ.js";
import { C as Card } from "./card-BAIauDhZ-B_KVktr--Bn4QS8_v.js";
import { A as Avatar, b as AvatarFallback } from "./avatar-DN3KSxLW-OzC1Qi8f-jKtbPHPc.js";
import { U as Users } from "./users-BipuRdtT-D24G5EjW-D2enUAQS.js";
import { A as ArrowLeft } from "./arrow-left-B16tEf-D-C88jAH89-Czjqfk_H.js";
import { T as Trophy } from "./trophy-CfPZfD0P-C3FhqkoF-WHHQciiM.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-D3x33Gqd-DMudbEkB-Cf7-GG9X.js";
import "./index-BFUGqzIj-DUwf_lYE-BnmkkcHl.js";
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
const Clock = createLucideIcon("clock", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Crown = createLucideIcon("crown", __iconNode);
function GroupDetailPage() {
  const {
    groupId
  } = Route$7.useParams();
  const {
    user
  } = useAuth();
  const userId = user.id;
  const qc = useQueryClient();
  const [timeRange, setTimeRange] = reactExports.useState("week");
  const {
    data: group,
    isLoading: loadingGroup
  } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("study_groups").select("*").eq("id", groupId).single();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: isMember
  } = useQuery({
    queryKey: ["group-membership", groupId, userId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("group_members").select("role").eq("group_id", groupId).eq("user_id", userId).single();
      if (error) return false;
      return !!data;
    }
  });
  const {
    data: leaderboard = [],
    isLoading: loadingLeaderboard
  } = useQuery({
    queryKey: ["group-leaderboard", groupId, timeRange],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc("get_group_leaderboard", {
        p_group_id: groupId,
        p_range: timeRange
      });
      if (error) throw error;
      return data;
    },
    enabled: !!isMember
  });
  const leaveGroup = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["user-groups"]
      });
      toast.success("Left group");
    },
    onError: (e) => toast.error(e.message)
  });
  if (loadingGroup) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[400px] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) });
  }
  if (!group) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[400px] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Group not found" }) });
  }
  if (!isMember) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[400px] flex-col items-center justify-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-12 w-12 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "You're not a member of this group" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => window.history.back(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
        "Go back"
      ] })
    ] });
  }
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => window.history.back(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: group.name }),
        group.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: group.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => leaveGroup.mutate(), children: "Leave" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["day", "week", "all"].map((range) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: timeRange === range ? "default" : "outline", size: "sm", onClick: () => setTimeRange(range), children: range === "day" ? "Today" : range === "week" ? "This Week" : "All Time" }, range)) }),
    loadingLeaderboard ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading leaderboard…" }) : leaderboard.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "No study sessions yet. Start studying to appear on the leaderboard!" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: leaderboard.map((member, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `flex items-center gap-4 p-4 ${index < 3 ? "border-yellow-200 dark:border-yellow-800" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-8 items-center justify-center", children: index === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 text-yellow-500" }) : index === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "🥈" }) : index === 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "🥉" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: index + 1 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary/10 text-primary", children: member.username?.charAt(0).toUpperCase() || "?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-medium", children: member.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground capitalize", children: member.role })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatTime(member.total_seconds) })
      ] })
    ] }, member.user_id)) })
  ] });
}
export {
  GroupDetailPage as component
};
