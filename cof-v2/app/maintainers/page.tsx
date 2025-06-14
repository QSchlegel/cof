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
  extractGitHubContributors, 
  extractGitLabContributors, 
  validateRepoUrl, 
  getPlatformFromUrl,
  type Contributor 
} from "@/lib/github-extractor";
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
  Package,
  Tag,
  Copy,
  Check
} from "lucide-react";
import ConnectWallet from "@/components/connect-wallet";

export default function MaintainersPage() {
  const { connected } = useWallet();
  const { toast } = useToast();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [extractedContributors, setExtractedContributors] = useState<Contributor[]>([]);
  const [showExtractionResults, setShowExtractionResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleExtractDependencies = async () => {
    if (!repositoryUrl) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        type: "destructive",
      });
      return;
    }

    if (!validateRepoUrl(repositoryUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid GitHub or GitLab repository URL",
        type: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const platform = getPlatformFromUrl(repositoryUrl);
      let contributors: Contributor[] = [];

      if (platform === 'github') {
        contributors = await extractGitHubContributors(repositoryUrl);
      } else if (platform === 'gitlab') {
        contributors = await extractGitLabContributors(repositoryUrl);
      }

      if (contributors.length === 0) {
        toast({
          title: "No Contributors Found",
          description: "No contributors.txt or CONTRIBUTORS.txt file found in the repository",
          type: "destructive",
        });
        setShowExtractionResults(false);
        return;
      }

      setExtractedContributors(contributors);
      setShowExtractionResults(true);
      toast({
        title: "Success",
        description: `Found ${contributors.length} contributors in the repository`,
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Error",
        description: "Failed to extract contributors from repository",
        type: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast({
        title: "Copied!",
        description: "Cardano address copied to clipboard",
        type: "success",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy address to clipboard",
        type: "destructive",
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
              Analyze your repository contributors and manage funding distribution based on contributors.txt file.
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
                  Analyze your repository to extract contributors information from contributors.txt
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
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleExtractDependencies}
                        className="bg-cardano-600 hover:bg-cardano-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? "Analyzing..." : "Analyze"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contributors Analysis */}
          <div>
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-cardano-50 to-slate-50 border-b border-slate-200">
                <CardTitle className="text-cardano-900">Contributors Analysis</CardTitle>
                <CardDescription className="text-slate-600">
                  View contributors and their funding allocations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {showExtractionResults ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-900">
                        Found Contributors ({extractedContributors.length})
                      </h4>
                      <div className="flex gap-2">
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

                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {extractedContributors.map((contributor, index) => {
                        // Separate core fields from dynamic fields
                        const coreFields = ['name', 'cardano_address', 'percentage'];
                        const knownOptionalFields = ['email', 'orcid'];
                        const dynamicFields = Object.keys(contributor).filter(
                          key => !coreFields.includes(key) && !knownOptionalFields.includes(key)
                        );

                        return (
                          <div key={index} className="p-4 hover:bg-slate-50 transition-colors duration-150">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-cardano-50 rounded-full flex items-center justify-center mr-3">
                                    <Users className="w-5 h-5 text-cardano-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{contributor.name}</p>
                                    {contributor.email && (
                                      <p className="text-xs text-slate-500">{contributor.email}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className="border-cardano-200 text-cardano-700 bg-cardano-50"
                                >
                                  {contributor.percentage}%
                                </Badge>
                              </div>
                              
                              <div className="pl-13 space-y-2">
                                {/* ORCID if present */}
                                {contributor.orcid && (
                                  <div className="flex items-center text-xs text-slate-600">
                                    <Shield className="w-3 h-3 mr-1" />
                                    ORCID: {contributor.orcid}
                                  </div>
                                )}
                                
                                {/* Cardano Address */}
                                <div className="flex items-center text-xs text-slate-600 break-all group">
                                  <DollarSign className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="font-mono text-xs flex-1">{contributor.cardano_address}</span>
                                  <button
                                    onClick={() => copyToClipboard(contributor.cardano_address)}
                                    className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors duration-150 opacity-0 group-hover:opacity-100"
                                    title="Copy address to clipboard"
                                  >
                                    {copiedAddress === contributor.cardano_address ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-500 hover:text-slate-700" />
                                    )}
                                  </button>
                                </div>

                                {/* Dynamic fields */}
                                {dynamicFields.map((field) => {
                                  const fieldValue = contributor[field];
                                  const isRepoField = field.toLowerCase().includes('repo') || 
                                                    String(fieldValue).includes('repo:');
                                  
                                  return (
                                    <div key={field} className="flex items-center text-xs text-slate-600">
                                      {isRepoField ? (
                                        <GitBranch className="w-3 h-3 mr-1 flex-shrink-0 text-slate-500" />
                                      ) : (
                                        <Tag className="w-3 h-3 mr-1 flex-shrink-0 text-slate-500" />
                                      )}
                                      <span className="capitalize font-medium mr-1 text-slate-700">
                                        {field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}:
                                      </span>
                                      <span className="break-all">
                                        {typeof fieldValue === 'object' 
                                          ? JSON.stringify(fieldValue) 
                                          : String(fieldValue)
                                        }
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Card */}
                    <div className="bg-cardano-50 rounded-lg p-4 mt-4">
                      <h5 className="text-sm font-medium text-cardano-900 mb-2">Funding Summary</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Total Contributors:</span>
                          <span className="font-medium ml-2">{extractedContributors.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Total Allocation:</span>
                          <span className="font-medium ml-2">
                            {extractedContributors.reduce((sum, c) => sum + c.percentage, 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-cardano-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-cardano-600" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 mb-2">No Contributors Analyzed</h4>
                    <p className="text-slate-600 mb-4">
                      Enter a repository URL and click Analyze to extract contributors from contributors.txt
                    </p>
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