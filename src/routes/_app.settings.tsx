import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — FocusFlow" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();
  const userId = user!.id;
  const [username, setUsername] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, visibility")
        .eq("id", userId)
        .single();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      setUsername(data.username);
      setVisibility(data.visibility as "public" | "private");
      setLoading(false);
    })();
  }, [userId]);

  const save = async () => {
    setSaving(true);
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      toast.error("Username too short");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed, visibility })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and privacy.</p>
      </div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={preference}
            onValueChange={(v) => setPreference(v as "light" | "dark" | "system")}
          >
            <SelectTrigger id="theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light Mode</SelectItem>
              <SelectItem value="dark">Dark Mode</SelectItem>
              <SelectItem value="system">System Preferences</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose your preferred color scheme.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={32}
          />
          <p className="text-xs text-muted-foreground">
            Shown on the leaderboard if your profile is public.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="font-medium">Public profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When on, you appear on the global leaderboard. When off, your study data is hidden
              from everyone except you.
            </p>
          </div>
          <Switch
            checked={visibility === "public"}
            onCheckedChange={(c) => setVisibility(c ? "public" : "private")}
          />
        </div>

        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium">Email</p>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </Card>
    </div>
  );
}
