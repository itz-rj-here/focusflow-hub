import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 btn-royal"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FocusFlow — Study timer, to-dos, and leaderboards" },
      {
        name: "description",
        content:
          "A minimalist study timer with to-do lists, session history, and a global leaderboard. Stay in flow.",
      },
      { property: "og:title", content: "FocusFlow" },
      {
        property: "og:description",
        content:
          "A minimalist study timer with to-do lists, session history, and a global leaderboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootWithProviders,
  notFoundComponent: NotFoundComponent,
});

function RootWithProviders() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}

function Root() {
  const { actualTheme } = useTheme();
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en" className={actualTheme}>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var pref = localStorage.getItem('theme_preference');
                var theme = pref && pref !== 'system' ? pref : 'light';
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Outlet />
            <Toaster richColors theme={actualTheme} position="top-center" />
          </AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
