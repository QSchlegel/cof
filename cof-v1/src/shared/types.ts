export interface User {
  id: string;
  address: string;
  name?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  platform: 'github' | 'gitlab';
  dependencies: string[];
  fundingAddress: string;
  totalFunded: string;
  contributors: number;
}

export interface FundingList {
  id: string;
  name: string;
  description: string;
  projects: Project[];
  totalFunded: string;
  createdAt: string;
  updatedAt: string;
} 