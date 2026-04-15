import { ForgeChat } from "@/components/forge-chat";

export default function ForgePage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">The Forge</h1>
        <p className="text-sm text-muted-foreground">
          Describe a repetitive task. The Architect will check feasibility,
          design an SOP, and save it as a draft agent.
        </p>
      </header>
      <ForgeChat />
    </div>
  );
}
