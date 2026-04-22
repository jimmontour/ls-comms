// In-memory database for local testing (no MongoDB/Redis needed)

interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  teams: string[];
}

interface Team {
  _id: string;
  name: string;
  owner: string;
  members: string[];
  accounts: string[];
}

interface ConnectedAccount {
  _id: string;
  userId: string;
  teamId: string;
  platform: string;
  accountId: string;
  accountName: string;
  accountImage?: string;
  accessToken: string;
  connectedAt: Date;
}

interface ScheduledPost {
  _id: string;
  teamId: string;
  createdBy: string;
  content: string;
  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  accounts: any[];
  publishedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

class MemoryDB {
  users: Map<string, User> = new Map();
  teams: Map<string, Team> = new Map();
  accounts: Map<string, ConnectedAccount> = new Map();
  posts: Map<string, ScheduledPost> = new Map();

  generateId() {
    return Math.random().toString(36).substring(7);
  }

  clear() {
    this.users.clear();
    this.teams.clear();
    this.accounts.clear();
    this.posts.clear();
  }
}

export const memoryDb = new MemoryDB();
