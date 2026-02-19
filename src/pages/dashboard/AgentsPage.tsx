import { useEffect, useState } from "react";
import { agentsApi } from "../../api/agents";
import type { Agent } from "../../types/agent";
import { toast } from "../../hooks/useToast";

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const items = await agentsApi.listAgents();
        setAgents(items);
      } catch {
        toast({ title: "Failed to load agents", variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    void loadAgents();
  }, []);

  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Agents</h2>
        <p className="mt-1 text-slate-600">
          Your created agents will be displayed here.
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-slate-500">No agents created yet.</p>
        ) : (
          <ul className="space-y-3">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className="rounded-md border border-slate-200 p-4"
              >
                <p className="text-lg font-semibold text-slate-900">
                  {agent.name}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Created: {new Date(agent.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
