import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsWidget } from "@/components/StatsWidget";
import {
  LayoutGrid,
  ListTodo,
  History,
  Trophy,
  Settings as SettingsIcon,
  Timer,
  LogOut,
  Users,
  UsersRound,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: "task" | "subject"; id: string; title: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const search = async () => {
      const q = searchQuery.toLowerCase();
      // Search tasks
      const { data: tasks } = await supabase
        .from("todos")
        .select("id, title")
        .ilike("title", `%${q}%`)
        .limit(5);
      // Search subjects
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name")
        .ilike("name", `%${q}%`)
        .limit(5);
      const results = [
        ...(tasks?.map((t) => ({ type: "task" as const, id: t.id, title: t.title })) ?? []),
        ...(subjects?.map((s) => ({ type: "subject" as const, id: s.id, title: s.name })) ?? []),
      ];
      setSearchResults(results);
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (result: { type: "task" | "subject"; id: string }) => {
    setSearchQuery("");
    setShowResults(false);
    if (result.type === "task") {
      navigate({ to: "/tasks" });
    } else {
      navigate({ to: "/subject/$subjectId", params: { subjectId: result.id } });
    }
  };

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
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="h-8 w-48 pl-8 text-sm lg:w-64"
              />
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-md border border-border bg-background p-1 shadow-lg">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    {result.type === "task" ? (
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{result.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="flex items-center gap-1">
            <NavItem to="/app" icon={LayoutGrid} label="Subjects" />
            <NavItem to="/tasks" icon={ListTodo} label="Tasks" />
            
            <NavItem to="/history" icon={History} label="History" />
            <NavItem to="/community" icon={Users} label="Community" />
            <NavItem to="/groups" icon={UsersRound} label="Groups" />
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
