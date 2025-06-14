import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/logo";
import { WalletConnection } from "@/components/wallet-connection";
import { ProjectCard } from "@/components/project-card";
import { FundingListCard } from "@/components/funding-list-card";
import { 
  Search, 
  Plus, 
  GitBranch, 
  TrendingUp, 
  Users, 
  DollarSign,
  Github,
  Shield,
  BarChart3,
  ArrowRight,
  Star,
  ExternalLink
} from "lucide-react";
import type { Project, FundingList, User } from "@/shared/types";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [extractedDependencies, setExtractedDependencies] = useState<string[]>([]);
  const [showExtractionResults, setShowExtractionResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stats
  const { data: stats } = useQuery<{
    totalFunded: string;
    projectsSupported: number;
    activeDonors: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: true,
  });

  // Fetch projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects", searchQuery, selectedPlatform],
    enabled: true,
  });

  // Fetch user's funding lists
  const { data: fundingLists = [] } = useQuery<FundingList[]>({
    queryKey: ["/api/funding-lists/user", currentUser?.id],
    enabled: !!currentUser,
  });

  // Fetch recent transactions
  const { data: recentTransactions = [] } = useQuery<any[]>({
    queryKey: ["/api/transactions/recent"],
    enabled: true,
  });

  // Extract dependencies mutation
  const extractDependenciesMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/projects/extract-dependencies", { repositoryUrl: url });
      return response.json();
    },
    onSuccess: (data: { dependencies: string[] }) => {
      setExtractedDependencies(data.dependencies);
      setShowExtractionResults(true);
      toast({
        title: "Dependencies extracted successfully",
        description: `Found ${data.dependencies.length} dependencies`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Extraction failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExtractDependencies = () => {
    if (!repositoryUrl) {
      toast({
        title: "Repository URL required",
        description: "Please enter a valid repository URL",
        variant: "destructive",
      });
      return;
    }
    extractDependenciesMutation.mutate(repositoryUrl);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Logo />
              <div>
                <h1 className="text-xl font-bold text-slate-900">COF</h1>
                <p className="text-xs text-slate-500">Cardano Open Funding</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('discover')}
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Discover
              </button>
              <button 
                onClick={() => scrollToSection('funding-lists')}
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                My Lists
              </button>
              <button 
                onClick={() => scrollToSection('maintainer')}
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Maintainers
              </button>
              <button 
                onClick={() => scrollToSection('transparency')}
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Transparency
              </button>
            </nav>

            <WalletConnection 
              currentUser={currentUser} 
              onUserChange={setCurrentUser} 
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Fund Open Source,<br />
              <span className="text-mint-500">Build the Future</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Support your favorite open-source projects with ADA donations. Create funding lists, track dependencies, and ensure maintainers get rewarded for their contributions.
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">
                  {stats?.totalFunded || "0"} ₳
                </div>
                <div className="text-blue-200">Total Funded</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">
                  {stats?.projectsSupported || "0"}
                </div>
                <div className="text-blue-200">Projects Supported</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">
                  {stats?.activeDonors || "0"}
                </div>
                <div className="text-blue-200">Active Donors</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-cardano-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors coin-shadow"
                onClick={() => scrollToSection('discover')}
              >
                Start Funding Projects
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                onClick={() => scrollToSection('maintainer')}
              >
                Claim Your Repository
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Discovery */}
      <section id="discover" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Discover Projects</h3>
            <p className="text-lg text-slate-600">Browse and search for open-source projects to support</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingProjects ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate-900 mb-2">No projects found</h4>
                <p className="text-slate-600">Try adjusting your search criteria or add a new project.</p>
              </div>
            ) : (
              projects.map((project: Project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline">
              Load More Projects
            </Button>
          </div>
        </div>
      </section>

      {/* My Funding Lists */}
      <section id="funding-lists" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">My Funding Lists</h3>
              <p className="text-lg text-slate-600">Manage your project funding portfolios</p>
            </div>
            <Button className="gradient-bg text-white hover:shadow-lg transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Create New List
            </Button>
          </div>

          {!currentUser ? (
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
              <Button className="gradient-bg text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {fundingLists.map((list: FundingList) => (
                <FundingListCard key={list.id} fundingList={list} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Maintainer Dashboard */}
      <section id="maintainer" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Maintainer Dashboard</h3>
            <p className="text-lg text-slate-600">Claim your repositories and set up dependency funding</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 cardano-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-cardano-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-2">Repository Analysis</h4>
                <p className="text-slate-600">Enter your repository URL to extract dependencies</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Repository URL</label>
                  <Input
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Supports GitHub and GitLab repositories</p>
                </div>

                <Button 
                  className="w-full gradient-bg text-white hover:shadow-lg transition-all duration-200"
                  onClick={handleExtractDependencies}
                  disabled={extractDependenciesMutation.isPending}
                >
                  {extractDependenciesMutation.isPending ? "Extracting..." : "Extract Dependencies"}
                </Button>
              </div>

              {/* Extraction Results */}
              {showExtractionResults && (
                <div className="mt-8 p-6 bg-slate-50 rounded-lg animate-slide-up">
                  <h5 className="font-medium text-slate-900 mb-4">Extracted Information</h5>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Detected Dependencies</label>
                      <div className="space-y-2">
                        {extractedDependencies.map((dep, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                            <span className="text-sm text-slate-700">{dep}</span>
                            <Input
                              type="number"
                              placeholder="%"
                              defaultValue="20"
                              className="w-16 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cardano Address for Funding</label>
                      <Input
                        type="text"
                        placeholder="addr1..."
                        className="w-full"
                      />
                    </div>

                    <Button className="w-full mint-500 text-white hover:bg-mint-600 transition-colors">
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Transparency Dashboard */}
      <section id="transparency" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Transparency Dashboard</h3>
            <p className="text-lg text-slate-600">All funding flows are public and auditable</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Funding Stats */}
            <div className="space-y-6">
              <Card className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Funding Statistics</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Distributed</span>
                    <span className="font-semibold text-slate-900">{stats?.totalFunded || "0"} ₳</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Projects</span>
                    <span className="font-semibold text-slate-900">{stats?.projectsSupported || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Donors</span>
                    <span className="font-semibold text-slate-900">{stats?.activeDonors || "0"}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Dependency Graph Visualization */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-slate-900">Dependency Flow Visualization</h4>
                  <div className="flex space-x-2">
                    <Badge variant="default">Live</Badge>
                    <Button variant="ghost" size="sm">24h</Button>
                    <Button variant="ghost" size="sm">7d</Button>
                  </div>
                </div>

                <div className="relative h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Interactive dependency graph visualization</p>
                    <p className="text-slate-400 text-xs mt-1">Shows funding flows between projects and dependencies</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h4 className="font-semibold text-slate-900">Recent Funding Transactions</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaction: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">Funding Distribution</div>
                          <div className="text-sm text-slate-500">Transaction #{transaction.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{transaction.amount} ₳</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{transaction.recipients?.length || 0} recipients</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="mint-100 text-mint-800">
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 cardano-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">COF</span>
              </div>
              <p className="text-slate-400 mb-4">Democratizing open-source funding through blockchain technology.</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-slate-400">
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">How it Works</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">For Donors</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">For Maintainers</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">API Documentation</Button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-slate-400">
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Smart Contracts</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Security Audit</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Cardano Integration</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Support</Button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Open Source</h5>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Button 
                    variant="link" 
                    className="text-slate-400 hover:text-white p-0 h-auto"
                    onClick={() => window.open("https://github.com/QSchlegel/cof", "_blank")}
                  >
                    GitHub Repository
                  </Button>
                </li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Contribute</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">License</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Roadmap</Button></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 COF - Cardano Open Funding. Open source and community-driven.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-slate-400">
              <Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto text-sm">Privacy Policy</Button>
              <Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto text-sm">Terms of Service</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
