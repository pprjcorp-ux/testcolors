import { AgentsTable } from "@/components/agents-table";

export default function AgentsPage() {
  return (
    <div className="flex flex-col">
      <header className="border-b px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">My Agents</h1>
        <p className="text-sm text-muted-foreground">
          Background Worker Agents you've created with The Forge.
        </p>
      </header>
      <div className="p-8">
        <AgentsTable />
      </div>
    </div>
  );
}
