import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Users, UsersRound, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/community")({
  head: () => ({ meta: [{ title: "Community — FocusFlow" }] }),
  component: CommunityHub,
});

function CommunityHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
        <p className="text-sm text-muted-foreground">
          Study together with friends, join groups, and start live focus parties.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <HubCard
          to="/friends"
          icon={Users}
          title="Friends"
          desc="Connect 1-to-1, chat, and add via invite codes."
        />
        <HubCard
          to="/groups"
          icon={UsersRound}
          title="Groups"
          desc="Permanent communities with shared chat."
        />
        <HubCard
          to="/rooms"
          icon={Sparkles}
          title="Parties"
          desc="Temporary live focus rooms with synced timers."
        />
      </div>
    </div>
  );
}

function HubCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to}>
      <Card className="h-full p-5 transition hover:bg-accent">
        <Icon className="mb-3 h-5 w-5 text-primary" />
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </Card>
    </Link>
  );
}
