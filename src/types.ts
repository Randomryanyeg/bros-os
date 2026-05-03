export interface ActiveUser {
  id: string;
  username: string;
  lastSeen: string;
  currentPath: string;
  ip: string;
  userAgent?: string;
}

export interface ActionLog {
  id: number;
  socketId: string;
  username: string;
  action: string;
  details: unknown;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'idle' | 'building' | 'running' | 'error';
  url?: string;
  logs: string[];
  port: number;
}
