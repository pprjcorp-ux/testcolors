"use client";

/**
 * Dashboard-level error boundary.
 *
 * Next.js renders this component when any Server Component beneath
 * /forge or /agents throws. Client-side errors that bubble past a
 * page-level boundary also land here.
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook into a real telemetry sink (Sentry, Datadog, etc.) here.
    console.error("dashboard.error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <CardTitle>Something broke</CardTitle>
          <CardDescription>
            The dashboard ran into an unexpected error. You can retry or head back to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              Error id: <code>{error.digest}</code>
            </p>
          )}
          <Button onClick={reset} className="w-full">
            <RefreshCcw className="h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
