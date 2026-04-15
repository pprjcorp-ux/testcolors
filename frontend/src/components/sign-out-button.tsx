"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
      <LogOut className="h-3 w-3" />
      Sign out
    </Button>
  );
}
