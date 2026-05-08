import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, UsersRound, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/groups")({
  head: () => ({ meta: [{ title: "Groups — FocusFlow" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { user } = useAuth();
  const me = user!.id;
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id,name,description,owner_id,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-group-memberships", me],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", me);
      if (error) throw error;
      return data.map((r) => r.group_id);
    },
  });
  const memberSet = new Set(myMemberships);

  const createGroup = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("groups").insert({
      owner_id: me,
      name: name.trim(),
      description: description.trim() || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Group created");
    setName("");
    setDescription("");
    setCreating(false);
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["my-group-memberships", me] });
  };

  const join = async (groupId: string) => {
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: me });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-group-memberships", me] });
  };

  const leave = async (groupId: string) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", me);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-group-memberships", me] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
          <p className="text-sm text-muted-foreground">
            Permanent study communities with group-wide chat.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>

      {creating && (
        <Card className="space-y-3 p-4">
          <Input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={createGroup}>
              Create
            </Button>
          </div>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <UsersRound className="mx-auto mb-2 h-5 w-5" />
          No groups yet — create the first one.
        </Card>
      ) : (
        <ul className="space-y-2">
          {groups.map((g) => {
            const isMember = memberSet.has(g.id);
            return (
              <li key={g.id}>
                <Card className="flex items-center gap-3 p-4">
                  <div className="flex-1">
                    <Link
                      to="/group/$groupId"
                      params={{ groupId: g.id }}
                      className="font-medium hover:underline"
                    >
                      {g.name}
                    </Link>
                    {g.description && (
                      <p className="text-xs text-muted-foreground">{g.description}</p>
                    )}
                  </div>
                  {isMember ? (
                    <>
                      <Link to="/group/$groupId" params={{ groupId: g.id }}>
                        <Button size="sm" variant="secondary">
                          Open
                        </Button>
                      </Link>
                      {g.owner_id !== me && (
                        <Button size="sm" variant="ghost" onClick={() => leave(g.id)}>
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button size="sm" onClick={() => join(g.id)}>
                      <LogIn className="mr-1 h-4 w-4" /> Join
                    </Button>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
