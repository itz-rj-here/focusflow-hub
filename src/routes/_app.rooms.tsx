import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/rooms")({
  head: () => ({ meta: [{ title: "Group rooms — FocusFlow" }] }),
  component: RoomsPage,
});

function RoomsPage() {
  const { user } = useAuth();
  const me = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms", me],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_rooms")
        .select("id,name,owner_id,status,started_at")
        .eq("status", "active")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: invites = [] } = useQuery({
    queryKey: ["my-invites", me],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_invites")
        .select("id,room_id,inviter_id,status,study_rooms(name,status)")
        .eq("invitee_id", me)
        .eq("status", "pending");
      if (error) throw error;
      return data;
    },
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["accepted-friends", me],
    queryFn: async () => {
      const { data: f, error } = await supabase.from("friendships").select("requester_id,addressee_id").eq("status", "accepted");
      if (error) throw error;
      const ids = (f ?? []).map((r) => (r.requester_id === me ? r.addressee_id : r.requester_id));
      if (ids.length === 0) return [];
      const { data: p, error: e2 } = await supabase.from("profiles").select("id,username,avatar_url").in("id", ids);
      if (e2) throw e2;
      return p;
    },
  });

  // Fetch inviter profiles
  const inviterIds = Array.from(new Set(invites.map((i) => i.inviter_id)));
  const { data: inviterProfiles = [] } = useQuery({
    queryKey: ["inviter-profiles", inviterIds.sort().join(",")],
    enabled: inviterIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,username,avatar_url").in("id", inviterIds);
      if (error) throw error;
      return data;
    },
  });
  const inviterMap = Object.fromEntries(inviterProfiles.map((p) => [p.id, p]));

  useEffect(() => {
    const ch = supabase.channel("rooms-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "room_invites" }, () => {
        qc.invalidateQueries({ queryKey: ["my-invites", me] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "study_rooms" }, () => {
        qc.invalidateQueries({ queryKey: ["rooms", me] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me, qc]);

  const createRoom = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Name required"); return; }
    const { data: room, error } = await supabase
      .from("study_rooms")
      .insert({ owner_id: me, name: trimmed })
      .select("id")
      .single();
    if (error || !room) { toast.error(error?.message ?? "Failed"); return; }

    if (selectedFriends.size > 0) {
      const rows = Array.from(selectedFriends).map((fid) => ({
        room_id: room.id, invitee_id: fid, inviter_id: me,
      }));
      const { error: e2 } = await supabase.from("room_invites").insert(rows);
      if (e2) toast.error(e2.message);
    }
    // Auto-join self
    await supabase.from("room_participants").insert({ room_id: room.id, user_id: me });
    setOpen(false); setName(""); setSelectedFriends(new Set());
    navigate({ to: "/room/$roomId", params: { roomId: room.id } });
  };

  const acceptInvite = async (inviteId: string, roomId: string) => {
    const { error } = await supabase.from("room_invites").update({ status: "accepted" }).eq("id", inviteId);
    if (error) { toast.error(error.message); return; }
    await supabase.from("room_participants").upsert({ room_id: roomId, user_id: me });
    navigate({ to: "/room/$roomId", params: { roomId } });
  };
  const declineInvite = async (inviteId: string) => {
    await supabase.from("room_invites").update({ status: "declined" }).eq("id", inviteId);
    qc.invalidateQueries({ queryKey: ["my-invites", me] });
  };

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Group focus rooms</h1>
          <p className="text-sm text-muted-foreground">Study together with friends in real time.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" />Create room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New focus room</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room name (e.g. Calc cram)" />
              <div>
                <p className="mb-2 text-sm font-medium">Invite friends</p>
                {friends.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No friends yet. <Link to="/friends" className="underline">Add some</Link>.</p>
                ) : (
                  <ul className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                    {friends.map((f) => (
                      <li key={f.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent">
                        <Checkbox checked={selectedFriends.has(f.id)} onCheckedChange={() => toggleFriend(f.id)} />
                        <Avatar className="h-7 w-7"><AvatarImage src={f.avatar_url ?? undefined} /><AvatarFallback>{f.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="text-sm">{f.username}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter><Button onClick={createRoom}>Create & join</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {invites.length > 0 && (
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">Pending invitations</p>
          <ul className="space-y-2">
            {invites.map((i) => {
              const room = (i as { study_rooms?: { name: string; status: string } }).study_rooms;
              const inviter = inviterMap[i.inviter_id];
              if (!room || room.status !== "active") return null;
              return (
                <li key={i.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <Avatar className="h-8 w-8"><AvatarImage src={inviter?.avatar_url ?? undefined} /><AvatarFallback>{inviter?.username.slice(0, 2).toUpperCase() ?? "?"}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">from {inviter?.username ?? "…"}</p>
                  </div>
                  <Button size="sm" onClick={() => acceptInvite(i.id, i.room_id)}><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => declineInvite(i.id)}><X className="h-4 w-4" /></Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div>
        <p className="mb-3 text-sm font-medium">Your active rooms</p>
        {rooms.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-2 h-6 w-6" />
            No active rooms. Create one to study with friends.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rooms.map((r) => (
              <Link key={r.id} to="/room/$roomId" params={{ roomId: r.id }}>
                <Card className="p-4 transition hover:bg-accent">
                  <p className="font-medium">{r.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Started {new Date(r.started_at).toLocaleString()}
                    {r.owner_id === me && " · You own this room"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
