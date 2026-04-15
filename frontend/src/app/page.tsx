import Link from "next/link";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 py-24 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        Phase 1 MVP
      </div>

      <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
        Describe a task. <br className="hidden sm:block" />
        Get a background agent.
      </h1>

      <p className="max-w-xl text-balance text-lg text-muted-foreground">
        AutoTasker turns natural-language descriptions into autonomous
        Worker Agents that run on a schedule — with a strict SOP, hard
        execution limits, and full execution logs.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/forge">
            Open The Forge <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/agents">
            <Bot className="h-4 w-4" /> My Agents
          </Link>
        </Button>
      </div>
    </main>
  );
}
