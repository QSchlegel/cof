import { create } from 'zustand';
import type { Project, FundingList, FundingListProject } from '@/shared/types';

interface AggregatedProject extends Project {
  averageAllocation: string;
  totalAllocation: string;
  usageCount: number;
}

interface FundingStore {
  // State
  lists: FundingList[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedPlatform: string;
  stats: {
    totalFunded: string;
    projectsSupported: number;
    activeDonors: number;
  };
  recentTransactions: any[];

  // Computed
  aggregatedProjects: AggregatedProject[];
  totalMonthlyBudget: string;
  averageDistribution: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedPlatform: (platform: string) => void;
  fetchLists: (userId: string) => Promise<void>;
  createList: (list: Omit<FundingList, 'id'>) => Promise<void>;
  updateList: (list: FundingList) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addProjectToList: (listId: string, project: Project, distributionPercentage: number) => Promise<void>;
  removeProjectFromList: (listId: string, projectId: string) => Promise<void>;
  updateProjectDistribution: (listId: string, projectId: string, percentage: number) => Promise<void>;
  extractDependencies: (repositoryUrl: string) => Promise<string[]>;
}

export const useFundingStore = create<FundingStore>((set, get) => ({
  // Initial state
  lists: [],
  projects: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedPlatform: 'all',
  stats: {
    totalFunded: '0',
    projectsSupported: 0,
    activeDonors: 0
  },
  recentTransactions: [],

  // Computed values
  get aggregatedProjects() {
    const projectTotals: Record<string, { total: number; count: number }> = {};
    
    get().lists.forEach((list: FundingList) => {
      const totalBudget = parseFloat(list.monthlyBudget);
      list.projects.forEach((fundingProject: FundingListProject) => {
        const projectId = fundingProject.project.id;
        if (!projectTotals[projectId]) {
          projectTotals[projectId] = { total: 0, count: 0 };
        }
        // Add this list's contribution to the project's total
        projectTotals[projectId].total += (totalBudget * fundingProject.distributionPercentage) / 100;
        projectTotals[projectId].count += 1;
      });
    });

    // Calculate averages and format for display
    return Object.entries(projectTotals)
      .map(([id, { total, count }]) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return null;
        
        return {
          ...project,
          averageAllocation: (total / count).toFixed(2),
          totalAllocation: total.toFixed(2),
          usageCount: count
        };
      })
      .filter((project): project is AggregatedProject => project !== null);
  },

  get totalMonthlyBudget() {
    return get().aggregatedProjects
      .reduce((sum, p) => sum + parseFloat(p.averageAllocation), 0)
      .toFixed(2);
  },

  get averageDistribution() {
    const projects = get().aggregatedProjects;
    return projects.length > 0
      ? (projects.reduce((sum, p) => sum + p.usageCount, 0) / projects.length).toFixed(1)
      : "0.0";
  },

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  fetchLists: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      const lists = get().lists.filter(list => list.userId === userId);
      set({ lists, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch funding lists', isLoading: false });
    }
  },

  createList: async (list) => {
    set({ isLoading: true, error: null });
    try {
      const newList: FundingList = {
        ...list,
        id: Date.now().toString(),
      };
      set(state => ({ lists: [...state.lists, newList], isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to create funding list', isLoading: false });
    }
  },

  updateList: async (list) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        lists: state.lists.map(l => l.id === list.id ? list : l),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update funding list', isLoading: false });
    }
  },

  deleteList: async (id) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        lists: state.lists.filter(list => list.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete funding list', isLoading: false });
    }
  },

  addProjectToList: async (listId, project, distributionPercentage) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        lists: state.lists.map(list => {
          if (list.id === listId) {
            const newProject: FundingListProject = {
              id: Date.now().toString(),
              project,
              distributionPercentage
            };
            return {
              ...list,
              projects: [...list.projects, newProject]
            };
          }
          return list;
        }),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to add project to list', isLoading: false });
    }
  },

  removeProjectFromList: async (listId, projectId) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        lists: state.lists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              projects: list.projects.filter(p => p.project.id !== projectId)
            };
          }
          return list;
        }),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to remove project from list', isLoading: false });
    }
  },

  updateProjectDistribution: async (listId, projectId, percentage) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        lists: state.lists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              projects: list.projects.map(p => 
                p.project.id === projectId 
                  ? { ...p, distributionPercentage: percentage }
                  : p
              )
            };
          }
          return list;
        }),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update project distribution', isLoading: false });
    }
  },

  extractDependencies: async (repositoryUrl) => {
    set({ isLoading: true, error: null });
    try {
      // Mock dependency extraction
      const dependencies = ['react', 'react-dom', 'typescript'];
      set({ isLoading: false });
      return dependencies;
    } catch (error) {
      set({ error: 'Failed to extract dependencies', isLoading: false });
      return [];
    }
  }
})); 