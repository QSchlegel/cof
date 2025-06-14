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
  fetchDependenciesFromBackend,
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

// Gemini API function
async function extractDependenciesWithGemini(backendResponse: string): Promise<string[]> {
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error("AI analysis not configured");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extract only the dependency names from the following repository analysis data. Return them as a simple JSON array of strings, with just the package/library names (no versions, no descriptions). Only include actual dependencies, not tools or build artifacts.

Repository data:
${backendResponse}

Return ONLY a JSON array of strings like: ["dependency1", "dependency2", "dependency3"]`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Analysis API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("No response from analysis API");
    }

    // Extract JSON array from the response
    const jsonMatch = generatedText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("No JSON array found in analysis response");
    }

    const dependencies = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(dependencies)) {
      throw new Error("Analysis response is not an array");
    }

    return dependencies.filter(dep => typeof dep === 'string' && dep.trim().length > 0);
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to extract dependencies from analysis');
  }
}

export default function MaintainersPage() {
  const { connected } = useWallet();
  const { toast } = useToast();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [extractedContributors, setExtractedContributors] = useState<Contributor[]>([]);
  const [extractedDependencies, setExtractedDependencies] = useState<string[]>([]);
  const [showExtractionResults, setShowExtractionResults] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
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
        console.log('🔍 Extracting GitHub contributors from:', repositoryUrl);
        contributors = await extractGitHubContributors(repositoryUrl);
        console.log('📄 GitHub extraction results:', contributors);
      } else if (platform === 'gitlab') {
        console.log('🔍 Extracting GitLab contributors from:', repositoryUrl);
        contributors = await extractGitLabContributors(repositoryUrl);
        console.log('📄 GitLab extraction results:', contributors);
      }

      console.log('✅ Total contributors found:', contributors.length);
      
      if (contributors.length === 0) {
        console.log('No contributors.txt found, extracting repository content for analysis...');
        const backendResult = await fetchDependenciesFromBackend(repositoryUrl);
        
        console.log('Backend result:', backendResult);
        
        try {
          // Extract dependencies using AI analysis
          const dependencies = await extractDependenciesWithGemini(backendResult);
          
          if (dependencies.length > 0) {
            setExtractedDependencies(dependencies);
            setShowDependencies(true);
            setShowExtractionResults(false);
            toast({
              title: "Project Analysis Complete",
              description: `Your project needs funding! Found ${dependencies.length} dependencies that should be included in your contributors.txt file.`,
            });
          } else {
            toast({
              title: "No Dependencies Found",
              description: "No dependencies could be extracted from the repository analysis",
              type: "destructive",
            });
            setShowExtractionResults(false);
            setShowDependencies(false);
          }
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          toast({
            title: "Analysis Error",
            description: "Failed to analyze project dependencies. Please try again.",
            type: "destructive",
          });
          setShowExtractionResults(false);
          setShowDependencies(false);
        }
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

          {!showExtractionResults && !showDependencies && (
            <div>
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-cardano-50 to-slate-50 border-b border-slate-200">
                  <CardTitle className="text-cardano-900">Analysis Overview</CardTitle>
                  <CardDescription className="text-slate-600">
                    What happens when you analyze a repository
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-cardano-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-cardano-600" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 mb-3">Repository Analysis</h4>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Analyze your repository contributors and manage funding distribution based on contributors.txt file.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showExtractionResults && (
            <div>
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-cardano-50 to-slate-50 border-b border-slate-200">
                  <CardTitle className="text-cardano-900">Contributors Analysis</CardTitle>
                  <CardDescription className="text-slate-600">
                    View contributors and their funding allocations
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
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
                                {contributor.orcid && (
                                  <div className="flex items-center text-xs text-slate-600">
                                    <Shield className="w-3 h-3 mr-1" />
                                    ORCID: {contributor.orcid}
                                  </div>
                                )}
                                
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
                </CardContent>
              </Card>
            </div>
          )}
          
          {showDependencies && (
            <div>
              <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                  <CardTitle className="text-orange-900 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Your Project Needs Funding!
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Since you don't have a contributors.txt file, your project needs to participate in funding these dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-orange-900 mb-2">📋 Why Your Project Needs This</h4>
                      <p className="text-sm text-orange-800 mb-3">
                        Your project relies on these dependencies but doesn't have a contributors.txt file. To ensure sustainable funding for the open source ecosystem, your project should contribute to funding these dependencies.
                      </p>
                      <p className="text-sm text-orange-800">
                        Create a contributors.txt file to define how funding should be distributed among your team and the dependencies you use.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-3">
                        📦 Dependencies Found ({extractedDependencies.length})
                      </h4>
                      
                      <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                        {extractedDependencies.map((dependency, index) => (
                          <div key={index} className="p-3 hover:bg-slate-50 transition-colors duration-150">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-cardano-50 rounded-full flex items-center justify-center mr-3">
                                <Package className="w-4 h-4 text-cardano-600" />
                              </div>
                              <span className="text-sm font-medium text-slate-900">{dependency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-cardano-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-cardano-900 mb-3">📝 Sample contributors.txt File</h5>
                      <div className="bg-white rounded border border-cardano-200 p-4 font-mono text-xs overflow-x-auto">
                        <pre className="text-slate-700">
{`[
  {
    "name": "Your Name",
    "email": "your.email@example.com",
    "orcid": "0000-0000-0000-0000",
    "cardano_address": "addr1q9xyz...your_address",
    "percentage": 40
  },
  {
    "name": "Team Member",
    "email": "team@example.com",
    "cardano_address": "addr1q8abc...team_address",
    "percentage": 30
  },${extractedDependencies.slice(0, 3).map((dep, index) => `
  {
    "name": "repo:${dep}",
    "cardano_address": "addr1q${index + 5}repo...${dep.slice(0, 4)}",
    "percentage": ${Math.floor(30 / Math.min(extractedDependencies.length, 3))}
  }`).join(',')}
]`}
                        </pre>
                      </div>
                      <p className="text-xs text-slate-600 mt-3">
                        💡 <strong>Note:</strong> This is a sample format. Replace the addresses with real Cardano addresses and adjust percentages to total 100%.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 rounded-lg p-4">
                      <div>
                        <span className="text-slate-600">Dependencies to Fund:</span>
                        <span className="font-medium ml-2">{extractedDependencies.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Action Required:</span>
                        <span className="font-medium ml-2 text-orange-600">Create contributors.txt</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="default"
                        size="sm"
                        className="bg-cardano-600 hover:bg-cardano-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Sample File
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Sample
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}