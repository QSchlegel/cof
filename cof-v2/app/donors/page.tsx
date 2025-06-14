'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFundingStore } from "@/store/use-funding-store";
import { useWallet } from "@meshsdk/react";
import { Header } from "@/components/header";
import { 
  Plus,
  Trash2,
  Search,
  Github,
  Gitlab,
  GitFork,
  Star,
  Users,
  ArrowRight,
  BarChart3,
  Network,
  Settings,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users2,
  GitBranch,
  Filter,
  Download
} from "lucide-react";
import type { FundingList, FundingListProject, Project } from "@/shared/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FundingListCard } from "@/components/funding-list-card";
import ConnectWallet from "@/components/connect-wallet";

export default function DonorsPage() {
  const { connected, wallet } = useWallet();
  const { 
    lists: fundingLists,
    isLoading: isFundingListsLoading,
    error: fundingListsError,
    fetchLists,
    createList,
    updateList,
    deleteList
  } = useFundingStore();
  const { toast } = useToast();
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListBudget, setNewListBudget] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch funding lists when wallet is connected
  useEffect(() => {
    if (connected && wallet && !hasInitialized) {
      wallet.getUsedAddresses().then(addresses => {
        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          fetchLists(address).then(() => {
            // If no lists exist, create a default one
            if (fundingLists.length === 0) {
              createList({
                name: "My Funding List",
                description: "Default funding list",
                monthlyBudget: "100",
                userId: address,
                projects: [] // Empty array since we don't have any projects yet
              }).then(() => {
                toast({
                  title: "Welcome!",
                  description: "Created your first funding list. You can now start adding projects.",
                });
                setHasInitialized(true);
              }).catch((error: Error) => {
                console.error("Failed to create funding list:", error);
                toast({
                  title: "Error",
                  description: "Failed to create funding list. Please try again.",
                  type: "destructive"
                });
              });
            } else {
              setHasInitialized(true);
            }
          });
        }
      });
    }
  }, [connected, wallet, fetchLists, createList, toast, hasInitialized]);

  // Calculate aggregated funding distribution
  const calculateAggregatedDistribution = () => {
    const projectTotals: Record<string, { total: number; count: number }> = {};
    
    fundingLists.forEach((list: FundingList) => {
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
        const project = projects.find(p => p.id === id);
        if (!project) return null;
        
        return {
          ...project,
          averageAllocation: (total / count).toFixed(2),
          totalAllocation: total.toFixed(2),
          usageCount: count
        };
      })
      .filter((project): project is NonNullable<typeof project> => project !== null);
  };

  const aggregatedProjects = calculateAggregatedDistribution();

  // Calculate total monthly budget
  const totalMonthlyBudget = aggregatedProjects.reduce((sum, p) => sum + parseFloat(p.averageAllocation), 0).toFixed(2);
  
  // Calculate average distribution
  const averageDistribution = aggregatedProjects.length > 0
    ? (aggregatedProjects.reduce((sum, p) => sum + p.usageCount, 0) / aggregatedProjects.length).toFixed(1)
    : "0.0";

  // Handler to create a new funding list
  const handleCreateList = async () => {
    if (!connected || !wallet) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a funding list.",
        type: "destructive"
      });
      return;
    }

    const addresses = await wallet.getUsedAddresses();
    if (!addresses || addresses.length === 0) {
      toast({
        title: "Error",
        description: "Could not get wallet address.",
        type: "destructive"
      });
      return;
    }

    const newList: Omit<FundingList, 'id'> = {
      name: newListName,
      description: newListDescription,
      monthlyBudget: newListBudget,
      userId: addresses[0],
      projects: []
    };

    await createList(newList);
    setShowCreateList(false);
    setNewListName("");
    setNewListDescription("");
    setNewListBudget("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!connected ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">Connect your wallet</h4>
            <p className="text-slate-600 mb-4">Connect your Cardano wallet to create and manage funding lists.</p>
          </Card>
        ) : fundingLists.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">No funding lists yet</h4>
            <p className="text-slate-600 mb-4">Create your first funding list to start supporting projects.</p>
            <Button 
              className="gradient-bg text-white"
              onClick={() => setShowCreateList(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First List
            </Button>
          </Card>
        ) : (
          <>
            {/* Individual Funding Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {fundingLists.map((list: FundingList) => (
                <FundingListCard key={list.id} fundingList={list} />
              ))}
            </div>

            {/* Aggregated View */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Aggregated Funding</h3>
                  <p className="text-slate-600">Overview of all projects across your funding lists</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Total Monthly Budget</p>
                      <p className="text-2xl font-bold text-slate-900">{totalMonthlyBudget} ₳</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Projects Supported</p>
                      <p className="text-2xl font-bold text-slate-900">{aggregatedProjects.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Avg. Lists per Project</p>
                      <p className="text-2xl font-bold text-slate-900">{averageDistribution}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Project</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total Allocation</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Avg. per List</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Lists</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aggregatedProjects.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">
                              No projects in funding lists yet
                            </td>
                          </tr>
                        ) : (
                          aggregatedProjects.map((project) => (
                            <tr key={project.id} className="border-b border-slate-100">
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                    <GitBranch className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{project.name}</p>
                                    <p className="text-xs text-slate-500">{project.repository}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-slate-900">{project.totalAllocation} ₳</td>
                              <td className="py-4 px-4 text-sm text-slate-900">{project.averageAllocation} ₳</td>
                              <td className="py-4 px-4">
                                <Badge variant="secondary">{project.usageCount} lists</Badge>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Create List Dialog */}
      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Funding List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <Input
                type="text"
                placeholder="My Funding List"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Input
                type="text"
                placeholder="Description of your funding list"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Budget (₳)</label>
              <Input
                type="number"
                placeholder="100"
                value={newListBudget}
                onChange={(e) => setNewListBudget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateList(false)}>Cancel</Button>
            <Button 
              className="gradient-bg text-white"
              onClick={handleCreateList}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 