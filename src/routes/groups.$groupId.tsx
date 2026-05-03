import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, ArrowLeft, Crown, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({ meta: [{ title: "Group — FocusFlow" }] }),
  component: GroupDetailPage,
});

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface GroupMember {
  user_id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  joined_at: string;
  total_seconds: number;
}

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "all">("week");

  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*")
        .eq("id", groupId)
        .single();
      if (error) throw error;
      return data as GroupInfo;
    },
  });

  const { data: isMember } = useQuery({
    queryKey: ["group-membership", groupId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();
      if (error) return false;
      return !!data;
    },
  });

  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["group-leaderboard", groupId, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_group_leaderboard", {
        p_group_id: groupId,
        p_range: timeRange,
      });
      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!isMember,
  });

  const leaveGroup = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-groups"] });
      toast.success("Left group");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loadingGroup) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Group not found</p>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">You're not a member of this group</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => leaveGroup.mutate()}>
          Leave
        </Button>
      </div>

      <div className="flex gap-2">
        {(["day", "week", "all"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === "day" ? "Today" : range === "week" ? "This Week" : "All Time"}
          </Button>
        ))}
      </div>

      {loadingLeaderboard ? (
        <p className="text-sm text-muted-foreground">Loading leaderboard…</p>
      ) : leaderboard.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No study sessions yet. Start studying to appear on the leaderboard!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((member, index) => (
            <Card
              key={member.user_id}
              className={`flex items-center gap-4 p-4 ${index < 3 ? "border-yellow-200 dark:border-yellow-800" : ""}`}
            >
              <div className="flex w-8 items-center justify-center">
                {index === 0 ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : index === 1 ? (
                  <span className="text-lg">🥈</span>
                ) : index === 2 ? (
                  <span className="text-lg">🥉</span>
                ) : (
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {member.username?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{member.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono tabular-nums">{formatTime(member.total_seconds)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
