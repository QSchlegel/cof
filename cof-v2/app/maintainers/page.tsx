'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFundingStore } from "@/store/use-funding-store";
import { useWallet } from "@meshsdk/react";
import { Header } from "@/components/header";
import { 
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
  Shield,
  Filter,
  Download,
  Package
} from "lucide-react";
import ConnectWallet from "@/components/connect-wallet";

export default function MaintainersPage() {
  const { connected } = useWallet();
  const { toast } = useToast();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [extractedDependencies, setExtractedDependencies] = useState<Array<{
    name: string;
    version: string;
    type: string;
  }>>([]);
  const [showExtractionResults, setShowExtractionResults] = useState(false);

  const handleExtractDependencies = async () => {
    if (!repositoryUrl) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock dependency extraction
      const mockDependencies = [
        { name: "react", version: "^18.2.0", type: "dependencies" },
        { name: "next", version: "^13.4.0", type: "dependencies" },
        { name: "typescript", version: "^5.0.0", type: "devDependencies" },
        { name: "tailwindcss", version: "^3.3.0", type: "devDependencies" },
      ];

      setExtractedDependencies(mockDependencies);
      setShowExtractionResults(true);
      toast({
        title: "Success",
        description: "Dependencies extracted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract dependencies",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-cardano-600 to-cardano-700 text-white py-16 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Maintainer Dashboard</h1>
            <p className="text-lg text-cardano-100 max-w-2xl mx-auto">
              Analyze your repository dependencies and manage funding distribution for your project's dependencies.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Repository Analysis */}
          <div>
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-cardano-50 to-slate-50 border-b border-slate-200">
                <CardTitle className="text-cardano-900">Repository Analysis</CardTitle>
                <CardDescription className="text-slate-600">
                  Analyze your repository to extract dependencies and funding information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="repository" className="block text-sm font-medium text-slate-700 mb-1">
                      Repository URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="repository"
                        placeholder="https://github.com/username/repo"
                        value={repositoryUrl}
                        onChange={(e) => setRepositoryUrl(e.target.value)}
                        className="border-slate-200 focus:border-cardano-500 focus:ring-cardano-500"
                      />
                      <Button 
                        onClick={handleExtractDependencies}
                        className="bg-cardano-600 hover:bg-cardano-700 text-white"
                      >
                        Analyze
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dependency Analysis */}
          <div>
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-cardano-50 to-slate-50 border-b border-slate-200">
                <CardTitle className="text-cardano-900">Dependency Analysis</CardTitle>
                <CardDescription className="text-slate-600">
                  View and manage your project's dependencies
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {showExtractionResults ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-900">Extracted Dependencies</h4>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-slate-200 hover:bg-slate-50 hover:text-cardano-600 hover:border-cardano-200"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-slate-200 hover:bg-slate-50 hover:text-cardano-600 hover:border-cardano-200"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {extractedDependencies.map((dep, index) => (
                        <div key={index} className="p-4 hover:bg-slate-50 transition-colors duration-150">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-cardano-50 rounded-full flex items-center justify-center mr-3">
                                <Package className="w-4 h-4 text-cardano-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{dep.name}</p>
                                <p className="text-xs text-slate-500">Version {dep.version}</p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${dep.type === 'dependencies' 
                                  ? 'border-cardano-200 text-cardano-700 bg-cardano-50' 
                                  : 'border-slate-200 text-slate-700 bg-slate-50'
                                }
                              `}
                            >
                              {dep.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-cardano-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-cardano-600" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 mb-2">No Dependencies Analyzed</h4>
                    <p className="text-slate-600 mb-4">Enter a repository URL and click Analyze to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 