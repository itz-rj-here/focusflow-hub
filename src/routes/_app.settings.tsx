import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Trash2, Download, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — FocusFlow" }] }),
  component: SettingsPage,
});

type Profile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  visibility: "public" | "private";
  allow_friend_requests: boolean;
  default_focus_minutes: number;
  focus_sound: string;
};

type Subject = { id: string; name: string; color_code: string };

const FOCUS_PRESETS = [15, 25, 45, 60, 90];
const SOUND_OPTIONS = [
  { value: "silent", label: "Silent" },
  { value: "white_noise", label: "White Noise" },
  { value: "rain", label: "Rain" },
  { value: "lofi", label: "Lo-Fi" },
];

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const userId = user!.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    (async () => {
      const [profileRes, subjectsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "username, display_name, avatar_url, visibility, allow_friend_requests, default_focus_minutes, focus_sound",
          )
          .eq("id", userId)
          .single(),
        supabase
          .from("subjects")
          .select("id, name, color_code")
          .eq("user_id", userId)
          .order("name"),
      ]);
      if (profileRes.error) {
        toast.error(profileRes.error.message);
      } else {
        setProfile(profileRes.data as Profile);
      }
      if (subjectsRes.data) setSubjects(subjectsRes.data as Subject[]);
      setLoading(false);
    })();
  }, [userId]);

  const persist = (patch: Partial<Profile>, key: string) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
    if (debounceRef.current[key]) clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(async () => {
      setSavingField(key);
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      setSavingField(null);
      if (error) toast.error(error.message);
      else toast.success("Saved", { duration: 1500 });
    }, 500);
  };

  const updateSubject = async (id: string, patch: Partial<Subject>) => {
    setSubjects((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const { error } = await supabase.from("subjects").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubjects((s) => s.filter((x) => x.id !== id));
    toast.success("Subject deleted");
  };

  const exportCSV = async () => {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("started_at, ended_at, duration_seconds, task_title, notes, subjects(name)")
      .eq("user_id", userId)
      .eq("saved", true)
      .order("started_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    const rows = (data ?? []).map((s: any) => [
      s.subjects?.name ?? "",
      s.task_title,
      s.started_at,
      s.ended_at ?? "",
      Math.round((s.duration_seconds ?? 0) / 60),
      s.notes ?? "",
    ]);
    const csv = [
      ["Subject", "Task", "Started", "Ended", "Minutes", "Notes"].join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focusflow-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} sessions`);
  };

  const deleteAllHistory = async () => {
    const { error } = await supabase.from("study_sessions").delete().eq("user_id", userId);
    if (error) toast.error(error.message);
    else toast.success("All focus history deleted");
  };

  const initials = useMemo(() => {
    const name = profile?.display_name || profile?.username || user?.email || "U";
    return name.slice(0, 2).toUpperCase();
  }, [profile, user]);

  if (loading || !profile)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, privacy, and focus preferences.
        </p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Profile</h2>
        </div>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} alt="Profile picture" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                value={profile.display_name ?? ""}
                placeholder={profile.username}
                onChange={(e) => persist({ display_name: e.target.value }, "display_name")}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Synced from Google. Edit to override how others see your name.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) =>
                  persist({ username: e.target.value.toLowerCase().replace(/\s/g, "_") }, "username")
                }
                maxLength={32}
              />
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold">Privacy</h2>
        <div className="space-y-3">
          <ToggleRow
            label="Public profile"
            help="When on, you appear on the global leaderboard. When off, your study data is hidden from everyone except you."
            checked={profile.visibility === "public"}
            onChange={(c) =>
              persist({ visibility: c ? "public" : "private" }, "visibility")
            }
            saving={savingField === "visibility"}
          />
          <ToggleRow
            label="Allow friend requests"
            help="Let other users find you via invite code and send connection requests."
            checked={profile.allow_friend_requests}
            onChange={(c) => persist({ allow_friend_requests: c }, "allow_friend_requests")}
            saving={savingField === "allow_friend_requests"}
          />
        </div>
      </Card>

      {/* Focus preferences */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold">Focus preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Default focus duration</Label>
            <Select
              value={String(profile.default_focus_minutes)}
              onValueChange={(v) =>
                persist({ default_focus_minutes: Number(v) }, "default_focus_minutes")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_PRESETS.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Focus mode sound</Label>
            <Select
              value={profile.focus_sound}
              onValueChange={(v) => persist({ focus_sound: v }, "focus_sound")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOUND_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold">Appearance</h2>
        <div className="space-y-1.5">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={preference}
            onValueChange={(v) => setPreference(v as "light" | "dark" | "system")}
          >
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark Mode</SelectItem>
              <SelectItem value="light">Light Mode</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Subjects & data */}
      <Accordion type="multiple" className="space-y-3">
        <AccordionItem value="subjects" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold">
            Manage subjects ({subjects.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pb-2">
              {subjects.length === 0 && (
                <p className="text-sm text-muted-foreground">No subjects yet.</p>
              )}
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-md border border-border p-2"
                >
                  <input
                    type="color"
                    value={s.color_code}
                    onChange={(e) => updateSubject(s.id, { color_code: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                    aria-label="Subject color"
                  />
                  <Input
                    value={s.name}
                    onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSubject(s.id)}
                    aria-label="Delete subject"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data" className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold">
            Data portability
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Export study data</p>
                  <p className="text-xs text-muted-foreground">
                    Download all your saved focus sessions as a CSV file.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Delete all focus history</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove every focus session. Cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all focus history?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete every saved focus session from your
                        account. Your subjects and tasks will remain.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAllHistory}>
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="p-6">
        <Button variant="outline" onClick={() => signOut()} className="w-full">
          Sign out
        </Button>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  help,
  checked,
  onChange,
  saving,
}: {
  label: string;
  help: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{help}</p>
      </div>
      <div className="flex items-center gap-2">
        {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
}
