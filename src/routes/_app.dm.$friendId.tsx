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

export const Route = createFileRoute("/_app/dm/$friendId")({
  head: () => ({ meta: [{ title: "Chat — FocusFlow" }] }),
  component: DmPage,
});

type DM = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
};

function DmPage() {
  const { friendId } = Route.useParams();
  const { user } = useAuth();
  const me = user!.id;
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: friend } = useQuery({
    queryKey: ["profile", friendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,avatar_url")
        .eq("id", friendId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: messages = [] } = useQuery<DM[]>({
    queryKey: ["dm", me, friendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("id,sender_id,recipient_id,content,created_at")
        .or(
          `and(sender_id.eq.${me},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${me})`,
        )
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data as DM[];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel(`dm-${me}-${friendId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const m = payload.new as DM;
          const relevant =
            (m.sender_id === me && m.recipient_id === friendId) ||
            (m.sender_id === friendId && m.recipient_id === me);
          if (!relevant) return;
          qc.setQueryData<DM[]>(["dm", me, friendId], (old = []) =>
            old.some((x) => x.id === m.id) ? old : [...old, m],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me, friendId, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    const { data, error } = await supabase
      .from("direct_messages")
      .insert({ sender_id: me, recipient_id: friendId, content })
      .select()
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      setText(content);
      return;
    }
    if (data) {
      qc.setQueryData<DM[]>(["dm", me, friendId], (old = []) =>
        old.some((x) => x.id === (data as DM).id) ? old : [...old, data as DM],
      );
    }
  };

  return (
    <div className="space-y-4">
      <Link
        to="/friends"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Friends
      </Link>

      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={friend?.avatar_url ?? undefined} />
          <AvatarFallback>
            {(friend?.username ?? "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-semibold">{friend?.username ?? "…"}</h1>
      </div>

      <Card className="flex h-[60vh] flex-col">
        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No messages yet — start the conversation.
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === me;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex gap-2 border-t border-border p-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message…"
          />
          <Button onClick={send} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
