import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Copy, Check, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/groups")({
  head: () => ({ meta: [{ title: "Study Groups — FocusFlow" }] }),
  component: GroupsPage,
});

interface UserGroup {
  group_id: string;
  name: string;
  description: string | null;
  invite_code: string;
  role: string;
  joined_at: string;
  member_count: number;
}

function GroupsPage() {
  const { user } = useAuth();
  const userId = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["user-groups", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_groups");
      if (error) throw error;
      return data as UserGroup[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: group, error } = await supabase
        .from("study_groups")
        .insert({
          name: data.name,
          description: data.description || null,
          invite_code: inviteCode,
          created_by: userId,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: userId,
        role: "admin",
      });
      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-groups", userId] });
      setCreateOpen(false);
      toast.success("Group created!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("join_group_by_code", {
        p_invite_code: joinCode.toUpperCase(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-groups", userId] });
      setJoinOpen(false);
      setJoinCode("");
      toast.success("Joined group!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Study Groups</h1>
          <p className="text-sm text-muted-foreground">
            Join or create study groups to study together.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LogIn className="mr-1.5 h-4 w-4" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Group</DialogTitle>
                <DialogDescription>
                  Enter the invite code shared by a group member.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (joinCode.trim()) joinGroup.mutate();
                }}
              >
                <div className="space-y-4">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter invite code"
                    className="uppercase tracking-widest"
                    autoFocus
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={!joinCode.trim() || joinGroup.isPending}>
                    Join
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Group</DialogTitle>
              </DialogHeader>
              <CreateGroupForm
                onSubmit={(data) => createGroup.mutate(data)}
                isPending={createGroup.isPending}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : groups.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No groups yet. Create or join one to get started!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.group_id}
              group={group}
              copiedCode={copiedCode}
              onCopyCode={copyCode}
              onViewGroup={() =>
                navigate({ to: "/groups/$groupId", params: { groupId: group.group_id } })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateGroupForm({
  onSubmit,
  isPending,
  onCancel,
}: {
  onSubmit: (data: { name: string; description: string }) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit({ name: name.trim(), description });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Group Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Math Study Squad"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's your group about?"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isPending}>
          Create
        </Button>
      </DialogFooter>
    </form>
  );
}

function GroupCard({
  group,
  copiedCode,
  onCopyCode,
  onViewGroup,
}: {
  group: UserGroup;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onViewGroup: () => void;
}) {
  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    moderator: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{group.name}</h3>
          {group.description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{group.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {group.role}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {group.member_count} {group.member_count === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onViewGroup}>
          View
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onCopyCode(group.invite_code)}
          aria-label="Copy invite code"
        >
          {copiedCode === group.invite_code ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Invite code: <span className="font-mono tracking-widest">{group.invite_code}</span>
      </p>
    </Card>
  );
}
