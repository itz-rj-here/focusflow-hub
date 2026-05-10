import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/group/$groupId")({
  head: () => ({ meta: [{ title: "Group — FocusFlow" }] }),
  component: GroupDetail,
});

type Msg = {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

function GroupDetail() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const me = user!.id;
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id,name,description,owner_id")
        .eq("id", groupId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("user_id,role")
        .eq("group_id", groupId);
      if (error) throw error;
      return data;
    },
  });

  const memberIds = members.map((m) => m.user_id);
  const { data: profiles = [] } = useQuery({
    queryKey: ["group-profiles", memberIds.sort().join(",")],
    enabled: memberIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,avatar_url")
        .in("id", memberIds);
      if (error) throw error;
      return data;
    },
  });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const { data: messages = [] } = useQuery<Msg[]>({
    queryKey: ["group-messages", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_messages")
        .select("id,group_id,user_id,content,created_at")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data as Msg[];
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel(`group-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          qc.setQueryData<Msg[]>(["group-messages", groupId], (old = []) => [
            ...old,
            payload.new as Msg,
          ]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [groupId, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    const { error } = await supabase
      .from("group_messages")
      .insert({ group_id: groupId, user_id: me, content });
    if (error) {
      toast.error(error.message);
      setText(content);
    }
  };

  const isMember = members.some((m) => m.user_id === me);

  if (!group) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <Link
        to="/groups"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> All groups
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
        {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{members.length} members</p>
      </div>

      <Card className="flex h-[60vh] flex-col">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No messages yet — say hi.
            </p>
          ) : (
            messages.map((m) => {
              const p = profileMap[m.user_id];
              const mine = m.user_id === me;
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p?.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(p?.username ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-xs font-medium opacity-70">
                        {p?.username ?? "user"}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {isMember ? (
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message the group…"
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
            Join the group to chat.
          </div>
        )}
      </Card>
    </div>
  );
}
