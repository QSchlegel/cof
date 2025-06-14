export interface User {
  id: string;
  address: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  platform: string;
  stars: string;
  dependencies?: string[];
  monthlyFunding?: string;
  status?: string;
}

export interface FundingListProject {
  id: string;
  project: Project;
  distributionPercentage: number;
}

export interface FundingList {
  id: string;
  name: string;
  description: string;
  monthlyBudget: string;
  userId: string;
  projects: FundingListProject[];
}

export interface Transaction {
  id: string;
  amount: string;
  recipients: {
    address: string;
    amount: string;
  }[];
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
} 