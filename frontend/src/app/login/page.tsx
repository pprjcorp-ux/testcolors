import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getCurrentUserId } from "@/lib/supabase-server";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const userId = await getCurrentUserId();
  if (userId) {
    redirect(next ?? "/forge");
  }

  return (
    <main className="container flex min-h-screen items-center justify-center py-12">
      <LoginForm next={next ?? "/forge"} />
    </main>
  );
}
