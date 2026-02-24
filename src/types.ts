export interface FarmingTask {
  id: string;
  username: string;
  gameName: string;
  taskName: string;
  progress: number;
  systemId: string;
  uptime: string;
  status: 'farming' | 'pending' | 'completed' | 'cancelled';
  imageUrl?: string;
}

export interface DashboardStats {
  totalAccounts: number;
  online: number;
  offline: number;
}
