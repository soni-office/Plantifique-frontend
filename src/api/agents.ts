import type { Agent } from '../types/agent';

const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Order Sync Agent',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'agent-2',
    name: 'Inventory Monitor Agent',
    status: 'inactive',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

export const agentsApi = {
  async listAgents() {
    return Promise.resolve(mockAgents);
  },
};
