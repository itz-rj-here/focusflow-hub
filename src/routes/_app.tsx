import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  ListTodo,
  History,
  Trophy,
  Settings as SettingsIcon,
  Timer,
  LogOut,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/app" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Timer className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">FocusFlow</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/app" icon={LayoutGrid} label="Subjects" />
            <NavItem to="/tasks" icon={ListTodo} label="Tasks" />
            <NavItem to="/groups" icon={Users} label="Groups" />
            <NavItem to="/history" icon={History} label="History" />
            <NavItem to="/friends" icon={Users} label="Friends" />
            <NavItem to="/rooms" icon={Users2} label="Rooms" />
            <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="ml-2"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-accent text-accent-foreground" }}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
