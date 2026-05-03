import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/lib/auth";
import { Timer } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — FocusFlow" },
      {
        name: "description",
        content: "Sign in to FocusFlow with Google to track your study sessions.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);

  return (
    <main className="bg-radial-glow grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl card-royal">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Timer className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">FocusFlow</span>
        </Link>
        <h1 className="text-center text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to continue your focus streak.
        </p>
        <div className="mt-6">
          <GoogleSignInButton className="w-full h-11" />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to be awesome at studying.
        </p>
      </div>
    </main>
  );
}
