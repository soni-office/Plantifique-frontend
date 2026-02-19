export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
