import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, UserPlus, Check, X, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/friends")({
  head: () => ({ meta: [{ title: "Friends — FocusFlow" }] }),
  component: FriendsPage,
});

type Profile = { id: string; username: string; avatar_url: string | null };

function FriendsPage() {
  const { user } = useAuth();
  const me = user!.id;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile-invite", me],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("invite_code,username").eq("id", me).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships", me],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("id,requester_id,addressee_id,status,created_at");
      if (error) throw error;
      return data;
    },
  });

  // Fetch related profile info
  const otherIds = Array.from(
    new Set(friendships.map((f) => (f.requester_id === me ? f.addressee_id : f.requester_id)))
  );
  const { data: otherProfiles = [] } = useQuery({
    queryKey: ["friend-profiles", otherIds.sort().join(",")],
    enabled: otherIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,avatar_url,invite_code")
        .in("id", otherIds);
      if (error) throw error;
      return data as Profile[];
    },
  });
  const profileMap = Object.fromEntries(otherProfiles.map((p) => [p.id, p]));

  useEffect(() => {
    const ch = supabase
      .channel("friendships-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => {
        qc.invalidateQueries({ queryKey: ["friendships", me] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me, qc]);

  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter((f) => f.status === "pending" && f.addressee_id === me);
  const outgoing = friendships.filter((f) => f.status === "pending" && f.requester_id === me);

  const runSearch = async () => {
    const q = search.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const { data, error } = await supabase
      .from("profiles")
      .select("id,username,avatar_url,invite_code")
      .ilike("username", `%${q}%`)
      .neq("id", me)
      .limit(10);
    if (error) { toast.error(error.message); return; }
    setSearchResults(data as Profile[]);
  };

  const sendRequest = async (otherId: string) => {
    // Check existing
    const existing = friendships.find(
      (f) => (f.requester_id === me && f.addressee_id === otherId) || (f.requester_id === otherId && f.addressee_id === me)
    );
    if (existing) {
      if (existing.status === "accepted") { toast.info("Already friends"); return; }
      if (existing.requester_id === otherId) {
        // accept it
        await acceptRequest(existing.id);
        return;
      }
      toast.info("Request already sent");
      return;
    }
    const { error } = await supabase.from("friendships").insert({ requester_id: me, addressee_id: otherId });
    if (error) { toast.error(error.message); return; }
    toast.success("Request sent");
    qc.invalidateQueries({ queryKey: ["friendships", me] });
  };

  const acceptRequest = async (id: string) => {
    const { error } = await supabase.from("friendships").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Friend added");
    qc.invalidateQueries({ queryKey: ["friendships", me] });
  };
  const declineRequest = async (id: string) => {
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["friendships", me] });
  };

  const redeemInviteCode = async () => {
    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) return;
    if (code === myProfile?.invite_code) { toast.error("That's your own code"); return; }
    const { data, error } = await supabase.from("profiles").select("id,username").eq("invite_code", code).maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("Invalid code"); return; }
    await sendRequest(data.id);
    setInviteCodeInput("");
  };

  const copyCode = () => {
    if (!myProfile?.invite_code) return;
    navigator.clipboard.writeText(myProfile.invite_code);
    toast.success("Code copied");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-sm text-muted-foreground">Connect to study together and compete on the friends leaderboard.</p>
      </div>

      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Your invite code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-sm">
              {myProfile?.invite_code ?? "…"}
            </code>
            <Button size="sm" variant="secondary" onClick={copyCode}><Copy className="h-4 w-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground">Share this code with a friend so they can add you.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Redeem a code</p>
          <div className="flex gap-2">
            <Input
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              maxLength={8}
              className="font-mono"
            />
            <Button onClick={redeemInviteCode}>Add</Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <p className="text-sm font-medium">Search by username</p>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
            placeholder="Search username…"
          />
          <Button onClick={runSearch} variant="secondary">Search</Button>
        </div>
        {searchResults.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {searchResults.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.avatar_url ?? undefined} />
                  <AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm">{p.username}</span>
                <Button size="sm" variant="secondary" onClick={() => sendRequest(p.id)}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">Friends ({accepted.length})</TabsTrigger>
          <TabsTrigger value="incoming">Incoming ({incoming.length})</TabsTrigger>
          <TabsTrigger value="outgoing">Sent ({outgoing.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card className="p-2">
            {accepted.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground"><Users className="mx-auto mb-2 h-5 w-5" />No friends yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {accepted.map((f) => {
                  const otherId = f.requester_id === me ? f.addressee_id : f.requester_id;
                  const p = profileMap[otherId];
                  if (!p) return null;
                  return (
                    <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-9 w-9"><AvatarImage src={p.avatar_url ?? undefined} /><AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <span className="flex-1 text-sm font-medium">{p.username}</span>
                      <Button size="sm" variant="ghost" onClick={() => declineRequest(f.id)}>Remove</Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="incoming">
          <Card className="p-2">
            {incoming.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No incoming requests.</p>
            ) : (
              <ul className="divide-y divide-border">
                {incoming.map((f) => {
                  const p = profileMap[f.requester_id];
                  if (!p) return null;
                  return (
                    <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-9 w-9"><AvatarImage src={p.avatar_url ?? undefined} /><AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <span className="flex-1 text-sm font-medium">{p.username}</span>
                      <Button size="sm" onClick={() => acceptRequest(f.id)}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => declineRequest(f.id)}><X className="h-4 w-4" /></Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="outgoing">
          <Card className="p-2">
            {outgoing.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No sent requests.</p>
            ) : (
              <ul className="divide-y divide-border">
                {outgoing.map((f) => {
                  const p = profileMap[f.addressee_id];
                  if (!p) return null;
                  return (
                    <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-9 w-9"><AvatarImage src={p.avatar_url ?? undefined} /><AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <span className="flex-1 text-sm font-medium">{p.username}</span>
                      <span className="text-xs text-muted-foreground">Pending</span>
                      <Button size="sm" variant="ghost" onClick={() => declineRequest(f.id)}><X className="h-4 w-4" /></Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
