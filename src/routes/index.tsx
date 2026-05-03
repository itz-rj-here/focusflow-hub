import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Timer, ListChecks, Trophy, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusFlow — Deep work made simple" },
      {
        name: "description",
        content:
          "FocusFlow is a minimalist study timer with to-dos, session history, and a friendly global leaderboard.",
      },
      { property: "og:title", content: "FocusFlow — Deep work made simple" },
      {
        property: "og:description",
        content: "Track focus sessions, complete tasks, climb the leaderboard.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);

  return (
    <main className="bg-radial-glow min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Timer className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">FocusFlow</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/leaderboard">
            <Button variant="ghost" size="sm">
              Leaderboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          Minimal. Fast. Built for deep work.
        </div>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Focus better.
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Study smarter.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          A clean to-do list, a distraction-free focus timer, and a friendly leaderboard. Track
          every minute you put in — and watch the hours add up.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <GoogleSignInButton className="h-12 px-6 text-base" />
          <p className="text-xs text-muted-foreground">Free. Private by default if you want it.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            icon: ListChecks,
            title: "Plan your day",
            body: "Quick to-dos. Click one and start a focus session in a single tap.",
          },
          {
            icon: Timer,
            title: "Enter flow",
            body: "A full-screen, distraction-free stopwatch. One task. One job.",
          },
          {
            icon: BarChart3,
            title: "See progress",
            body: "Session history with charts. Watch your study hours climb.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur"
          >
            <f.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-medium">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <Trophy className="mx-auto h-6 w-6 text-primary" />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Compete (or stay private)</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Public profiles appear on the global leaderboard. Switch to private anytime — your data
          stays hidden.
        </p>
        <Link to="/leaderboard" className="mt-5 inline-block">
          <Button variant="secondary">View leaderboard</Button>
        </Link>
      </section>
    </main>
  );
}
