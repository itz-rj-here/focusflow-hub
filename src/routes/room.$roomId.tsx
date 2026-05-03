import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, LogOut, Square, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/room/$roomId")({
  head: () => ({ meta: [{ title: "Group focus — FocusFlow" }] }),
  component: RoomPage,
});

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function RoomPage() {
  const { roomId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = user?.id;
  const [now, setNow] = useState(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const { data: room, isError } = useQuery({
    queryKey: ["room", roomId],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_rooms")
        .select("id,name,owner_id,status,started_at,ended_at")
        .eq("id", roomId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["room-participants", roomId],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_participants")
        .select("user_id,joined_at,left_at,duration_seconds")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const partIds = participants.map((p) => p.user_id);
  const { data: profiles = [] } = useQuery({
    queryKey: ["room-profiles", partIds.sort().join(",")],
    enabled: partIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,username,avatar_url").in("id", partIds);
      if (error) throw error;
      return data;
    },
  });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  // Auto-join if I'm not a participant yet but have access
  useEffect(() => {
    if (!me || !room) return;
    const inList = participants.some((p) => p.user_id === me);
    if (!inList) {
      supabase.from("room_participants").upsert({ room_id: roomId, user_id: me }).then(() => {
        qc.invalidateQueries({ queryKey: ["room-participants", roomId] });
      });
    }
  }, [me, room, participants, roomId, qc]);

  // Realtime
  useEffect(() => {
    const ch = supabase.channel(`room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${roomId}` }, () => {
        qc.invalidateQueries({ queryKey: ["room-participants", roomId] });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "study_rooms", filter: `id=eq.${roomId}` }, () => {
        qc.invalidateQueries({ queryKey: ["room", roomId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, qc]);

  // Tick
  useEffect(() => {
    tickRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const myParticipation = participants.find((p) => p.user_id === me);
  const myStart = myParticipation && !myParticipation.left_at ? new Date(myParticipation.joined_at).getTime() : null;
  const myElapsed = myStart ? Math.floor((now - myStart) / 1000) : (myParticipation?.duration_seconds ?? 0);

  const leaveRoom = async () => {
    if (!myParticipation || !me) return;
    const start = new Date(myParticipation.joined_at).getTime();
    const dur = Math.max(0, Math.floor((Date.now() - start) / 1000)) + (myParticipation.duration_seconds ?? 0);
    await supabase.from("room_participants")
      .update({ left_at: new Date().toISOString(), duration_seconds: dur })
      .eq("room_id", roomId).eq("user_id", me);
    navigate({ to: "/rooms" });
  };

  const endRoom = async () => {
    if (!room || room.owner_id !== me) return;
    await supabase.from("study_rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", roomId);
    toast.success("Room ended");
    navigate({ to: "/rooms" });
  };

  if (isError) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Room not found or no access.</div>;
  }
  if (!room) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  const active = participants.filter((p) => !p.left_at);

  return (
    <main className="bg-radial-glow min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link to="/rooms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={leaveRoom}><LogOut className="mr-1 h-4 w-4" />Leave</Button>
          {room.owner_id === me && room.status === "active" && (
            <Button variant="destructive" size="sm" onClick={endRoom}><Square className="mr-1 h-4 w-4" />End room</Button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />{active.length} focusing now
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{room.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {room.status === "ended" ? "Ended" : `Started ${new Date(room.started_at).toLocaleTimeString()}`}
          </p>
          <div className="mt-8 font-mono text-6xl font-light tabular-nums sm:text-8xl timer-tick">
            {fmt(myElapsed)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Your time in this room</p>
        </div>

        <div className="mt-12">
          <p className="mb-3 text-sm font-medium">Participants</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {participants.map((p) => {
              const prof = profileMap[p.user_id];
              const isActive = !p.left_at;
              const start = new Date(p.joined_at).getTime();
              const live = isActive ? Math.floor((now - start) / 1000) : (p.duration_seconds ?? 0);
              return (
                <Card key={p.user_id} className={`flex items-center gap-3 p-3 ${isActive ? "" : "opacity-60"}`}>
                  <Avatar className="h-10 w-10"><AvatarImage src={prof?.avatar_url ?? undefined} /><AvatarFallback>{prof?.username.slice(0, 2).toUpperCase() ?? "?"}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{prof?.username ?? "…"}{p.user_id === me && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}</p>
                    <p className="text-xs text-muted-foreground">{isActive ? "Focusing" : "Left"}</p>
                  </div>
                  <span className="font-mono text-sm tabular-nums">{fmt(live)}</span>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
