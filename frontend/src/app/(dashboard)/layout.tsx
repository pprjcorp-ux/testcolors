import Link from "next/link";
import type { Route } from "next";
import { Bot, Hammer, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { href: "/forge", label: "The Forge", icon: Hammer },
  { href: "/agents", label: "My Agents", icon: Bot },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold tracking-tight">
            AutoTasker
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 text-xs text-muted-foreground">
          Phase 1 MVP · v0.1.0
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
